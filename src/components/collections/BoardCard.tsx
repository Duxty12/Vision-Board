'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { LayoutGrid, Star, MoreHorizontal, Edit3, Pin } from 'lucide-react';
import type { BoardWithCount } from '@/lib/types';
import { toggleBoardStarred, updateBoard } from '@/lib/actions/boards';

interface BoardCardProps {
  board: BoardWithCount;
  onEdit: (board: BoardWithCount) => void;
}

export function BoardCard({ board, onEdit }: BoardCardProps) {
  const [isStarred, setIsStarred] = useState(board.is_starred);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const themeColors: Record<string, string> = {
    cork: '#C09060',
    linen: '#E8DCC8',
    white: '#EAEAEA',
    dark: '#2C2C2C',
  };
  const swatch = themeColors[board.theme] ?? themeColors.cork;

  const handleStarToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsStarred((prev) => !prev);
    startTransition(async () => {
      try {
        await toggleBoardStarred(board.id);
      } catch {
        setIsStarred(board.is_starred);
      }
    });
  };

  const handleSetDefault = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    startTransition(async () => {
      try {
        await updateBoard(board.id, { is_default: true });
      } catch (err) {
        console.error('Failed to set default board:', err);
      }
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit(board);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full select-none">

      {/* Full-card link — z-10 fills the entire card, buttons sit on z-20 above it */}
      <Link
        href={`/collections/${board.id}`}
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={`Open ${board.title}`}
      />

      {/* Theme swatch header */}
      <div
        className="h-10 w-full transition-all duration-300 group-hover:h-12 flex items-center justify-end pr-3 relative z-0"
        style={{ backgroundColor: swatch }}
      >
        {board.is_default && (
          <span className="text-[10px] font-bold font-sans px-2 py-0.5 rounded-full bg-white/30 text-white backdrop-blur-sm">
            Default
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 relative z-0">
        {/* Top row: icon + action buttons */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
            style={{ backgroundColor: `${swatch}30` }}
          >
            <LayoutGrid size={18} style={{ color: board.theme === 'dark' ? '#999' : 'hsl(30,20%,40%)' }} />
          </div>

          {/* Buttons — z-20 so they sit above the Link overlay */}
          <div className="flex items-center gap-1 relative z-20">
            <button
              onClick={handleStarToggle}
              disabled={isPending}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isStarred
                  ? 'text-amber-500 hover:scale-110'
                  : 'text-stone-300 hover:text-amber-400 opacity-0 group-hover:opacity-100 hover:scale-110'
              }`}
              aria-label={isStarred ? 'Unstar board' : 'Star board'}
            >
              <Star size={14} className={isStarred ? 'fill-amber-500' : ''} />
            </button>

            {/* Options dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen((v) => !v);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-650 hover:bg-stone-100 dark:hover:bg-[#2b2d38] transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                aria-label="Board options"
              >
                <MoreHorizontal size={15} />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(false); }}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#1a1c23] border border-stone-200 dark:border-white/10 rounded-xl shadow-glass p-1.5 min-w-[150px] animate-slide-up text-left">
                    {!board.is_default && (
                      <button
                        onClick={handleSetDefault}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors text-xs font-sans font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
                      >
                        <Pin size={13} className="text-amber-600 rotate-45" />
                        Make Default
                      </button>
                    )}
                    <button
                      onClick={handleEditClick}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors text-xs font-sans font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
                    >
                      <Edit3 size={13} className="text-stone-400" />
                      Edit Board
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <h3 className="font-display font-bold text-stone-850 dark:text-white/90 mb-1 text-sm leading-snug">
          {board.title}
        </h3>
        <p className="text-xs text-stone-400 font-sans mt-auto">
          {board.card_count} {board.card_count === 1 ? 'card' : 'cards'}
        </p>
      </div>
    </div>
  );
}
