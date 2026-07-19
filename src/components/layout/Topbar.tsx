'use client';

import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Sparkles, Calendar } from 'lucide-react';

// ─── Page title map ───────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, { label: string; emoji?: string }> = {
  '/dashboard':   { label: 'My Board' },
  '/goals':       { label: 'Goals' },
  '/tasks':       { label: 'Tasks' },
  '/collections': { label: 'Vision Boards' },
  '/settings':    { label: 'Settings' },
};

function getPageMeta(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/collections/')) return { label: 'Board Canvas' };
  return { label: 'StillBoard' };
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
export function Topbar() {
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
      className="fixed top-0 right-0 z-30 flex items-center gap-4 px-6"
      style={{
        left: '260px',
        height: '60px',
        backgroundColor: 'rgba(253, 248, 240, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(214, 200, 170, 0.4)',
      }}
    >
      {/* Page title */}
      <div className="flex items-center gap-2 shrink-0">
        <h1 className="font-display text-xl font-bold text-stone-900">
          {meta.label}
        </h1>
      </div>

      {/* ── Center decorative strip ── */}
      <div className="flex-1 flex items-center justify-center gap-6 px-4">
        {/* Motivational sparkle strip */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 shadow-sm">
          <Sparkles size={11} className="text-amber-500 shrink-0" />
          <span className="text-xs font-semibold font-sans text-amber-700 whitespace-nowrap">
            Your vision is becoming reality.
          </span>
          <Sparkles size={11} className="text-amber-500 shrink-0" />
        </div>
      </div>

      {/* ── Right: date + user ── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Today's date pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-stone-200/80 text-stone-500 shadow-sm">
          <Calendar size={11} className="shrink-0 text-cork-500" />
          <span className="text-xs font-semibold font-sans whitespace-nowrap">{today}</span>
        </div>

        {/* User avatar / Clerk button */}
        <div id="topbar-user-button" className="shrink-0 flex items-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
