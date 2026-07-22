'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Image, UploadCloud, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { uploadMediaFile } from '@/lib/actions/media';

interface ImageDropzoneProps {
  cardId?: string; // Optional: card ID if editing
  value?: string | null; // Current storage path if already attached
  onUploadSuccess: (storagePath: string) => void;
  onRemove: () => void;
}

export function ImageDropzone({
  cardId,
  value,
  onUploadSuccess,
  onRemove,
}: ImageDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preview URL if value changes (initial render or after upload)
  useEffect(() => {
    if (value) {
      if (value.startsWith('http://') || value.startsWith('https://')) {
        setPreviewUrl(value);
      } else {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/board-media/${value}`;
        setPreviewUrl(publicUrl);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Max size: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 5MB.');
      return false;
    }

    // MIME types: images only
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.');
      return false;
    }

    setError(null);
    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 1. Pack file into FormData
      const formData = new FormData();
      formData.append('file', file);

      // 2. Upload via server action
      const result = await uploadMediaFile(formData, cardId || '');

      // 3. Callback on success
      onUploadSuccess(result.path);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {error && (
        <div className="mb-2 bg-rose-50 text-rose-600 px-3 py-2 rounded-xl border border-rose-100 text-xs flex items-center gap-1.5 animate-[fade-in_0.2s_ease-out]">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {previewUrl ? (
        <div className="relative group overflow-hidden rounded-xl border border-stone-200 aspect-video bg-stone-100 flex items-center justify-center">
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-3 py-1.5 bg-white/95 text-stone-700 rounded-lg text-xs font-bold shadow hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <UploadCloud size={14} />
              Replace
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow hover:bg-rose-750 transition-all flex items-center justify-center cursor-pointer"
              title="Delete image"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[160px] ${
            isDragActive
              ? 'border-cork-500 bg-cork-50/30'
              : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/40 bg-white'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="text-cork-500 animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-700">Uploading image...</p>
                <p className="text-[10px] text-stone-400">Please wait a moment</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:text-stone-500 transition-colors">
                <UploadCloud size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-700">
                  Drag and drop image or <span className="text-cork-600 hover:underline">browse</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-1">
                  Supports JPG, PNG, GIF, WebP, SVG up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
