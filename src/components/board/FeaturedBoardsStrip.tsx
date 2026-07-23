'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import type { BoardWithCount } from '@/lib/types';

interface FeaturedBoardsStripProps {
  boards: BoardWithCount[];
}

export function FeaturedBoardsStrip({ boards }: FeaturedBoardsStripProps) {
  const themeColors: Record<string, string> = {
    cork: '#C09060',
    linen: '#E8DCC8',
    white: '#EAEAEA',
    dark: '#2C2C2C',
  };

  if (!boards || boards.length === 0) return null;

  return (
    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-5 pt-2 px-1">
      {boards.map((board) => {
        const swatch = themeColors[board.theme] ?? themeColors.cork;
        return (
          <Link
            key={board.id}
            href={`/collections/${board.id}`}
            className="flex-shrink-0 w-48 glass-card rounded-xl border border-stone-200/60 dark:border-white/5 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
          >
            {/* Swatch color header */}
            <div className="h-2 w-full transition-all group-hover:h-3" style={{ backgroundColor: swatch }} />
            
            <div className="p-3.5 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner shrink-0"
                style={{ backgroundColor: `${swatch}30` }}
              >
                <LayoutGrid size={15} style={{ color: board.theme === 'dark' ? '#999' : 'hsl(30,20%,40%)' }} />
              </div>
              <div className="min-w-0">
                <h4 className="font-display font-bold text-xs text-stone-850 dark:text-white/90 truncate leading-tight">
                  {board.title}
                </h4>
                <p className="text-[10px] text-stone-400 font-sans mt-0.5">
                  {board.card_count} {board.card_count === 1 ? 'card' : 'cards'}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
