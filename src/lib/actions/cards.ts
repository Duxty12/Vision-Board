'use server';

import { getAuthUserContext } from './utils';
import type { Card, CardType, CardWithRelations, CreateCardInput, UpdateCardInput } from '../types';
import { revalidatePath } from 'next/cache';

/**
 * Fetch cards owned by the user, filtered and sorted appropriately.
 */
export async function getCards(filters?: {
  type?: CardType;
  is_completed?: boolean;
  is_starred?: boolean;
  category?: string;
}): Promise<CardWithRelations[]> {
  try {
    const { userId, supabase } = await getAuthUserContext();
    let query = supabase
      .from('cards')
      .select('*, subtasks(*), media(*)')
      .eq('user_id', userId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.is_completed !== undefined) {
      query = query.eq('is_completed', filters.is_completed);
    }
    if (filters?.is_starred !== undefined) {
      query = query.eq('is_starred', filters.is_starred);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    // Default sorting
    if (filters?.type === 'task') {
      query = query
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as CardWithRelations[];
  } catch (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
}

/**
 * Fetch a single card with its relations.
 */
export async function getCardById(id: string): Promise<CardWithRelations> {
  try {
    const { userId, supabase } = await getAuthUserContext();
    const { data, error } = await supabase
      .from('cards')
      .select('*, subtasks(*), media(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as CardWithRelations;
  } catch (error) {
    console.error(`Error fetching card ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new card.
 */
export async function createCard(input: CreateCardInput): Promise<CardWithRelations> {
  try {
    const { userId, boardId, supabase } = await getAuthUserContext();
    const targetBoardId = input.board_id || boardId;

    // Calculate highest z_index so newly added cards always appear on top
    let newZIndex = input.z_index;
    if (!newZIndex || newZIndex <= 1) {
      const { data: maxCard } = await supabase
        .from('cards')
        .select('z_index')
        .eq('board_id', targetBoardId)
        .order('z_index', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: maxSticker } = await supabase
        .from('stickers')
        .select('z_index')
        .eq('board_id', targetBoardId)
        .order('z_index', { ascending: false })
        .limit(1)
        .maybeSingle();

      const topCardZ = maxCard?.z_index || 1;
      const topStickerZ = maxSticker?.z_index || 1;
      newZIndex = Math.max(topCardZ, topStickerZ, 1) + 1;
    }

    const cardData = {
      ...input,
      z_index: newZIndex,
      user_id: userId,
      board_id: targetBoardId,
    };

    const { data, error } = await supabase
      .from('cards')
      .insert(cardData)
      .select('*, subtasks(*), media(*)')
      .single();

    if (error) throw error;
    
    revalidatePath('/goals');
    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    
    return data as CardWithRelations;
  } catch (error) {
    console.error('Error creating card:', error);
    throw error;
  }
}

/**
 * Update an existing card.
 * board_id is intentionally excluded — it should not change after creation.
 * Position/layout fields (position_x/y, width, height, z_index, rotation)
 * are updated separately by the drag-and-drop system in Phase 4.
 */
export async function updateCard(id: string, input: UpdateCardInput): Promise<CardWithRelations> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    // Strip fields that must not change via the editor modal.
    // board_id arriving as '' from CardEditorModal would fail UUID validation.
    const {
      board_id: _board_id,
      position_x: _px,
      position_y: _py,
      width: _w,
      height: _h,
      z_index: _z,
      rotation: _rot,
      ...safeInput
    } = input as UpdateCardInput & {
      board_id?: string;
      position_x?: number;
      position_y?: number;
      width?: number;
      height?: number;
      z_index?: number;
      rotation?: number;
    };

    const { data, error } = await supabase
      .from('cards')
      .update({ ...safeInput, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, subtasks(*), media(*)')
      .single();

    if (error) throw error;

    revalidatePath('/goals');
    revalidatePath('/tasks');
    revalidatePath('/dashboard');

    return data as CardWithRelations;
  } catch (error) {
    console.error(`Error updating card ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch all cards for a specific board (for the canvas view).
 * Ordered by z_index so layering is correct.
 */
export async function getBoardCards(boardId: string): Promise<CardWithRelations[]> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('cards')
      .select('*, subtasks(*), media(*)')
      .eq('board_id', boardId)
      .eq('user_id', userId)
      .order('z_index', { ascending: true });

    if (error) throw error;
    return (data || []) as CardWithRelations[];
  } catch (error) {
    console.error(`Error fetching cards for board ${boardId}:`, error);
    throw error;
  }
}

/**
 * Update a card's canvas position and z_index (used by dnd-kit drag end).
 * This is a lightweight action separate from the full card editor update.
 */
export async function updateCardPosition(
  id: string,
  position: { position_x: number; position_y: number; z_index?: number },
): Promise<Card> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('cards')
      .update({
        position_x: position.position_x,
        position_y: position.position_y,
        ...(position.z_index !== undefined ? { z_index: position.z_index } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Note: intentionally NOT calling revalidatePath('/dashboard') here.
    // The client already applied an optimistic update; revalidating would
    // push fresh server props and overwrite the local state (causing the
    // visible position/size revert). The DB is updated correctly regardless.
    return data as Card;
  } catch (error) {
    console.error(`Error updating card position ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a card.
 */
export async function deleteCard(id: string): Promise<void> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    // Fetch associated media to clean up storage files before RLS/cascade deletion
    const { data: mediaItems } = await supabase
      .from('media')
      .select('storage_path')
      .eq('card_id', id)
      .eq('media_type', 'image');

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    // Clean up files in storage
    if (mediaItems && mediaItems.length > 0) {
      const pathsToDelete = mediaItems.map(m => m.storage_path).filter(Boolean) as string[];
      if (pathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('board-media')
          .remove(pathsToDelete);
        if (storageError) {
          console.error(`[deleteCard] Failed to delete media files from storage:`, storageError);
        }
      }
    }

    revalidatePath('/goals');
    revalidatePath('/tasks');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error(`Error deleting card ${id}:`, error);
    throw error;
  }
}

/**
 * Toggle card completed status.
 */
export async function toggleCardCompleted(id: string): Promise<CardWithRelations> {
  try {
    const { userId, supabase } = await getAuthUserContext();
    
    const { data: currentCard, error: fetchError } = await supabase
      .from('cards')
      .select('is_completed')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('cards')
      .update({ is_completed: !currentCard.is_completed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, subtasks(*), media(*)')
      .single();

    if (error) throw error;

    revalidatePath('/goals');
    revalidatePath('/tasks');
    revalidatePath('/dashboard');

    return data as CardWithRelations;
  } catch (error) {
    console.error(`Error toggling card completed ${id}:`, error);
    throw error;
  }
}

/**
 * Toggle card starred status.
 */
export async function toggleCardStarred(id: string): Promise<CardWithRelations> {
  try {
    const { userId, supabase } = await getAuthUserContext();
    
    const { data: currentCard, error: fetchError } = await supabase
      .from('cards')
      .select('is_starred')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('cards')
      .update({ is_starred: !currentCard.is_starred, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, subtasks(*), media(*)')
      .single();

    if (error) throw error;

    revalidatePath('/goals');
    revalidatePath('/tasks');
    revalidatePath('/dashboard');

    return data as CardWithRelations;
  } catch (error) {
    console.error(`Error toggling card starred ${id}:`, error);
    throw error;
  }
}

/**
 * Update a card's dimensions (width and height), maintaining RLS.
 */
export async function updateCardDimensions(
  id: string,
  dimensions: { width: number; height: number }
): Promise<Card> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    const { data, error } = await supabase
      .from('cards')
      .update({
        width: dimensions.width,
        height: dimensions.height,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Note: intentionally NOT calling revalidatePath('/dashboard') here.
    // Same reason as updateCardPosition — client state is already correct.
    return data as Card;
  } catch (error) {
    console.error(`Error updating card dimensions ${id}:`, error);
    throw error;
  }
}
