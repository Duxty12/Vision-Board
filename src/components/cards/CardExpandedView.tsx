'use client';

import React, { useEffect, useCallback } from 'react';
import {
  X,
  Star,
  Flag,
  Calendar,
  RotateCcw,
  Tag,
  Edit3,
  CheckCircle2,
  Circle,
  Youtube,
  Image as ImageIcon,
  Video,
  Quote,
  Target,
  CheckSquare,
} from 'lucide-react';
import type { CardWithRelations } from '@/lib/types';

interface CardExpandedViewProps {
  card: CardWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onToggleCompleted?: (cardId: string) => void;
  onToggleStarred?: (cardId: string) => void;
  onToggleSubtask?: (subtaskId: string) => void;
}

const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: '#fff1f2', text: '#dc2626', border: '#fecaca' },
  medium: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  low: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
};

const cardTypeIcon: Record<string, React.ReactNode> = {
  goal: <Target size={14} />,
  task: <CheckSquare size={14} />,
  image: <ImageIcon size={14} />,
  video: <Video size={14} />,
  quote: <Quote size={14} />,
};

export function CardExpandedView({
  card,
  isOpen,
  onClose,
  onEdit,
  onToggleCompleted,
  onToggleStarred,
  onToggleSubtask,
}: CardExpandedViewProps) {
  const isGoal = card.type === 'goal';
  const isTask = card.type === 'task';
  const isQuote = card.type === 'quote';

  const attachedImage = card.media?.find((m) => m.media_type === 'image');
  const attachedVideo = card.media?.find((m) => m.media_type === 'video');

  const getImageUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/board-media/${path}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isOverdue =
    card.due_date && new Date(card.due_date) < new Date() && !card.is_completed;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const noteColor = card.color || (isQuote ? '#F5E6CC' : '#FFF3B0');

  const completedSubtasks = card.subtasks?.filter((s) => s.is_completed).length || 0;
  const totalSubtasks = card.subtasks?.length || 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{
          background: noteColor,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.12) transparent',
          animation: 'expandedCardScaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pin decoration */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[40%] w-4 h-4 rounded-full shadow-md z-10 border-2 border-white/60"
          style={{ background: 'radial-gradient(circle at 35% 35%, #e8b4a0, #b05030)' }}
        />

        {/* Top action bar */}
        <div
          className="sticky top-0 left-0 right-0 flex items-center justify-between px-6 pt-6 pb-3 z-10"
          style={{ background: `${noteColor}ee`, backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider font-sans px-2.5 py-1 rounded-full text-stone-700" style={{ background: 'rgba(0,0,0,0.08)' }}>
              {cardTypeIcon[card.type]}
              {card.type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStarred?.(card.id)}
              className="p-2 rounded-full transition-colors text-stone-500 hover:text-amber-500"
              style={{ background: 'transparent' }}
              title={card.is_starred ? 'Unstar' : 'Star'}
            >
              <Star
                size={17}
                className={card.is_starred ? 'fill-amber-400 text-amber-400' : ''}
              />
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-stone-800 text-xs font-semibold font-sans"
                style={{ background: 'rgba(0,0,0,0.10)' }}
              >
                <Edit3 size={13} />
                Edit
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full transition-colors text-stone-600"
              style={{ background: 'transparent' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-2">
          {isQuote ? (
            <div className="text-center py-6">
              <p className="font-serif italic text-2xl text-stone-900 leading-relaxed font-semibold mb-4">
                &ldquo;{card.content || 'No quote content'}&rdquo;
              </p>
              {card.attribution && (
                <p className="font-sans text-sm text-stone-600/80 font-bold tracking-wide">
                  — {card.attribution}
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Title */}
              <h2
                className={`font-display text-2xl font-bold text-stone-900 leading-tight mb-3 ${
                  card.is_completed ? 'line-through text-stone-400/70' : ''
                }`}
              >
                {card.title || 'Untitled'}
              </h2>

              {/* Meta badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {isTask && card.priority && (
                  <span
                    className="flex items-center gap-1 text-xs font-bold font-sans px-2.5 py-1 rounded-full border"
                    style={{
                      backgroundColor: priorityColors[card.priority]?.bg,
                      color: priorityColors[card.priority]?.text,
                      borderColor: priorityColors[card.priority]?.border,
                    }}
                  >
                    <Flag size={11} />
                    {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)} Priority
                  </span>
                )}

                {isGoal && card.category && (
                  <span
                    className="flex items-center gap-1 text-xs font-bold font-sans px-2.5 py-1 rounded-full text-stone-700"
                    style={{ background: 'rgba(0,0,0,0.08)' }}
                  >
                    <Tag size={11} />
                    {card.category}
                  </span>
                )}

                {isGoal && card.target_year && (
                  <span
                    className="text-xs font-bold font-sans px-2.5 py-1 rounded-full text-stone-700"
                    style={{ background: 'rgba(0,0,0,0.08)' }}
                  >
                    🎯 Target: {card.target_year}
                  </span>
                )}

                {isTask && card.due_date && (
                  <span
                    className={`flex items-center gap-1 text-xs font-bold font-sans px-2.5 py-1 rounded-full border ${
                      isOverdue
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'text-stone-700 border-transparent'
                    }`}
                    style={!isOverdue ? { background: 'rgba(0,0,0,0.06)' } : {}}
                  >
                    <Calendar size={11} />
                    {isOverdue ? '⚠️ ' : ''}
                    {formatDate(card.due_date)}
                  </span>
                )}

                {isTask && card.is_recurring && (
                  <span className="flex items-center gap-1 text-xs font-semibold font-sans px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    <RotateCcw size={11} className="animate-[spin_8s_linear_infinite]" />
                    Recurring · {card.recurrence_rule}
                  </span>
                )}
              </div>

              {/* Description */}
              {card.description && (
                <p className="text-sm text-stone-700/80 font-sans leading-relaxed mb-5 whitespace-pre-wrap">
                  {card.description}
                </p>
              )}

              {/* Full Image */}
              {attachedImage && (
                <div className="mb-5 rounded-2xl overflow-hidden border border-black/8 shadow-md bg-stone-900/5">
                  <img
                    src={getImageUrl(attachedImage.storage_path!)}
                    alt={card.title || 'Attached image'}
                    className="w-full h-auto object-contain block"
                  />
                </div>
              )}

              {/* Embedded YouTube Player */}
              {attachedVideo?.youtube_video_id && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Youtube size={15} className="text-rose-600" />
                    <span className="text-xs font-bold font-sans text-stone-600 uppercase tracking-wider">
                      Video
                    </span>
                  </div>
                  <div
                    className="relative rounded-2xl overflow-hidden border border-black/8 shadow-md"
                    style={{ paddingBottom: '56.25%' }}
                  >
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${attachedVideo.youtube_video_id}?rel=0&modestbranding=1`}
                      title={card.title || 'Video'}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Subtasks */}
              {isTask && card.subtasks && card.subtasks.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-sans text-stone-600 uppercase tracking-wider">
                      Subtasks
                    </span>
                    <span className="text-xs font-bold font-sans text-stone-500">
                      {completedSubtasks}/{totalSubtasks}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(0,0,0,0.10)' }}>
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{
                        width: totalSubtasks > 0 ? `${(completedSubtasks / totalSubtasks) * 100}%` : '0%',
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    {card.subtasks.map((subtask) => (
                      <button
                        key={subtask.id}
                        type="button"
                        onClick={() => onToggleSubtask?.(subtask.id)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-black/8 text-left cursor-pointer"
                        style={{ background: 'rgba(0,0,0,0.05)' }}
                      >
                        {subtask.is_completed ? (
                          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                        ) : (
                          <Circle size={16} className="text-stone-400 shrink-0" />
                        )}
                        <span
                          className={`text-sm font-sans ${
                            subtask.is_completed
                              ? 'line-through text-stone-400'
                              : 'text-stone-800'
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion toggle */}
              {(isGoal || isTask) && (
                <button
                  type="button"
                  onClick={() => onToggleCompleted?.(card.id)}
                  className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-semibold font-sans text-sm transition-all duration-200 border-2 ${
                    card.is_completed
                      ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-50'
                      : 'border-stone-800/10 text-stone-700 hover:border-stone-800/20'
                  }`}
                  style={!card.is_completed ? { background: 'rgba(0,0,0,0.06)' } : {}}
                >
                  {card.is_completed ? (
                    <>
                      <CheckCircle2 size={17} className="text-green-600" />
                      {isGoal ? 'Dream Realized! 🎉' : 'Task Complete! ✓'}
                    </>
                  ) : (
                    <>
                      <Circle size={17} className="text-stone-500" />
                      {isGoal ? 'Mark as Realized' : 'Mark as Complete'}
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes expandedCardScaleIn {
          from {
            opacity: 0;
            transform: scale(0.88);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
