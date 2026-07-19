import { NextResponse } from 'next/server';
import { getAuthUserContext } from '@/lib/actions/utils';
import { sendBoardShareEmail } from '@/lib/resend/client';

export async function POST(req: Request) {
  try {
    const { userId, boardId: defaultBoardId, supabase } = await getAuthUserContext();

    // ── 1. Read optional boardId from request body ────────────────────────────
    let targetBoardId: string = defaultBoardId;
    let boardTitle = 'My Vision Board';

    try {
      const body = await req.json();
      if (body?.boardId) {
        targetBoardId = body.boardId;
      }
    } catch {
      // No body or not valid JSON — use defaults
    }

    // ── 2. Fetch user's email & name ──────────────────────────────────────────
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // ── 3. Fetch board metadata (title) ───────────────────────────────────────
    const { data: board } = await supabase
      .from('boards')
      .select('title')
      .eq('id', targetBoardId)
      .eq('user_id', userId)
      .single();

    if (board?.title) {
      boardTitle = board.title;
    }

    // ── 4. Query ALL cards on the board with their media ──────────────────────
    const { data: allCards, error: cardsError } = await supabase
      .from('cards')
      .select('*, media(*)')
      .eq('board_id', targetBoardId)
      .eq('user_id', userId)
      .order('z_index', { ascending: true });

    if (cardsError) {
      throw cardsError;
    }

    // ── 5. Resolve public URLs for any image media in Supabase Storage ────────
    const cardsWithResolvedMedia = (allCards || []).map((card: any) => {
      const mediaWithUrls = card.media?.map((med: any) => {
        if (med.media_type === 'image' && med.storage_path) {
          const { data } = supabase.storage
            .from('board-media')
            .getPublicUrl(med.storage_path);
          return { ...med, public_url: data.publicUrl };
        }
        return med;
      });
      return { ...card, media: mediaWithUrls };
    });

    // ── 6. Send email via Resend ──────────────────────────────────────────────
    await sendBoardShareEmail(
      user.email,
      user.name || undefined,
      boardTitle,
      cardsWithResolvedMedia,
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/email/send-board] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
