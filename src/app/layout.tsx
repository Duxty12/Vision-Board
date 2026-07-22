import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Caveat, Lora, Playfair_Display } from 'next/font/google';
import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';

// ─── Fonts ──────────────────────────────────────────────────────────────────
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

// ─── Metadata ────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'StillBoard — Your Personal Vision Board',
    template: '%s | StillBoard',
  },
  description:
    'A private, calm space for your goals, tasks, images, quotes, and videos. No algorithm. No social feed. Just your vision.',
  keywords: ['vision board', 'goal tracker', 'personal productivity', 'mood board', 'task manager'],
  authors: [{ name: 'StillBoard' }],
  creator: 'StillBoard',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'StillBoard — Your Personal Vision Board',
    description: 'A private, calm space for your goals, tasks, images, quotes, and videos.',
    siteName: 'StillBoard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StillBoard — Your Personal Vision Board',
    description: 'A private, calm space for your goals, tasks, images, quotes, and videos.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Root Layout ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${caveat.variable} ${lora.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
