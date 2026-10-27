import '../lib/database.ts';
import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { default: 'RealWorld Commerce', template: '%s · RealWorld Commerce' },
  description: 'A Cache Components commerce demo on Cloudflare Workers with OpenNext.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
