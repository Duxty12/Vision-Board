import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: {
    template: '%s | StillBoard',
    default: 'StillBoard',
  },
};

/**
 * Authenticated app shell.
 * Renders the persistent Sidebar + Topbar around page content with responsive mobile support.
 * Clerk middleware (middleware.ts) guards this entire route group.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
