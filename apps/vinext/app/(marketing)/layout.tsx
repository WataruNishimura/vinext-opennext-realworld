import type { ReactNode } from 'react';
import { SiteFooter } from '../../features/layout/components/site-footer.tsx';
import { SiteHeader } from '../../features/layout/components/site-header.tsx';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
