'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Persistent left sidebar (desktop) + Mobile Sheet drawer */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area — margin driven by --sidebar-w CSS variable on desktop, 0 on mobile */}
      <div className="transition-all duration-300 ml-0 md:ml-[var(--sidebar-w,260px)]">
        {/* Persistent top bar */}
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />

        {/* Page content — offset below topbar */}
        <main
          id="main-content"
          className="min-h-screen pt-[60px]"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
