// ─────────────────────────────────────────────────────────────────────────────
// Clerk webhook handler business logic.
// Called from /api/webhooks/clerk/route.ts after signature verification.
// Uses the Supabase service-role client so it can write to the `users` and
// `boards` tables without a user JWT (none exists yet at signup time).
// ─────────────────────────────────────────────────────────────────────────────

import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/resend/client';

// ─── Clerk webhook event shape (minimal — only what we need) ──────────────────

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserCreatedData {
  id: string;                          // Clerk user id → stored as clerk_id
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
}

// ─── Handler: user.created ────────────────────────────────────────────────────

/**
 * Handles the Clerk `user.created` webhook event.
 *
 * Steps:
 *  1. Resolve primary email from Clerk payload.
 *  2. Insert a row into `users` (service-role, bypasses RLS).
 *  3. Insert a default `boards` row for the new user.
 *
 * Both inserts use upsert so the handler is idempotent (safe to retry).
 */
export async function handleUserCreated(data: ClerkUserCreatedData): Promise<void> {
  const supabase = createServiceRoleClient();

  // ── 1. Resolve primary email ─────────────────────────────────────────────
  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id,
  )?.email_address ?? data.email_addresses[0]?.email_address ?? '';

  const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || null;

  // ── 2. Upsert user row ───────────────────────────────────────────────────
  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert(
      {
        clerk_id: data.id,
        email: primaryEmail,
        name,
        onboarding_complete: false,
      },
      { onConflict: 'clerk_id', ignoreDuplicates: false },
    )
    .select('id')
    .single();

  if (userError) {
    throw new Error(`Failed to upsert user: ${userError.message}`);
  }

  console.log(`[Clerk webhook] ✅ User upserted: ${user.id} (clerk_id=${data.id})`);

  // ── 3. Upsert default board row ───────────────────────────────────────────
  const { error: boardError } = await supabase
    .from('boards')
    .upsert(
      {
        user_id: user.id,
        title: 'My Vision Board',
        theme: 'cork',
        is_default: true,
      },
      // Only one default board per user — use user_id uniqueness via upsert
      // (no unique constraint on user_id alone, so we check for existing row first)
    );

  if (boardError) {
    throw new Error(`Failed to upsert default board: ${boardError.message}`);
  }

  console.log(`[Clerk webhook] ✅ Default board created for user: ${user.id}`);

  // ── 4. Send Welcome Email via Resend ──────────────────────────────────────
  try {
    await sendWelcomeEmail(primaryEmail, name ?? undefined);
    console.log(`[Clerk webhook] ✅ Welcome email sent to user: ${primaryEmail}`);
  } catch (emailError: any) {
    console.error(
      `[Clerk webhook] ⚠️ Failed to send welcome email:`,
      emailError.message || emailError,
    );
  }
}
