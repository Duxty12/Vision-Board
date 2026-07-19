import type { Metadata } from 'next';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export const metadata: Metadata = {
  title: {
    template: '%s | StillBoard',
    default: 'StillBoard',
  },
};

/**
 * Authenticated app shell.
 * Renders the persistent Sidebar + Topbar around page content.
 * Clerk middleware (middleware.ts) guards this entire route group.
 *
 * The sidebar sets --sidebar-w on <html> via JS so the margin here tracks it.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sand-50">
      {/* Persistent left sidebar — manages its own width and sets --sidebar-w CSS var */}
      <Sidebar />

      {/* Main content area — margin driven by --sidebar-w CSS variable */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-w, 260px)' }}
      >
        {/* Persistent top bar */}
        <Topbar />

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
