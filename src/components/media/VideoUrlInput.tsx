'use client';

import React, { useState, useEffect } from 'react';
import { Youtube, Link, Trash2, Loader2, AlertCircle, Play } from 'lucide-react';
import { parseYouTubeVideoId } from '@/lib/youtube/parse';

interface VideoUrlInputProps {
  value?: {
    youtube_url: string | null;
    youtube_video_id: string | null;
    thumbnail_url: string | null;
    title?: string | null;
  } | null;
  onSelect: (videoInfo: {
    youtubeUrl: string;
    youtubeVideoId: string;
    thumbnailUrl: string;
    title: string;
  }) => void;
  onRemove: () => void;
}

export function VideoUrlInput({ value, onSelect, onRemove }: VideoUrlInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize input value if editing
  useEffect(() => {
    if (value?.youtube_url) {
      setInputValue(value.youtube_url);
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleResolveVideo = async (urlStr: string) => {
    if (!urlStr.trim()) return;

    const videoId = parseYouTubeVideoId(urlStr);
    if (!videoId) {
      setError('Invalid YouTube link. Please paste a watch, embed, shorts, or youtu.be URL.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/youtube/oembed?url=${encodeURIComponent(urlStr)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch YouTube metadata.');
      }

      onSelect({
        youtubeUrl: urlStr,
        youtubeVideoId: data.videoId,
        thumbnailUrl: data.thumbnail_url,
        title: data.title,
      });
    } catch (err: any) {
      console.error('[VideoUrlInput] Fetch error:', err);
      // Fail gracefully: still save it with a default title using the parsed videoId
      // because sometimes metadata is blocked or oEmbed rate-limited, but we want the embed to still work!
      const fallbackThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      onSelect({
        youtubeUrl: urlStr,
        youtubeVideoId: videoId,
        thumbnailUrl: fallbackThumbnail,
        title: 'YouTube Video',
      });
      setError('Could not fetch video info from YouTube. Saved with a fallback preview.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleResolveVideo(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      handleResolveVideo(pastedText);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setError(null);
    onRemove();
  };

  const hasVideo = !!value?.youtube_video_id;

  return (
    <div className="w-full font-sans">
      {error && (
        <div className="mb-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-xl border border-amber-100 text-xs flex items-start gap-1.5 animate-[fade-in_0.2s_ease-out]">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {hasVideo ? (
        <div className="relative group rounded-xl border border-stone-200 overflow-hidden bg-stone-50 flex items-center p-3 gap-3 pr-12 transition-all">
          {/* Thumbnail preview with play overlay */}
          <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-200/50">
            {value.thumbnail_url ? (
              <img
                src={value.thumbnail_url}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-stone-900 flex items-center justify-center">
                <Youtube size={24} className="text-rose-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center text-stone-850 scale-95 group-hover:scale-105 transition-all">
                <Play size={10} className="fill-stone-850 translate-x-[0.5px]" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-stone-850 line-clamp-2 leading-snug">
              {value.title || 'YouTube Video'}
            </h4>
            <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1 font-medium">
              <Youtube size={10} className="text-rose-600" />
              youtube.com/watch?v={value.youtube_video_id}
            </p>
          </div>

          {/* Remove Action */}
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
            title="Remove video"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-cork-500" />
            ) : (
              <Link size={16} />
            )}
          </div>
          <input
            type="text"
            placeholder="Paste YouTube link here... (and press Enter)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={isLoading}
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-stone-200 bg-white placeholder:text-stone-400 text-stone-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-cork-400 focus:border-transparent transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => handleResolveVideo(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-bold shadow hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
          >
            {isLoading ? 'Loading...' : 'Add Link'}
          </button>
        </div>
      )}
    </div>
  );
}
