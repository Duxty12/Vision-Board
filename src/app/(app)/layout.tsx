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
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sand-50">
      {/* Persistent left sidebar */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: '260px' }}
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
