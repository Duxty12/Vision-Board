'use client';

import React, { useState } from 'react';
import { Star, Flag, Calendar, RotateCcw, Tag, Type } from 'lucide-react';
import type { CardWithRelations } from '@/lib/types';

interface CardCompactViewProps {
  card: CardWithRelations;
  onClick?: () => void;
  onToggleCompleted?: (cardId: string) => void;
  onToggleStarred?: (cardId: string) => void;
  /** When true, videos don't play inline (drag mode). */
  isEditMode?: boolean;
}

// ── Clean modern checkbox ────────────────────────────────────────────────────────
function HandDrawnCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`w-4.5 h-4.5 inline-flex items-center justify-center rounded border-2 shrink-0 transition-all duration-150 cursor-pointer select-none ${
        checked
          ? 'bg-emerald-500 border-emerald-500'
          : 'bg-white/60 border-stone-400/70 hover:border-stone-600'
      }`}
      style={{ width: 18, height: 18, minWidth: 18 }}
    >
      {checked && (
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1.5,6 4.5,9 10.5,3" />
        </svg>
      )}
    </span>
  );
}

// ── Inline YouTube embed ───────────────────────────────────────────────────────
function YouTubeEmbed({ videoId, title }: { videoId: string; title?: string | null }) {
  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 */ }}>
      <iframe
        className="absolute inset-0 w-full h-full rounded border-0"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
        title={title || 'Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

// ── Flat 2D Pushpin ──
function Flat2DPushpin({ scale = 1 }: { scale?: number }) {
  const width = Math.round(20 * scale);
  const height = Math.round(28 * scale);
  const topOffset = -14 * scale;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none drop-shadow-sm"
      style={{ top: `${topOffset}px` }}
    >
      <svg width={width} height={height} viewBox="0 0 20 28" fill="none">
        {/* Pin needle — thin silver line */}
        <line x1="10" y1="14" x2="10" y2="27" stroke="#94a3b8" strokeWidth={1.5 * scale} strokeLinecap="round" />
        {/* Pin head — flat filled circle */}
        <circle cx="10" cy="8" r={7 * scale} fill="#ef4444" />
        {/* Inner shine crescent */}
        <path d={`M${6.5 * scale} ${5.5 * scale} Q ${8 * scale} ${4 * scale} ${10.5 * scale} ${5 * scale}`} stroke="#fca5a5" strokeWidth={1.4 * scale} strokeLinecap="round" fill="none" opacity="0.85" />
      </svg>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function CardCompactView({
  card,
  onClick,
  onToggleCompleted,
  onToggleStarred,
  isEditMode = false,
}: CardCompactViewProps) {
  const isGoal  = card.type === 'goal';
  const isTask  = card.type === 'task';
  const isQuote = card.type === 'quote';
  const isImage = card.type === 'image';
  const isVideo = card.type === 'video';

  const scale = (card.width || 220) / 220;

  // Caption toggle for image cards (per-session state)
  const [showCaption, setShowCaption] = useState(true);

  const rotationDegrees = card.rotation || (
    ((card.id.charCodeAt(0) + (card.id.charCodeAt(1) || 0)) % 6) - 3
  );

  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const isOverdue = card.due_date && new Date(card.due_date) < new Date() && !card.is_completed;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const getImageUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/board-media/${path}`;
  };

  const attachedImage = card.media?.find((m) => m.media_type === 'image');
  const attachedVideo = card.media?.find((m) => m.media_type === 'video');

  // Check if image is PNG to render transparent sticker style
  const isPng = isImage && !!attachedImage?.storage_path?.toLowerCase().endsWith('.png');

  // ── IMAGE card ──────────────────────────────────────────────────────────────
  if (isImage) {
    return (
      <div
        onClick={onClick}
        className="relative group cursor-pointer select-none"
        style={{ transform: `rotate(${rotationDegrees}deg)` }}
      >
        {/* Outer thin border frame — transparent/borderless/shadowless if PNG */}
        <div className={`relative overflow-hidden rounded-sm transition-all duration-200 ${
          isPng 
            ? 'bg-transparent border-transparent shadow-none hover:shadow-none hover:scale-105' 
            : 'border border-stone-300/70 shadow-[0_2px_12px_rgba(0,0,0,0.18)] bg-stone-100 hover:shadow-[0_6px_24px_rgba(0,0,0,0.24)]'
        }`}>
          {attachedImage ? (
            <img
              src={getImageUrl(attachedImage.storage_path!)}
              alt={card.title || 'Photo'}
              className="w-full h-auto block object-cover"
              style={{ display: 'block' }}
            />
          ) : (
            <div className="w-full min-h-[160px] flex items-center justify-center bg-stone-100 text-stone-400 text-xs font-sans">
              No image
            </div>
          )}

          {/* Caption overlay at bottom */}
          {(card.title || card.description) && showCaption && !isPng && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent px-3 py-2.5 pointer-events-none">
              {card.title && (
                <p className="text-white text-[11px] font-bold font-sans leading-tight drop-shadow line-clamp-1">
                  {card.title}
                </p>
              )}
              {card.description && (
                <p className="text-white/75 text-[9px] font-sans leading-tight mt-0.5 line-clamp-1">
                  {card.description}
                </p>
              )}
            </div>
          )}

          {/* Caption toggle + star: top-LEFT for PNG stickers, top-right for regular photos */}
          <div className={`absolute top-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 ${isPng ? 'left-1.5' : 'right-1.5'}`}>
            {/* Caption toggle — only on non-PNG photos */}
            {(card.title || card.description) && !isPng && (
              <button
                type="button"
                data-control="true"
                onClick={(e) => { e.stopPropagation(); setShowCaption((v) => !v); }}
                className={`p-1 rounded-full shadow backdrop-blur-sm transition-all ${showCaption ? 'bg-white/90 text-stone-700' : 'bg-black/40 text-white/80'}`}
                title={showCaption ? 'Hide caption' : 'Show caption'}
              >
                <Type size={10} />
              </button>
            )}
            {/* Star */}
            <button
              type="button"
              data-control="true"
              className="p-1 rounded-full bg-white/90 shadow backdrop-blur-sm text-stone-400 hover:text-amber-500 transition-all"
              onClick={(e) => { e.stopPropagation(); onToggleStarred?.(card.id); }}
            >
              <Star size={10} className={card.is_starred ? 'fill-amber-400 text-amber-400' : ''} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── VIDEO card (Twice as large) ──────────────────────────────────────────────
  if (isVideo) {
    const youtubeId = attachedVideo?.youtube_video_id;
    const storageVideoPath = attachedVideo?.storage_path;

    return (
      <div
        className="relative group select-none"
        style={{ transform: `rotate(${rotationDegrees}deg)` }}
      >
        {/* Card container — clean dark cinema style */}
        <div className="rounded-sm border border-stone-300/70 shadow-[0_4px_18px_rgba(0,0,0,0.22)] bg-[#0f0f0f] overflow-hidden transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.32)]">

          {/* Title bar */}
          {card.title && (
            <div className="flex items-center justify-between px-3 py-2 bg-[#181818] border-b border-white/8">
              <p className="text-white/90 text-xs font-bold font-sans leading-tight line-clamp-1 flex-1 min-w-0">
                {card.title}
              </p>
              {/* Star */}
              <button
                type="button"
                data-control="true"
                className="ml-1.5 shrink-0 text-white/30 hover:text-amber-400 transition-colors p-0.5 focus:outline-none"
                onClick={(e) => { e.stopPropagation(); onToggleStarred?.(card.id); }}
              >
                <Star size={12} className={card.is_starred ? 'fill-amber-400 text-amber-400' : ''} />
              </button>
            </div>
          )}

          {/* Video area — data-control="true" prevents click from opening editor */}
          <div
            data-control="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full"
          >
            {youtubeId && !isEditMode ? (
              <YouTubeEmbed videoId={youtubeId} title={card.title} />
            ) : youtubeId && isEditMode ? (
              /* In edit mode show thumbnail + overlay so user can still drag */
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 bg-stone-900 flex items-center justify-center">
                  {attachedVideo?.thumbnail_url ? (
                    <img
                      src={attachedVideo.thumbnail_url}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : null}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-red-600/90 shadow-lg flex items-center justify-center">
                      <svg className="w-5 h-5 fill-white translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <span className="text-white/50 text-[10px] font-sans mt-1">YouTube · drag to move</span>
                  </div>
                </div>
              </div>
            ) : storageVideoPath && !isEditMode ? (
              <video
                src={getImageUrl(storageVideoPath)}
                controls
                className="w-full block bg-black"
                style={{ maxHeight: '420px' }}
                preload="metadata"
              />
            ) : storageVideoPath && isEditMode ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center gap-1">
                  <svg className="w-8 h-8 fill-white/30" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <span className="text-white/40 text-[10px] font-sans">Video · drag to move</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center py-12 text-white/20 text-xs font-sans">
                No video attached
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── BOARD TEXT card (transparent, written directly onto board) ────────────────
  if (isQuote && card.attribution === 'board_text') {
    return (
      <div
        onClick={onClick}
        className={`relative group cursor-pointer select-none px-2 py-1.5 transition-all duration-200 ${
          isEditMode
            ? 'border border-dashed border-stone-400/40 rounded hover:border-stone-500/60 bg-white/5'
            : 'border border-transparent rounded'
        }`}
        style={{
          transform: `rotate(${rotationDegrees}deg)`,
          fontSize: `${Math.round(16 * scale)}px`,
        }}
      >
        <p className="text-stone-900 font-display font-bold leading-snug select-none whitespace-pre-wrap" style={{ fontSize: 'inherit' }}>
          {card.content}
        </p>
      </div>
    );
  }

  // ── QUOTE / TEXT card (Horizontal Card Strip - Less padding, less empty space) ───────────────────
  if (isQuote) {
    const isPlainText = !card.attribution;
    const noteColor = card.color || '#F5E6CC';

    return (
      <div
        onClick={onClick}
        className="relative w-full shadow-sticky group hover:shadow-sticky-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none sticky-note rounded-md"
        style={{
          '--note-color': noteColor,
          transform: `rotate(${rotationDegrees}deg)`,
          minHeight: `${Math.round(75 * scale)}px`,
          padding: `${Math.round(14 * scale)}px ${Math.round(16 * scale)}px ${Math.round(18 * scale)}px ${Math.round(16 * scale)}px`,
        } as React.CSSProperties}
      >
        {/* Pin decoration */}
        <Flat2DPushpin scale={scale} />

        <div className="flex-1 flex flex-col h-full" style={{ marginTop: `${Math.round(8 * scale)}px` }}>
          {/* Header row with star toggle */}
          <div className="flex items-center justify-between pb-1 z-25 relative">
            <span className="font-bold font-sans uppercase tracking-wider text-stone-600/70" style={{ fontSize: `${Math.round(9 * scale)}px` }}>
              {isPlainText ? 'Note' : 'Quote'}
            </span>
            <button
              type="button"
              className="text-stone-400 hover:text-amber-500 transition-all p-0.5 focus:outline-none"
              onClick={(e) => { e.stopPropagation(); onToggleStarred?.(card.id); }}
            >
              <Star size={Math.round(11 * scale)} className={card.is_starred ? 'fill-amber-400 text-amber-400' : 'text-stone-400/60'} />
            </button>
          </div>

          {/* Card Main Contents */}
          <div className="flex-1 flex flex-col justify-center">
            <p className={`text-stone-850 leading-snug font-medium text-center ${isPlainText ? 'font-sans' : 'font-serif italic'}`} style={{ fontSize: `${Math.round(12 * scale)}px` }}>
              {isPlainText ? card.content : `"${card.content}"`}
            </p>
            {!isPlainText && card.attribution && (
              <p className="font-sans text-stone-600/75 text-right mt-1 font-bold" style={{ fontSize: `${Math.round(8 * scale)}px` }}>
                — {card.attribution}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── GOAL / TASK cards (Tactile Sticky Notes) ─────────────────────────────────
  const noteColor = card.color || '#FFF3B0';

  return (
    <div
      onClick={onClick}
      className="relative w-full shadow-sticky group hover:shadow-sticky-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between sticky-note rounded-sticky"
      style={{
        '--note-color': noteColor,
        transform: `rotate(${rotationDegrees}deg)`,
        minHeight: `${Math.round(190 * scale)}px`,
        padding: `${Math.round(20 * scale)}px`,
        paddingBottom: `${Math.round(48 * scale)}px`,
      } as React.CSSProperties}
    >
      {/* Pin decoration */}
      <Flat2DPushpin scale={scale} />

      {/* Card Body */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header toolbar */}
        <div className="flex items-center justify-between z-25 relative" style={{ marginBottom: `${Math.round(10 * scale)}px`, paddingTop: `${Math.round(6 * scale)}px` }}>
          <div className="flex items-center flex-wrap" style={{ gap: `${Math.round(6 * scale)}px` }}>
            {/* Goal / Task inline badge to prevent overlaps */}
            <span
              className="font-black font-sans uppercase rounded"
              style={{
                fontSize: `${Math.round(8 * scale)}px`,
                padding: `${Math.round(2 * scale)}px ${Math.round(6 * scale)}px`,
                letterSpacing: `${0.1 * scale}em`,
                backgroundColor: isGoal ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)',
                color: isGoal ? '#92400e' : '#065f46',
              }}
            >
              {isGoal ? 'Goal' : 'Task'}
            </span>

            {isTask && card.priority ? (
              <div className="flex items-center animate-[fade-in_0.2s_ease-out]" style={{ gap: `${Math.round(4 * scale)}px` }}>
                <Flag size={Math.round(12 * scale)} style={{ color: priorityColors[card.priority] }} />
                <span className="font-bold tracking-wider uppercase font-sans" style={{ color: priorityColors[card.priority], fontSize: `${Math.round(10 * scale)}px` }}>
                  {card.priority}
                </span>
              </div>
            ) : isGoal && card.category ? (
              <span
                className="category-tag bg-black/5 text-stone-700/80 uppercase font-semibold tracking-wider font-sans flex items-center animate-[fade-in_0.2s_ease-out]"
                style={{
                  fontSize: `${Math.round(10 * scale)}px`,
                  padding: `${Math.round(2 * scale)}px ${Math.round(6 * scale)}px`,
                  borderRadius: `${Math.round(4 * scale)}px`,
                  gap: `${Math.round(4 * scale)}px`,
                }}
              >
                <Tag size={Math.round(10 * scale)} />
                {card.category}
              </span>
            ) : null}
          </div>

          {/* Star toggle */}
          <button
            type="button"
            className="text-stone-400 hover:text-amber-500 hover:scale-110 transition-all focus:outline-none z-30 pointer-events-auto"
            style={{
              padding: `${Math.round(4 * scale)}px`,
              margin: `${Math.round(-4 * scale)}px`,
            }}
            onClick={(e) => { e.stopPropagation(); onToggleStarred?.(card.id); }}
          >
            <Star size={Math.round(15 * scale)} className={card.is_starred ? 'fill-amber-400 text-amber-400' : 'text-stone-400/80'} />
          </button>
        </div>

        {/* Card Main Contents */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Title */}
            <h3
              className={`font-display font-bold text-stone-900 leading-tight ${card.is_completed ? 'line-through text-stone-400/70' : ''}`}
              style={{
                fontSize: `${Math.round(16 * scale)}px`,
                marginBottom: `${Math.round(8 * scale)}px`,
              }}
            >
              {card.title || 'Untitled'}
            </h3>

            {/* Description snippet */}
            {card.description && (
              <p
                className="text-stone-700/70 font-sans line-clamp-2 leading-relaxed"
                style={{
                  fontSize: `${Math.round(12 * scale)}px`,
                  marginBottom: `${Math.round(8 * scale)}px`,
                }}
              >
                {card.description}
              </p>
            )}

            {/* Embedded media (within sticky note) */}
            {attachedImage && (
              <div
                className="relative overflow-hidden rounded-lg border border-black/5 aspect-video w-full bg-stone-100 shadow-sm shrink-0 flex items-center justify-center"
                style={{
                  margin: `${Math.round(8 * scale)}px 0`,
                }}
              >
                <img src={getImageUrl(attachedImage.storage_path!)} alt="Attachment" className="max-w-full max-h-full object-contain" />
              </div>
            )}

            {/* Tasks Subtasks List Preview + Progress Bar */}
            {isTask && card.subtasks && card.subtasks.length > 0 && (() => {
              const total = card.subtasks.length;
              const done = card.subtasks.filter((s) => s.is_completed).length;
              const pct = Math.round((done / total) * 100);
              return (
                <div style={{ marginBottom: `${Math.round(8 * scale)}px`, marginTop: `${Math.round(8 * scale)}px` }}>
                  <div
                    className="space-y-1 font-sans"
                    style={{ fontSize: `${Math.round(11 * scale)}px`, color: 'rgba(28,25,23,0.8)' }}
                  >
                    {card.subtasks.slice(0, 3).map((subtask) => (
                      <div key={subtask.id} className="flex items-center" style={{ gap: `${Math.round(6 * scale)}px` }}>
                        <span
                          className={`rounded-sm border border-stone-800/30 flex items-center justify-center shrink-0 ${subtask.is_completed ? 'bg-emerald-500 border-emerald-500' : 'bg-white/40'}`}
                          style={{
                            width: `${Math.round(12 * scale)}px`,
                            height: `${Math.round(12 * scale)}px`,
                          }}
                        >
                          {subtask.is_completed && (
                            <svg viewBox="0 0 8 8" style={{ width: `${Math.round(6 * scale)}px`, height: `${Math.round(6 * scale)}px` }} fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1,4 3,6 7,2" />
                            </svg>
                          )}
                        </span>
                        <span className={`line-clamp-1 ${subtask.is_completed ? 'line-through text-stone-400/80' : ''}`}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                    {total > 3 && (
                      <div className="pl-4 font-medium italic" style={{ fontSize: `${Math.round(10 * scale)}px`, color: 'rgba(120,113,108,0.8)' }}>
                        +{total - 3} more
                      </div>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop: `${Math.round(8 * scale)}px` }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: `${Math.round(2 * scale)}px` }}>
                      <span className="font-bold font-sans text-stone-500 uppercase tracking-wider" style={{ fontSize: `${Math.round(9 * scale)}px` }}>Progress</span>
                      <span className="font-bold font-sans text-stone-600" style={{ fontSize: `${Math.round(9 * scale)}px` }}>{done}/{total}</span>
                    </div>
                    <div className="rounded-full bg-black/10 overflow-hidden" style={{ height: `${Math.round(6 * scale)}px` }}>
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Card Footer (Checkbox & Date/Recurrence) - Goal / Task only */}
      {(isGoal || isTask) && (
        <div
          className="absolute flex items-center justify-between z-20"
          style={{
            bottom: `${Math.round(16 * scale)}px`,
            left: `${Math.round(20 * scale)}px`,
            right: `${Math.round(20 * scale)}px`,
          }}
        >
          {/* Toggle completion */}
          <div
            onClick={(e) => { e.stopPropagation(); onToggleCompleted?.(card.id); }}
            className="flex items-center pointer-events-auto"
            style={{ gap: `${Math.round(8 * scale)}px` }}
            data-control="true"
          >
            <HandDrawnCheckbox checked={card.is_completed} />
            {isGoal && (
              <span className="font-bold font-sans text-stone-700/80 uppercase" style={{ fontSize: `${Math.round(10 * scale)}px` }}>
                {card.is_completed ? 'Dream Realized' : 'In Progress'}
              </span>
            )}
          </div>

          {/* Date / Recurrence */}
          {isTask && (
            <div className="flex items-center text-stone-500" style={{ gap: `${Math.round(6 * scale)}px` }}>
              {card.is_recurring && (
                <div className="flex items-center px-1 py-0.5 rounded bg-purple-100/70" style={{ gap: `${Math.round(2 * scale)}px` }} title={`Recurring ${card.recurrence_rule}`}>
                  <RotateCcw size={Math.round(9 * scale)} className="text-purple-600 animate-[spin_10s_linear_infinite]" />
                </div>
              )}
              {card.due_date && (
                <div
                  className={`flex items-center font-bold font-sans rounded ${isOverdue ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'text-stone-600/80'}`}
                  style={{
                    fontSize: `${Math.round(10 * scale)}px`,
                    gap: `${Math.round(4 * scale)}px`,
                    padding: `${Math.round(2 * scale)}px ${Math.round(6 * scale)}px`,
                  }}
                >
                  <Calendar size={Math.round(10 * scale)} />
                  <span>{formatDate(card.due_date)}</span>
                </div>
              )}
            </div>
          )}

          {isGoal && card.target_year && (
            <span
              className="font-bold font-sans text-stone-600/70 border border-stone-800/10 rounded bg-white/20"
              style={{
                fontSize: `${Math.round(10 * scale)}px`,
                padding: `${Math.round(2 * scale)}px ${Math.round(6 * scale)}px`,
              }}
            >
              {card.target_year}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
