'use server';

import { getAuthUserContext } from './utils';
import type { Subtask, CreateSubtaskInput } from '../types';
import { revalidatePath } from 'next/cache';

/**
 * Get all subtasks for a card, ordered by position.
 */
export async function getSubtasks(cardId: string): Promise<Subtask[]> {
  try {
    const { supabase } = await getAuthUserContext();
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('card_id', cardId)
      .order('position', { ascending: true });

    if (error) throw error;
    return (data || []) as Subtask[];
  } catch (error) {
    console.error(`Error fetching subtasks for card ${cardId}:`, error);
    throw error;
  }
}

/**
 * Create a subtask.
 */
export async function createSubtask(input: CreateSubtaskInput): Promise<Subtask> {
  try {
    const { supabase } = await getAuthUserContext();
    const { data, error } = await supabase
      .from('subtasks')
      .insert(input)
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/tasks');
    revalidatePath('/dashboard');

    return data as Subtask;
  } catch (error) {
    console.error('Error creating subtask:', error);
    throw error;
  }
}

/**
 * Toggle a subtask completed status.
 */
export async function toggleSubtaskCompleted(id: string): Promise<Subtask> {
  try {
    const { supabase } = await getAuthUserContext();
    
    const { data: current, error: fetchError } = await supabase
      .from('subtasks')
      .select('is_completed')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('subtasks')
      .update({ is_completed: !current.is_completed })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/tasks');
    revalidatePath('/dashboard');

    return data as Subtask;
  } catch (error) {
    console.error(`Error toggling subtask ${id}:`, error);
    throw error;
  }
}

/**
 * Update a subtask title.
 */
export async function updateSubtaskTitle(id: string, title: string): Promise<Subtask> {
  try {
    const { supabase } = await getAuthUserContext();
    const { data, error } = await supabase
      .from('subtasks')
      .update({ title })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    revalidatePath('/tasks');
    revalidatePath('/dashboard');

    return data as Subtask;
  } catch (error) {
    console.error(`Error updating subtask ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a subtask.
 */
export async function deleteSubtask(id: string): Promise<void> {
  try {
    const { supabase } = await getAuthUserContext();
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/tasks');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error(`Error deleting subtask ${id}:`, error);
    throw error;
  }
}

/**
 * Reorder subtasks.
 */
export async function reorderSubtasks(subtasks: { id: string; position: number }[]): Promise<void> {
  try {
    const { supabase } = await getAuthUserContext();

    // Use individual updates since upsert requires all non-nullable fields
    for (const { id, position } of subtasks) {
      const { error } = await supabase
        .from('subtasks')
        .update({ position })
        .eq('id', id);

      if (error) throw error;
    }

    revalidatePath('/tasks');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error reordering subtasks:', error);
    throw error;
  }
}
