'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Pin,
  LayoutDashboard,
  Target,
  CheckSquare,
  LayoutGrid,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/goals',       label: 'Goals',       icon: Target },
  { href: '/tasks',       label: 'Tasks',       icon: CheckSquare },
  { href: '/collections', label: 'Vision Boards', icon: LayoutGrid },
] as const;

const BOTTOM_NAV = [
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      id="sidebar"
      className="fixed left-0 top-0 h-screen z-40 flex flex-col shadow-sidebar transition-all duration-300"
      style={{
        width: collapsed ? '64px' : '260px',
        background: 'linear-gradient(180deg, #1a1512 0%, #231c15 50%, #1e1810 100%)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-5 border-b border-white/8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-pin"
          style={{ background: 'linear-gradient(135deg, #c07423, #e4a94a)' }}
        >
          <Pin size={17} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-white tracking-tight whitespace-nowrap overflow-hidden">
            StillBoard
          </span>
        )}
      </div>

      {/* ── Main Nav ── */}
      <nav className="flex-1 px-2 pt-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase()}`}
              title={collapsed ? label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200 cursor-pointer group
                ${active
                  ? 'text-white'
                  : 'text-stone-400 hover:text-white hover:bg-white/8'
                }
              `}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(217,144,46,0.22) 0%, rgba(217,144,46,0.10) 100%)',
                border: '1px solid rgba(217,144,46,0.28)',
              } : {}}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-colors duration-200 ${
                  active ? 'text-cork-400' : 'text-stone-500 group-hover:text-stone-300'
                }`}
              />
              {!collapsed && (
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {label}
                </span>
              )}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cork-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom area ── */}
      <div className="px-2 pb-4 border-t border-white/8 pt-3 space-y-0.5">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase()}`}
              title={collapsed ? label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200 cursor-pointer group
                ${active
                  ? 'text-white'
                  : 'text-stone-400 hover:text-white hover:bg-white/8'
                }
              `}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(217,144,46,0.22) 0%, rgba(217,144,46,0.10) 100%)',
                border: '1px solid rgba(217,144,46,0.28)',
              } : {}}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-colors ${active ? 'text-cork-400' : 'text-stone-500 group-hover:text-stone-300'}`}
              />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {/* User Button */}
        <div className="mt-3 px-3 py-2 flex justify-center border-t border-white/8 pt-3">
          <UserButton
            afterSignOutUrl="/"
            showName={!collapsed}
            appearance={{
              elements: {
                userButtonOuterIdentifier: "text-stone-300 font-sans text-xs font-medium",
                userButtonBox: collapsed ? "justify-center" : "flex-row-reverse",
              }
            }}
          />
        </div>
      </div>

      {/* ── Collapse toggle ── */}
      <button
        id="sidebar-collapse-toggle"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-800 border border-white/15 flex items-center justify-center shadow-md hover:bg-stone-700 transition-colors duration-200 z-50"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight size={12} className="text-stone-300" />
          : <ChevronLeft  size={12} className="text-stone-300" />
        }
      </button>
    </aside>
  );
}
