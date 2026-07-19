import { NextResponse } from 'next/server';
import { getAuthUserContext } from '@/lib/actions/utils';

export async function POST(req: Request) {
  try {
    const { userId, supabase } = await getAuthUserContext();

    // Read the image blob from request body
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `board-screenshots/${userId}/${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('board-media')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('board-media')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error('[POST /api/email/upload-screenshot] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
