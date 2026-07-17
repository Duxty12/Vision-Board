import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StillBoard — Your Personal Vision Board',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}
