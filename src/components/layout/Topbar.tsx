'use client';

import { Search, SlidersHorizontal, Bell, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

// ─── Page title map ───────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'My Board',
  '/goals':       'Goals',
  '/tasks':       'Tasks',
  '/collections': 'Vision Boards',
  '/settings':    'Settings',
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Collection detail
  if (pathname.startsWith('/collections/')) return 'Vision Board';
  return 'StillBoard';
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
export function Topbar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header
      id="topbar"
      className="fixed top-0 right-0 z-30 flex items-center gap-4 px-6"
      style={{
        left: '260px', /* matches sidebar width */
        height: '60px',
        backgroundColor: 'rgba(253, 248, 240, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(214, 200, 170, 0.4)',
      }}
    >
      {/* Page title */}
      <h1 className="font-display text-xl font-bold text-stone-900 shrink-0">
        {pageTitle}
      </h1>

      {/* Search */}
      <div className="flex-1 max-w-sm ml-4">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            id="topbar-search"
            type="search"
            placeholder="Search your board…"
            className="
              w-full pl-9 pr-4 py-2 rounded-xl text-sm font-sans
              bg-white/70 border border-stone-200/80
              placeholder:text-stone-400 text-stone-800
              focus:outline-none focus:ring-2 focus:ring-cork-400/60 focus:border-transparent
              transition-all duration-200
            "
          />
        </div>
      </div>

      {/* Filter toggle */}
      <button
        id="topbar-filter-toggle"
        className="
          flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium font-sans
          text-stone-600 bg-white/70 border border-stone-200/80
          hover:bg-white hover:border-stone-300 hover:text-stone-800
          transition-all duration-200
        "
        aria-label="Toggle filters"
      >
        <SlidersHorizontal size={15} />
        <span className="hidden sm:inline">Filter</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quick add */}
      <button
        id="topbar-add-card"
        className="
          flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold font-sans
          text-white transition-all duration-200 hover:opacity-90 hover:scale-105
        "
        style={{
          background: 'linear-gradient(135deg, #c07423, #d9902e)',
          boxShadow: '0 3px 10px rgba(192,116,35,0.3)',
        }}
        aria-label="Add new card"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">Add card</span>
      </button>

      {/* Notifications */}
      <button
        id="topbar-notifications"
        className="relative w-9 h-9 rounded-xl bg-white/70 border border-stone-200/80 flex items-center justify-center hover:bg-white hover:border-stone-300 transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell size={16} className="text-stone-500" />
        {/* Notification dot placeholder */}
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cork-500" />
      </button>

      {/* User avatar / Clerk button */}
      <div id="topbar-user-button" className="shrink-0 flex items-center">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
