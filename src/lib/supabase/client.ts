import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types';

/**
 * Supabase browser client.
 * Use in Client Components ('use client') for realtime subscriptions
 * or any client-side data fetching.
 *
 * For Server Components and Server Actions, use the server client instead.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
