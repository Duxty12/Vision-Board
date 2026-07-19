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
import { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/goals',       label: 'Goals',          icon: Target },
  { href: '/tasks',       label: 'Tasks',          icon: CheckSquare },
  { href: '/collections', label: 'Vision Boards',  icon: LayoutGrid },
] as const;

const BOTTOM_NAV = [
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

const STORAGE_KEY = 'stillboard_sidebar_collapsed';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Restore persisted collapsed state and sync CSS var to main layout
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'true') setCollapsed(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Drive the main content margin via a CSS custom property on <html>
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '64px' : '260px');
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed, mounted]);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const w = collapsed ? 64 : 260;

  return (
    <aside
      id="sidebar"
      className="fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300"
      style={{
        width: w,
        background: 'linear-gradient(180deg, #12100d 0%, #1c1610 35%, #201a11 70%, #18150d 100%)',
        boxShadow: '2px 0 24px rgba(0,0,0,0.45), 1px 0 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-4 pt-5 pb-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #b86a1e 0%, #e4a94a 60%, #f0c070 100%)',
            boxShadow: '0 2px 12px rgba(217,144,46,0.45)',
          }}
        >
          <Pin size={17} className="text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="font-display font-bold text-lg text-white leading-none tracking-tight block whitespace-nowrap">
              StillBoard
            </span>
            <span className="text-[10px] font-sans text-amber-600/70 tracking-widest uppercase font-medium">
              vision board
            </span>
          </div>
        )}
      </div>

      {/* ── Main Nav ── */}
      <nav className="flex-1 px-2 pt-3 pb-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {/* Section label */}
        {!collapsed && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 px-3 pb-2 font-sans">
            Navigate
          </p>
        )}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase().replace(' ', '-')}`}
              title={collapsed ? label : undefined}
              className={`
                flex items-center rounded-lg transition-all duration-200 cursor-pointer group relative
                ${collapsed ? 'justify-center px-0 py-2.5 mx-1' : 'gap-3 px-3 py-2.5'}
                ${active ? 'text-white' : 'text-stone-400 hover:text-white'}
              `}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(217,144,46,0.20) 0%, rgba(217,144,46,0.08) 100%)',
                border: '1px solid rgba(217,144,46,0.22)',
              } : { border: '1px solid transparent' }}
            >
              {/* Active left accent bar */}
              {active && (
                <div
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                  style={{ background: 'linear-gradient(to bottom, #f0c070, #d9902e)' }}
                />
              )}
              <Icon
                size={18}
                className={`shrink-0 transition-colors duration-200 ${
                  active ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300'
                }`}
              />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                  {label}
                </span>
              )}
              {active && !collapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Divider ── */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 12px' }} />

      {/* ── Bottom area ── */}
      <div className="px-2 pt-2 pb-3 space-y-0.5 shrink-0">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase()}`}
              title={collapsed ? label : undefined}
              className={`
                flex items-center rounded-lg transition-all duration-200 cursor-pointer group relative
                ${collapsed ? 'justify-center px-0 py-2.5 mx-1' : 'gap-3 px-3 py-2.5'}
                ${active ? 'text-white' : 'text-stone-400 hover:text-white'}
              `}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(217,144,46,0.20) 0%, rgba(217,144,46,0.08) 100%)',
                border: '1px solid rgba(217,144,46,0.22)',
              } : { border: '1px solid transparent' }}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-colors ${active ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300'}`}
              />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </Link>
          );
        })}

        {/* User Button */}
        <div
          className={`mt-2 pt-3 flex ${collapsed ? 'justify-center' : 'items-center gap-2 px-2'}`}
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <UserButton
            afterSignOutUrl="/"
            showName={!collapsed}
            appearance={{
              elements: {
                userButtonOuterIdentifier: 'text-stone-300 font-sans text-xs font-medium',
                userButtonBox: collapsed ? 'justify-center' : 'flex-row-reverse',
              },
            }}
          />
        </div>
      </div>

      {/* ── Collapse toggle ── */}
      <button
        id="sidebar-collapse-toggle"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 z-50"
        style={{
          background: 'linear-gradient(135deg, #2a2219 0%, #1c1813 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight size={12} className="text-amber-500/80" />
          : <ChevronLeft  size={12} className="text-amber-500/80" />
        }
      </button>
    </aside>
  );
}
