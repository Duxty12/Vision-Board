import { createServerClient as _createServerClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types';
import { auth } from '@clerk/nextjs/server';

/**
 * Supabase server client (RLS-respecting).
 * Use in Server Components and Server Actions.
 * Forwards the user's cookie session so Supabase RLS can apply.
 *
 * Pair with a Clerk JWT template named "supabase" to pass the Clerk JWT
 * as the Supabase auth token, enabling RLS via auth.jwt()->>'sub'.
 */
export async function createServerClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const { getToken } = auth();
  const token = await getToken({ template: 'supabase' });

  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component context — cookies are read-only during render.
            // This is expected; mutations happen in Server Actions / Route Handlers.
          }
        },
      },
      global: {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    },
  ) as unknown as SupabaseClient<Database>;
}

/**
 * Supabase service-role client (bypasses RLS).
 * Use ONLY in:
 *   - Clerk webhook handlers (no user JWT available)
 *   - Admin-only operations
 *
 * Never expose to the client.
 */
export function createServiceRoleClient(): SupabaseClient<Database> {
  return _createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  ) as unknown as SupabaseClient<Database>;
}
