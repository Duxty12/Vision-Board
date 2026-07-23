'use server';

import { getAuthUserContext } from './utils';
import { revalidatePath } from 'next/cache';
import type { Media } from '../types';

interface CreateMediaInput {
  card_id: string;
  media_type: 'image' | 'video';
  storage_path?: string | null;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
  thumbnail_url?: string | null;
}

/**
 * Associate media (image or YouTube video) with a card.
 * Verifies that the card is owned by the current authenticated user.
 */
export async function createMedia(input: CreateMediaInput): Promise<Media> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    // Verify card ownership
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('id')
      .eq('id', input.card_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (cardError || !card) {
      throw new Error('Unauthorized: Card not found or not owned by user');
    }

    // Insert media record
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .insert({
        card_id: input.card_id,
        media_type: input.media_type,
        storage_path: input.storage_path || null,
        youtube_url: input.youtube_url || null,
        youtube_video_id: input.youtube_video_id || null,
        thumbnail_url: input.thumbnail_url || null,
      })
      .select()
      .single();

    if (mediaError) throw mediaError;

    revalidatePath('/goals');
    revalidatePath('/tasks');
    revalidatePath('/dashboard');

    return media as Media;
  } catch (error) {
    console.error('Error creating media:', error);
    throw error;
  }
}

/**
 * Remove a media record.
 * Verifies ownership through the parent card, and deletes any associated
 * files from the `board-media` Supabase Storage bucket.
 */
export async function deleteMedia(id: string): Promise<{ success: boolean }> {
  try {
    const { userId, supabase } = await getAuthUserContext();

    // Fetch the media record with parent card user_id
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('*, cards(user_id)')
      .eq('id', id)
      .single() as any;

    if (fetchError || !media) {
      throw new Error('Media record not found');
    }

    // Verify ownership
    const cardOwnerId = (media as any).cards?.user_id;
    if (cardOwnerId !== userId) {
      throw new Error('Unauthorized: Card not owned by user');
    }

    // Delete record from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Delete file from Supabase Storage if it's an uploaded image
    if (media.media_type === 'image' && media.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('board-media')
        .remove([media.storage_path]);

      if (storageError) {
        console.error(`[deleteMedia] Storage file deletion failed for ${media.storage_path}:`, storageError);
        // We continue since the database row is already deleted
      }
    }

    revalidatePath('/goals');
    revalidatePath('/tasks');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error(`Error deleting media ${id}:`, error);
    throw error;
  }
}

/**
 * Upload a media file to the Supabase Storage bucket server-side.
 * Resolves user database context and uploads to the per-user storage folder.
 */
export async function uploadMediaFile(formData: FormData, cardId: string): Promise<{ path: string }> {
  try {
    const { userId, supabase } = await getAuthUserContext();
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided in FormData');
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const targetCardId = cardId || `temp-${crypto.randomUUID()}`;
    const storagePath = `${userId}/${targetCardId}/${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error: uploadError } = await supabase.storage
      .from('board-media')
      .upload(storagePath, buffer, {
        contentType: file.type,
        duplex: 'half',
      } as any);

    if (uploadError) {
      console.error('[uploadMediaFile] Supabase Storage upload error:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}. Ensure the 'board-media' bucket exists in Supabase Storage.`);
    }

    return { path: data.path };
  } catch (error: any) {
    console.error('Error in uploadMediaFile server action:', error);
    throw new Error(error?.message || 'Failed to upload file.');
  }
}
