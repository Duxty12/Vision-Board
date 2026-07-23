'use client';

import React, { useState, useTransition } from 'react';
import { Palette, Check } from 'lucide-react';
import type { BoardTheme } from '@/lib/types';
import { updateBoard } from '@/lib/actions/boards';

const THEMES: { value: BoardTheme; label: string; preview: string; hex: string }[] = [
  { value: 'cork',  label: 'Cork',  preview: 'bg-[#C09060]', hex: '#C09060' },
  { value: 'linen', label: 'Linen', preview: 'bg-[#E8DCC8]', hex: '#E8DCC8' },
  { value: 'white', label: 'White', preview: 'bg-[#FFFFFF] border border-stone-300', hex: '#FFFFFF' },
  { value: 'dark',  label: 'Dark',  preview: 'bg-[#2B303B]', hex: '#2B303B' },
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

  // Sync label when the parent board changes
  React.useEffect(() => {
    setActiveTheme(currentTheme);
  }, [currentTheme]);

  const activeThemeMeta = THEMES.find((t) => t.value === activeTheme) || THEMES[0];

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
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#1a1c23]/90 hover:bg-white dark:hover:bg-[#1a1c23] border border-stone-200/90 dark:border-white/10 text-stone-800 dark:text-stone-100 transition-all duration-200 text-xs font-sans font-semibold shadow-xs hover:shadow-md hover:scale-102 cursor-pointer group"
      >
        <div
          className="w-3.5 h-3.5 rounded-full border border-stone-900/15 dark:border-white/20 shrink-0 shadow-xs transition-transform group-hover:scale-110"
          style={{ backgroundColor: activeThemeMeta.hex }}
        />
        <Palette size={13} className="text-stone-500 dark:text-stone-400 group-hover:text-amber-600 transition-colors" />
        <span className="hidden sm:inline capitalize">{activeTheme}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-white/95 dark:bg-[#1a1c23]/95 backdrop-blur-xl border border-stone-200 dark:border-white/10 rounded-2xl shadow-glass p-2 min-w-[170px] animate-slide-up">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2.5 py-1 font-sans">Board Canvas Theme</p>
            {THEMES.map(({ value, label, preview }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSelect(value)}
                disabled={isPending}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all font-sans font-medium text-xs text-left cursor-pointer ${
                  activeTheme === value
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg ${preview} border border-stone-900/10 dark:border-white/10 shrink-0 shadow-xs`} />
                <span className="flex-1 capitalize">{label}</span>
                {activeTheme === value && (
                  <Check size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
