'use client';

import React, { useState, useTransition } from 'react';
import { Palette, Check } from 'lucide-react';
import type { BoardTheme } from '@/lib/types';
import { updateBoard } from '@/lib/actions/boards';

const THEMES: { value: BoardTheme; label: string; preview: string }[] = [
  { value: 'cork',     label: 'Cork',     preview: 'bg-[#f4ebd0]' },
  { value: 'linen',    label: 'Linen',    preview: 'bg-[#f0e8d8]' },
  { value: 'white',    label: 'White',    preview: 'bg-[#ffffff] border border-stone-200' },
  { value: 'dark',     label: 'Dark',     preview: 'bg-[#1a1c23]' },
];

interface ThemeSwitcherProps {
  boardId: string;
  currentTheme: BoardTheme;
  onThemeChange?: (theme: BoardTheme) => void;
}

export function ThemeSwitcher({ boardId, currentTheme, onThemeChange }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<BoardTheme>(currentTheme);
  const [isPending, startTransition] = useTransition();

  // Sync label when the parent board changes (e.g. switching boards from dropdown)
  React.useEffect(() => {
    setActiveTheme(currentTheme);
  }, [currentTheme]);

  const handleSelect = (theme: BoardTheme) => {
    if (theme === activeTheme) { setOpen(false); return; }
    setActiveTheme(theme);
    setOpen(false);
    onThemeChange?.(theme);
    startTransition(async () => {
      try {
        await updateBoard(boardId, { theme });
      } catch (err) {
        console.error('Failed to update theme:', err);
        setActiveTheme(currentTheme);
      }
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        id="theme-switcher-btn"
        onClick={() => setOpen((v) => !v)}
        title="Change board theme"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/25 text-white/80 hover:text-white transition-all duration-200 text-xs font-sans font-medium backdrop-blur-sm"
      >
        <Palette size={13} />
        <span className="hidden sm:inline capitalize">{activeTheme}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-white/95 backdrop-blur-xl border border-stone-200 rounded-xl shadow-glass p-2 min-w-[160px] animate-slide-up">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 pb-1.5 font-sans">Board Theme</p>
            {THEMES.map(({ value, label, preview }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSelect(value)}
                disabled={isPending}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-stone-50 transition-colors group text-sm font-sans font-medium text-stone-700"
              >
                <div className={`w-8 h-6 rounded-md ${preview} border border-stone-200/60 shrink-0 shadow-sm`} />
                <span className="flex-1 text-left">{label}</span>
                {activeTheme === value && (
                  <Check size={13} className="text-cork-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
