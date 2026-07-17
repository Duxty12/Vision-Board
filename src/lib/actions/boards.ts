'use server';

import { revalidatePath } from 'next/cache';
import { getAuthUserContext } from './utils';
import type { CreateBoardInput, UpdateBoardInput, Board, BoardWithCount } from '@/lib/types';

/**
 * Get all boards for the current user, with per-board card counts.
 * Used by the Collections page board grid.
 */
export async function getUserBoards(): Promise<BoardWithCount[]> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('boards')
      .select('*, cards(count)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }) as any;

    if (error) throw error;

    return (data || []).map((board: any) => ({
      ...board,
      card_count: board.cards?.[0]?.count ?? 0,
      cards: undefined,
    })) as BoardWithCount[];
  } catch (error) {
    console.error('Error fetching boards:', error);
    throw error;
  }
}

/**
 * Get the user's default board (the one that renders on the Dashboard canvas).
 */
export async function getDefaultBoard(): Promise<Board | null> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single() as any;

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data ?? null;
  } catch (error) {
    console.error('Error fetching default board:', error);
    throw error;
  }
}

/**
 * Get all starred boards for the current user.
 * Used by the Dashboard's featured boards strip.
 */
export async function getStarredBoards(): Promise<BoardWithCount[]> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('boards')
      .select('*, cards(count)')
      .eq('user_id', userId)
      .eq('is_starred', true)
      .order('created_at', { ascending: true }) as any;

    if (error) throw error;

    return (data || []).map((board: any) => ({
      ...board,
      card_count: board.cards?.[0]?.count ?? 0,
      cards: undefined,
    })) as BoardWithCount[];
  } catch (error) {
    console.error('Error fetching starred boards:', error);
    throw error;
  }
}

/**
 * Get a single board by ID (must belong to the current user).
 */
export async function getBoard(id: string): Promise<Board> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single() as any;

    if (error) throw error;
    return data as Board;
  } catch (error) {
    console.error(`Error fetching board ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new board for the current user.
 */
export async function createBoard(input: CreateBoardInput): Promise<Board> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('boards')
      .insert({
        user_id: userId,
        title: input.title || 'My Vision Board',
        theme: input.theme || 'cork',
        is_default: false,
        is_starred: false,
      })
      .select()
      .single() as any;

    if (error) throw error;

    revalidatePath('/collections');
    revalidatePath('/dashboard');

    return data as Board;
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;
  }
}

/**
 * Update a board (title, theme, is_starred, is_default).
 */
export async function updateBoard(id: string, input: UpdateBoardInput): Promise<Board> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('boards')
      .update(input)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single() as any;

    if (error) throw error;

    revalidatePath('/collections');
    revalidatePath('/dashboard');
    revalidatePath(`/collections/${id}`);

    return data as Board;
  } catch (error) {
    console.error(`Error updating board ${id}:`, error);
    throw error;
  }
}

/**
 * Toggle the is_starred flag for a board.
 * Starred boards appear in the Dashboard's featured boards strip.
 */
export async function toggleBoardStarred(id: string): Promise<Board> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    // Fetch current state
    const { data: current, error: fetchError } = await supabase
      .from('boards')
      .select('is_starred')
      .eq('id', id)
      .eq('user_id', userId)
      .single() as any;

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('boards')
      .update({ is_starred: !current.is_starred })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single() as any;

    if (error) throw error;

    revalidatePath('/collections');
    revalidatePath('/dashboard');

    return data as Board;
  } catch (error) {
    console.error(`Error toggling star for board ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a board (cascades to its cards, media, and stickers).
 * Only non-default boards can be deleted.
 */
export async function deleteBoard(id: string): Promise<{ success: boolean }> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    // Prevent deleting the default board
    const { data: board, error: fetchError } = await supabase
      .from('boards')
      .select('is_default')
      .eq('id', id)
      .eq('user_id', userId)
      .single() as any;

    if (fetchError) throw fetchError;
    if (board?.is_default) {
      throw new Error('Cannot delete the default board.');
    }

    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    revalidatePath('/collections');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error(`Error deleting board ${id}:`, error);
    throw error;
  }
}
