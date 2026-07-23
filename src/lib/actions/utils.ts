import { cache } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Helper to resolve the authenticated user's internal database UUID
 * and their default or first board ID.
 *
 * Uses React `cache()` to deduplicate lookups within a single request.
 *
 * Uses the SERVICE ROLE client so lookups are not blocked by RLS
 * (which needs a Clerk JWT template — see server.ts for setup).
 *
 * Security is enforced at the application layer:
 *   1. Clerk middleware protects all /(app)/* routes.
 *   2. Every card/subtask query explicitly filters by the resolved user_id.
 *
 * FALLBACK: If the Clerk webhook hasn't synced this user to the DB yet
 * (e.g. during development), we auto-create the user + default board row
 * on first access using Clerk's currentUser() API.
 */
export const getAuthUserContext = cache(async () => {
  const { userId: clerkId } = auth();
  if (!clerkId) {
    throw new Error('Unauthorized: User not signed in');
  }

  // Service role bypasses RLS — safe here because this is server-side only.
  const supabase = createServiceRoleClient();

  // ── 1. Find or auto-create the user row ──────────────────────────────────
  let { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (!user) {
    // Webhook hasn't run (common in dev). Fetch user details from Clerk and
    // create the row ourselves so the app can proceed immediately.
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error('Unauthorized: Could not fetch Clerk user details');
    }

    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      '';

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      null;

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .upsert(
        { clerk_id: clerkId, email, name, onboarding_complete: false },
        { onConflict: 'clerk_id', ignoreDuplicates: false },
      )
      .select('id')
      .single();

    if (createError || !newUser) {
      throw new Error(
        `Failed to auto-create user record: ${createError?.message}`,
      );
    }

    user = newUser;
    console.log(`[getAuthUserContext] ✅ Auto-created user row: ${user.id}`);
  }

  // ── 2. Find or auto-create the default board ──────────────────────────────
  let { data: board } = await supabase
    .from('boards')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .maybeSingle();

  if (!board) {
    // Check for any board first (in case there's one without is_default=true)
    const { data: anyBoard } = await supabase
      .from('boards')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (anyBoard) {
      board = anyBoard;
    } else {
      // Create a default board
      const { data: newBoard, error: boardError } = await supabase
        .from('boards')
        .insert({
          user_id: user.id,
          title: 'My Vision Board',
          theme: 'cork',
          is_default: true,
        })
        .select('id')
        .single();

      if (boardError || !newBoard) {
        throw new Error(
          `Failed to auto-create default board: ${boardError?.message}`,
        );
      }

      board = newBoard;
      console.log(`[getAuthUserContext] ✅ Auto-created default board: ${board.id}`);
    }
  }

  return {
    userId: user.id,
    boardId: board.id,
    supabase,
  };
});
