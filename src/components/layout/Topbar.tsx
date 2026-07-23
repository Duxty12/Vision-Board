'use client';

import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Sparkles, Calendar, Menu } from 'lucide-react';

// ─── Page title map ───────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, { label: string; emoji?: string }> = {
  '/dashboard':   { label: 'My Board' },
  '/goals':       { label: 'Goals' },
  '/tasks':       { label: 'Tasks' },
  '/collections': { label: 'Vision Boards' },
};

function getPageMeta(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/collections/')) return { label: 'Board Canvas' };
  return { label: 'StillBoard' };
}

interface TopbarProps {
  onOpenMobileMenu?: () => void;
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);

  // Format today's date nicely: "Sun, Jul 20"
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header
      id="topbar"
      className="fixed top-0 right-0 left-0 md:left-[var(--sidebar-w,260px)] z-30 flex items-center justify-between gap-3 px-4 md:px-6 transition-all duration-300 select-none"
      style={{
        height: '60px',
        backgroundColor: 'rgba(253, 248, 240, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(214, 200, 170, 0.45)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
      }}
    >
      {/* Page title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-200/50 active:scale-95 transition-all cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        <h1 className="font-display text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
          {meta.label}
        </h1>
      </div>

      {/* ── Center decorative strip ── */}
      <div className="flex-1 flex items-center justify-center gap-6 px-2">
        {/* Motivational sparkle strip */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-300/40 shadow-xs">
          <Sparkles size={11} className="text-amber-600 shrink-0 animate-pulse" />
          <span className="text-xs font-semibold font-sans text-amber-900/90 whitespace-nowrap">
            Your vision is becoming reality.
          </span>
          <Sparkles size={11} className="text-amber-600 shrink-0 animate-pulse" />
        </div>
      </div>

      {/* ── Right: date + quick action + user ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Today's date pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-stone-200/90 text-stone-600 shadow-xs">
          <Calendar size={12} className="shrink-0 text-amber-600" />
          <span className="text-xs font-semibold font-sans whitespace-nowrap">{today}</span>
        </div>

        {/* Quick action button to Vision Boards */}
        <a
          href="/collections"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, #c07423 0%, #d9902e 100%)',
          }}
        >
          + New Board
        </a>

        {/* User avatar / Clerk button */}
        <div id="topbar-user-button" className="shrink-0 flex items-center p-0.5 rounded-full ring-2 ring-amber-500/20">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
