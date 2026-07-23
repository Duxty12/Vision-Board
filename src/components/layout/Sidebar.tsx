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
  X,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/collections', label: 'Vision Boards', icon: LayoutGrid },
] as const;

const BOTTOM_NAV = [
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

const STORAGE_KEY = 'stillboard_sidebar_collapsed';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
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
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '64px' : '260px');
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed, mounted]);

  // Close mobile drawer on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const w = collapsed ? 64 : 260;

  const sidebarContent = (isMobile: boolean) => {
    const isCollapsed = isMobile ? false : collapsed;
    return (
      <div className="h-full flex flex-col justify-between select-none">
        {/* ── Logo & Brand ── */}
        <div>
          <div
            className="flex items-center justify-between px-4 pt-5 pb-4 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #d9902e 0%, #e4a94a 50%, #f5d08b 100%)',
                  boxShadow: '0 4px 16px rgba(217,144,46,0.35)',
                }}
              >
                <Pin size={17} className="text-stone-950 rotate-12" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <span className="font-display font-bold text-lg text-white leading-none tracking-tight block whitespace-nowrap">
                    StillBoard
                  </span>
                  <span className="text-[10px] font-sans text-amber-500/80 tracking-widest uppercase font-semibold flex items-center gap-1 mt-0.5">
                    <Sparkles size={9} className="text-amber-400" /> calm board
                  </span>
                </div>
              )}
            </div>

            {isMobile && (
              <button
                type="button"
                onClick={onMobileClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close mobile navigation"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* ── Main Navigation Links ── */}
          <nav className="px-2 pt-4 pb-2 space-y-1 overflow-y-auto no-scrollbar">
            {!isCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 px-3 pb-2 font-sans">
                Menu
              </p>
            )}
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  id={`nav-${label.toLowerCase().replace(' ', '-')}`}
                  title={isCollapsed ? label : undefined}
                  onClick={() => isMobile && onMobileClose?.()}
                  className={`
                    flex items-center rounded-xl transition-all duration-200 cursor-pointer group relative
                    ${isCollapsed ? 'justify-center px-0 py-2.5 mx-1' : 'gap-3 px-3 py-2.5'}
                    ${active ? 'text-white font-semibold' : 'text-stone-400 hover:text-stone-100 hover:bg-white/5'}
                  `}
                  style={active ? {
                    background: 'linear-gradient(135deg, rgba(217,144,46,0.22) 0%, rgba(217,144,46,0.08) 100%)',
                    border: '1px solid rgba(217,144,46,0.3)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                  } : { border: '1px solid transparent' }}
                >
                  {active && (
                    <div
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                      style={{ background: 'linear-gradient(to bottom, #f5d08b, #d9902e)' }}
                    />
                  )}
                  <Icon
                    size={18}
                    className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-amber-400' : 'text-stone-400 group-hover:text-stone-200'
                      }`}
                  />
                  {!isCollapsed && (
                    <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-1 font-sans">
                      {label}
                    </span>
                  )}
                  {active && !isCollapsed && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 ml-auto shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── User Profile Footer ── */}
        <div className="px-2 pt-2 pb-4 space-y-1 shrink-0">
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '8px 8px 12px 8px' }} />

          {/* User Button Profile Box */}
          <div
            className={`mt-1 pt-1 flex ${isCollapsed ? 'justify-center' : 'items-center gap-3 px-2 py-1.5 rounded-xl bg-white/5 border border-white/5'}`}
          >
            <UserButton
              afterSignOutUrl="/"
              showName={!isCollapsed}
              appearance={{
                elements: {
                  userButtonOuterIdentifier: 'text-stone-200 font-sans text-xs font-semibold truncate',
                  userButtonBox: isCollapsed ? 'justify-center' : 'flex-row-reverse w-full justify-between',
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Desktop Persistent Sidebar ── */}
      <aside
        id="sidebar"
        className="hidden md:flex fixed left-0 top-0 h-screen z-40 flex-col transition-all duration-300 select-none"
        style={{
          width: w,
          background: 'linear-gradient(180deg, #15110d 0%, #1d1711 40%, #231b14 75%, #18130e 100%)',
          boxShadow: '4px 0 28px rgba(0,0,0,0.35), 1px 0 0 rgba(255,255,255,0.05)',
        }}
      >
        {sidebarContent(false)}

        {/* Desktop Collapse Toggle */}
        <button
          id="sidebar-collapse-toggle"
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-115 transition-all duration-200 z-50 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #2c2218 0%, #1c1610 100%)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight size={13} className="text-amber-400" />
            : <ChevronLeft size={13} className="text-amber-400" />
          }
        </button>
      </aside>

      {/* ── Mobile Slide-Over Sheet Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onMobileClose}
          />

          {/* Sliding Sheet Panel */}
          <div
            className="relative w-[270px] max-w-[85vw] h-full shadow-2xl z-10 flex flex-col transition-transform duration-300 animate-slide-in-right"
            style={{
              background: 'linear-gradient(180deg, #15110d 0%, #1d1711 40%, #231b14 75%, #18130e 100%)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
