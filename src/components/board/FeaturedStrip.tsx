'use client';

import React from 'react';
import { Star, Tag, Calendar, Flag, Play, Image as ImageIcon, Quote as QuoteIcon, Video as VideoIcon, Target, CheckSquare } from 'lucide-react';
import type { CardWithRelations } from '@/lib/types';

interface FeaturedStripProps {
  cards: CardWithRelations[];
  onCardClick?: (card: CardWithRelations) => void;
}

const TYPE_ICONS = {
  goal: Target,
  task: CheckSquare,
  image: ImageIcon,
  quote: QuoteIcon,
  video: VideoIcon,
};

const TYPE_COLORS: Record<string, string> = {
  goal: '#FFF3B0',
  task: '#B7F0D4',
  image: '#BAE6FD',
  quote: '#E0C3FC',
  video: '#FFB3C6',
};

function getImageUrl(storagePath: string) {
  if (storagePath.startsWith('http')) return storagePath;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/board-media/${storagePath}`;
}

function FeaturedCard({ card, onClick }: { card: CardWithRelations; onClick: () => void }) {
  const Icon = TYPE_ICONS[card.type] || Target;
  const bgColor = card.color || TYPE_COLORS[card.type] || '#FFF3B0';

  const attachedImage = card.media?.find((m) => m.media_type === 'image');
  const attachedVideo = card.media?.find((m) => m.media_type === 'video');
  const thumbnailUrl = attachedImage?.storage_path
    ? getImageUrl(attachedImage.storage_path)
    : attachedVideo?.thumbnail_url || null;

  const isOverdue =
    card.type === 'task' &&
    card.due_date &&
    new Date(card.due_date) < new Date() &&
    !card.is_completed;

  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 w-48 h-28 rounded-xl overflow-hidden relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-sticky-hover shadow-sticky"
      style={{ backgroundColor: bgColor }}
      title={card.title || card.content || card.type}
    >
      {thumbnailUrl && (
        <div className="absolute inset-0">
          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}
      {(card.type === 'video' || attachedVideo) && (
        <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center">
          <Play size={10} className="fill-stone-800 text-stone-800 translate-x-[1px]" />
        </div>
      )}
      <div className="relative z-10 p-3 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-bold font-sans uppercase tracking-wider text-stone-700/80">
            <Icon size={10} />
            {card.type}
          </span>
          {card.is_starred && <Star size={10} className="fill-amber-400 text-amber-400" />}
        </div>
        <div>
          {card.type === 'quote' ? (
            <p className="font-serif text-xs italic text-stone-800 line-clamp-2 leading-snug">
              &ldquo;{card.content}&rdquo;
            </p>
          ) : (
            <p className={`font-display text-sm font-bold text-stone-900 line-clamp-2 leading-snug ${card.is_completed ? 'line-through text-stone-500' : ''}`}>
              {card.title || 'Untitled'}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            {card.priority && (
              <span className={`text-[9px] font-bold font-sans uppercase tracking-wider priority-${card.priority}`}>
                <Flag size={8} className="inline mr-0.5" />
                {card.priority}
              </span>
            )}
            {card.due_date && (
              <span className={`text-[9px] font-bold font-sans ${isOverdue ? 'text-rose-600' : 'text-stone-500/80'}`}>
                <Calendar size={8} className="inline mr-0.5" />
                {new Date(card.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
            {card.category && (
              <span className="text-[9px] font-semibold text-stone-600/70 font-sans">
                <Tag size={8} className="inline mr-0.5" />
                {card.category}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function FeaturedStrip({ cards, onCardClick }: FeaturedStripProps) {
  if (cards.length === 0) {
    return (
      <div className="featured-strip items-center">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-48 h-28 rounded-xl bg-white/15 border border-white/20 animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
        <p className="shrink-0 text-white/40 text-xs font-sans italic ml-2 self-center">
          Star a card to feature it here
        </p>
      </div>
    );
  }

  return (
    <div className="featured-strip gap-3">
      {cards.map((card) => (
        <FeaturedCard
          key={card.id}
          card={card}
          onClick={() => onCardClick?.(card)}
        />
      ))}
    </div>
  );
}
