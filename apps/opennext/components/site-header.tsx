import { Link } from '@realworld/ui/link';
import type { ReactNode } from 'react';

export function SiteHeader({ account, cart }: { account: ReactNode; cart: ReactNode }) {
  return (
    <header className="border-line bg-surface-raised/80 sticky top-0 z-40 border-b backdrop-blur [view-transition-name:site-header]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            RealWorld
          </Link>
          <nav aria-label="Main" className="text-muted flex items-center gap-4 text-sm">
            <Link href="/all" prefetch className="hover:text-ink">
              Products
            </Link>
            <Link href="/about" className="hover:text-ink">
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {account}
          {cart}
        </div>
      </div>
    </header>
  );
}
