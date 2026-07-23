'use server';

import { revalidatePath } from 'next/cache';
import { getAuthUserContext } from './utils';
import type { Sticker, CreateStickerInput, StickerType } from '@/lib/types';

/**
 * Get all stickers for a board.
 */
export async function getBoardStickers(boardId: string): Promise<Sticker[]> {
  try {
    const { supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('stickers')
      .select('*')
      .eq('board_id', boardId)
      .order('z_index', { ascending: true });

    if (error) throw error;
    return (data || []) as Sticker[];
  } catch (error) {
    console.error(`Error fetching stickers for board ${boardId}:`, error);
    throw error;
  }
}

/**
 * Add a sticker to a board.
 */
export async function addSticker(input: CreateStickerInput): Promise<Sticker> {
  try {
    const { supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('stickers')
      .insert({
        board_id: input.board_id,
        sticker_type: input.sticker_type,
        position_x: input.position_x ?? 100,
        position_y: input.position_y ?? 100,
        rotation: input.rotation ?? 0,
        scale: input.scale ?? 1,
        z_index: input.z_index ?? 10,
      })
      .select()
      .single();

    if (error) throw error;

    // No revalidatePath — DashboardClient adds the new sticker to local state directly.
    return data as Sticker;
  } catch (error) {
    console.error('Error adding sticker:', error);
    throw error;
  }
}

/**
 * Update a sticker's position, rotation, scale, z_index.
 */
export async function updateSticker(
  id: string,
  updates: {
    position_x?: number;
    position_y?: number;
    rotation?: number;
    scale?: number;
    z_index?: number;
  },
): Promise<Sticker> {
  try {
    const { supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('stickers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // No revalidatePath — client already applied optimistic update.
    return data as Sticker;
  } catch (error) {
    console.error(`Error updating sticker ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a sticker.
 */
export async function deleteSticker(id: string): Promise<{ success: boolean }> {
  try {
    const { supabase } = await getAuthUserContext();

    const { error } = await supabase
      .from('stickers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // No revalidatePath — client already applied optimistic update.
    return { success: true };
  } catch (error) {
    console.error(`Error deleting sticker ${id}:`, error);
    throw error;
  }
}
