import type { ReactNode } from 'react';
import { SiteFooter } from '../../features/layout/components/site-footer.tsx';
import { SiteHeader } from '../../features/layout/components/site-header.tsx';

// Next.js asserts the layout stays in the static shell; vinext ignores this export (see README).
export const ensureStatic = 'shell';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
