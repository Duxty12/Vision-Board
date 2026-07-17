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
    const cardData = {
      ...input,
      user_id: userId,
      board_id: input.board_id || boardId,
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
 */
export async function updateCard(id: string, input: UpdateCardInput): Promise<CardWithRelations> {
  try {
    const { userId, supabase } = await getAuthUserContext();
    const { data, error } = await supabase
      .from('cards')
      .update({ ...input, updated_at: new Date().toISOString() })
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
 * Delete a card.
 */
export async function deleteCard(id: string): Promise<void> {
  try {
    const { userId, supabase } = await getAuthUserContext();
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

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
