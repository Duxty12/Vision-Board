import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// cookies() is called inside createServerClient — must be dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Server-side Supabase connection test.
 * Uses the publishable-key client to call auth.getSession().
 * Safe to call on an empty database — does not query any tables.
 * Note: SUPABASE_SERVICE_ROLE_KEY is not required for this check.
 */
export async function GET() {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      console.error('[Supabase] ❌ Connection test failed:', error.message);
      return NextResponse.json(
        { ok: false, error: error.message, url: process.env.NEXT_PUBLIC_SUPABASE_URL },
        { status: 500 },
      );
    }

    console.log(
      '[Supabase] ✅ Connection successful — reached',
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );

    return NextResponse.json({
      ok: true,
      message: 'Supabase connection successful',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Supabase] ❌ Unexpected error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
