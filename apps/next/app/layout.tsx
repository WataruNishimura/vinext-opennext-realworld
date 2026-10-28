import '../lib/database.ts';
import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { default: 'RealWorld Commerce (Next.js)', template: '%s · RealWorld Commerce' },
  description: 'A Cache Components commerce demo rendered by Next.js on Vercel.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="bg-surface text-ink min-h-dvh antialiased">{children}</body>
    </html>
  );
}
