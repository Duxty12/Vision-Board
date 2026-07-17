'use client';

import React from 'react';
import { Star, Flag, Calendar, RotateCcw, Tag } from 'lucide-react';
import type { CardWithRelations } from '@/lib/types';

interface CardCompactViewProps {
  card: CardWithRelations;
  onClick?: () => void;
  onToggleCompleted?: (cardId: string) => void;
  onToggleStarred?: (cardId: string) => void;
}

// Sketched hand-drawn SVG checkbox
function HandDrawnCheckbox({ checked }: { checked: boolean }) {
  return (
    <svg
      className="w-5 h-5 shrink-0 text-stone-800/70 hover:text-stone-900 transition-colors select-none cursor-pointer"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* slightly imperfect/hand-sketched square */}
      <path d="M3.5,4.5 C7,3.2 16.8,3.8 19.8,4.5 C20.8,5.8 20.2,17.8 19.5,19.5 C14.5,20.8 6.5,20.2 4.2,19.5 C3.5,18 3.2,7.2 3.5,4.5 Z" />
      {checked && (
        /* hand-drawn checkmark */
        <path
          d="M6,11.5 L10.5,15.5 C12,12.5 15.5,7.5 19,5.5"
          stroke="#16a34a"
          strokeWidth="3"
        />
      )}
    </svg>
  );
}

export function CardCompactView({
  card,
  onClick,
  onToggleCompleted,
  onToggleStarred,
}: CardCompactViewProps) {
  const isGoal = card.type === 'goal';
  const isTask = card.type === 'task';

  // Rotation: defaults to a rotation based on ID if 0 or undefined
  const rotationDegrees = card.rotation || (
    // Deterministic random rotation [-3, 3] from card.id
    ((card.id.charCodeAt(0) + (card.id.charCodeAt(1) || 0)) % 6) - 3
  );

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  const isOverdue = card.due_date && new Date(card.due_date) < new Date() && !card.is_completed;

  // Formatting date nicely
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className="sticky-note p-5 w-full rounded-sticky shadow-sticky group hover:shadow-sticky-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer select-none relative pb-12 min-h-[190px] flex flex-col justify-between"
      style={{
        '--note-color': card.color || '#FFF3B0',
        transform: `rotate(${rotationDegrees}deg)`,
      } as React.CSSProperties}
    >
      {/* Pin decoration */}
      <div className="pin" />

      {/* Card Body */}
      <div>
        {/* Header (Priority or Category vs Star Toggle) */}
        <div className="flex items-center justify-between mb-2 pt-2">
          {isTask && card.priority ? (
            <div className="flex items-center gap-1">
              <Flag size={12} style={{ color: priorityColors[card.priority] }} />
              <span
                className="text-[10px] font-bold tracking-wider uppercase font-sans"
                style={{ color: priorityColors[card.priority] }}
              >
                {card.priority}
              </span>
            </div>
          ) : isGoal && card.category ? (
            <span className="category-tag bg-black/5 text-stone-700/80 gap-1 text-[10px] font-semibold tracking-wider font-sans uppercase">
              <Tag size={10} />
              {card.category}
            </span>
          ) : (
            <div className="h-4" />
          )}

          {/* Star toggle */}
          <button
            type="button"
            className="text-stone-400 hover:text-amber-500 hover:scale-110 transition-all p-1 -m-1 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStarred?.(card.id);
            }}
          >
            <Star
              size={15}
              className={card.is_starred ? 'fill-amber-400 text-amber-400' : 'text-stone-400/80'}
            />
          </button>
        </div>

        {/* Title */}
        <h3 className={`font-display text-base font-bold text-stone-900 leading-tight mb-2 ${card.is_completed ? 'line-through text-stone-400/70' : ''}`}>
          {card.title || 'Untitled'}
        </h3>

        {/* Description snippet */}
        {card.description && !isTask && (
          <p className="text-xs text-stone-700/70 font-sans line-clamp-2 leading-relaxed mb-3">
            {card.description}
          </p>
        )}

        {/* Tasks Subtasks List Preview */}
        {isTask && card.subtasks && card.subtasks.length > 0 && (
          <div className="space-y-1 mb-3 text-[11px] text-stone-800/80 font-sans mt-3">
            {card.subtasks.slice(0, 3).map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-sm border border-stone-800/30 flex items-center justify-center shrink-0 ${subtask.is_completed ? 'bg-stone-800/10' : 'bg-white/40'}`}>
                  {subtask.is_completed && <span className="text-[8px] leading-none text-stone-800 font-bold">✓</span>}
                </span>
                <span className={`line-clamp-1 ${subtask.is_completed ? 'line-through text-stone-400/80' : ''}`}>
                  {subtask.title}
                </span>
              </div>
            ))}
            {card.subtasks.length > 3 && (
              <div className="text-[10px] text-stone-500/80 pl-4 font-medium italic">
                +{card.subtasks.length - 3} more subtasks
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer (Checkbox & Date/Recurrence) */}
      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
        {/* Toggle completion */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompleted?.(card.id);
          }}
          className="flex items-center gap-2"
        >
          <HandDrawnCheckbox checked={card.is_completed} />
          {isGoal && (
            <span className="text-[10px] font-bold font-sans text-stone-700/80 uppercase">
              {card.is_completed ? 'Dream Realized' : 'In Progress'}
            </span>
          )}
        </div>

        {/* Date / Recurrence */}
        {isTask && (
          <div className="flex items-center gap-2 text-stone-500">
            {card.is_recurring && (
              <span title={`Recurring ${card.recurrence_rule}`}>
                <RotateCcw size={10} className="text-stone-600/80 animate-[spin_10s_linear_infinite]" />
              </span>
            )}
            {card.due_date && (
              <div
                className={`flex items-center gap-1 text-[10px] font-bold font-sans px-1.5 py-0.5 rounded ${
                  isOverdue
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'text-stone-600/80'
                }`}
              >
                <Calendar size={10} />
                <span>{formatDate(card.due_date)}</span>
              </div>
            )}
          </div>
        )}

        {isGoal && card.target_year && (
          <span className="text-[10px] font-bold font-sans text-stone-600/70 border border-stone-800/10 px-1.5 py-0.5 rounded bg-white/20">
            {card.target_year}
          </span>
        )}
      </div>
    </div>
  );
}
