'use client';

import React, { useState } from 'react';
import { Plus, Target, CheckSquare, Image as ImageIcon, Quote, Video, Sticker, Type } from 'lucide-react';
import type { CardType, StickerType } from '@/lib/types';

const CARD_ITEMS: { type: CardType; label: string; icon: React.ElementType; color: string; isBoardText?: boolean }[] = [
  { type: 'goal',  label: 'Goal',       icon: Target,      color: '#FFF3B0' },
  { type: 'task',  label: 'Task',       icon: CheckSquare, color: '#B7F0D4' },
  { type: 'image', label: 'Image',      icon: ImageIcon,   color: '#BAE6FD' },
  { type: 'quote', label: 'Quote Card', icon: Quote,       color: '#E0C3FC' },
  { type: 'quote', label: 'Board Text', icon: Type,        color: '#F3E8FF', isBoardText: true },
  { type: 'video', label: 'Video',      icon: Video,       color: '#FFB3C6' },
];

const STICKER_ITEMS: { type: StickerType; label: string }[] = [
  { type: 'star',    label: 'Star ⭐️' },
  { type: 'arrow',   label: 'Arrow ➡️' },
  { type: 'tape',    label: 'Tape 🩹' },
  { type: 'flower',  label: 'Flower 🌸' },
  { type: 'heart',   label: 'Heart ❤️' },
  { type: 'smile',   label: 'Smiley 😊' },
  { type: 'sun',     label: 'Sun ☀️' },
  { type: 'pin',     label: 'Pushpin 📌' },
  { type: 'sparkle', label: 'Sparkle ✨' },
  { type: 'cloud',   label: 'Cloud ☁️' },
];

interface QuickAddMenuProps {
  onAddCard: (type: CardType, isBoardText?: boolean) => void;
  onAddSticker: (type: StickerType) => void;
}

export function QuickAddMenu({ onAddCard, onAddSticker }: QuickAddMenuProps) {
  const [open, setOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);

  const handleCardClick = (type: CardType, isBoardText?: boolean) => {
    setOpen(false);
    onAddCard(type, isBoardText);
  };

  const handleStickerClick = (type: StickerType) => {
    setOpen(false);
    setStickerOpen(false);
    onAddSticker(type);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-20" onClick={() => { setOpen(false); setStickerOpen(false); }} />
      )}

      {/* FAB */}
      <button
        type="button"
        id="fab-add-card"
        aria-label="Add new card"
        onClick={() => { setOpen((v) => !v); setStickerOpen(false); }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-2xl transition-all duration-300 z-30"
        style={{
          background: open
            ? 'linear-gradient(135deg, #6b3d1d, #9f5b1e)'
            : 'linear-gradient(135deg, #c07423, #d9902e)',
          boxShadow: open
            ? '0 8px 32px rgba(107,61,29,0.5)'
            : '0 8px 32px rgba(192,116,35,0.5)',
          transform: open ? 'rotate(45deg) scale(1.05)' : 'rotate(0deg) scale(1)',
        }}
      >
        <Plus size={26} />
      </button>

      {/* Card type menu */}
      {open && (
        <div
          className="fixed bottom-28 right-8 z-30 flex flex-col gap-1.5 items-end animate-slide-up"
          style={{ animationDuration: '0.25s' }}
        >
          {/* Sticker sub-menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setStickerOpen((v) => !v); }}
              className="flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-full shadow-card border border-white/30 text-sm font-sans font-semibold backdrop-blur-sm transition-all duration-150 hover:scale-105"
              style={{ background: '#FECDD3', color: '#374151' }}
            >
              <Sticker size={14} />
              Sticker
            </button>

            {/* Sticker sub-menu popup */}
            {stickerOpen && (
              <div
                className="absolute right-full mr-2 bottom-0 bg-white/95 backdrop-blur-xl border border-stone-200 rounded-xl shadow-glass p-2 w-[140px] max-h-[220px] overflow-y-auto no-scrollbar animate-slide-in-right"
                onClick={(e) => e.stopPropagation()}
              >
                {STICKER_ITEMS.map(({ type, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleStickerClick(type)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-sm font-sans font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card types */}
          {[...CARD_ITEMS].reverse().map(({ type, label, icon: Icon, color, isBoardText }, i) => (
            <button
              key={`${type}-${label}`}
              type="button"
              id={`add-${type}-${label.toLowerCase().replace(' ', '-')}`}
              onClick={() => handleCardClick(type, isBoardText)}
              className="flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-full shadow-card border border-white/30 text-sm font-sans font-semibold backdrop-blur-sm transition-all duration-150 hover:scale-105 animate-slide-up"
              style={{
                background: color,
                color: '#374151',
                animationDelay: `${i * 40}ms`,
                animationDuration: '0.2s',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
