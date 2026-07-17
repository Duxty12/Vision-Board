import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Helper to resolve the authenticated user's internal database UUID
 * and their default or first board ID.
 *
 * Throws an error if the user is not signed in or not found in the DB.
 */
export async function getAuthUserContext() {
  const { userId: clerkId } = auth();
  if (!clerkId) {
    throw new Error('Unauthorized: User not signed in');
  }

  const supabase = await createServerClient();

  // Fetch internal user ID mapped from Clerk ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (userError || !user) {
    throw new Error(`User not found in database for Clerk ID: ${clerkId}`);
  }

  // Fetch the default board for the user
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .single();

  if (boardError || !board) {
    // Fallback: get the first board created by the user if no default exists
    const { data: firstBoard, error: firstBoardError } = await supabase
      .from('boards')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (firstBoardError || !firstBoard) {
      throw new Error(`No board found for user: ${user.id}`);
    }

    return {
      userId: user.id,
      boardId: firstBoard.id,
      supabase,
    };
  }

  return {
    userId: user.id,
    boardId: board.id,
    supabase,
  };
}
