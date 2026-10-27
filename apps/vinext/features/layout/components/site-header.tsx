import { Link } from '@realworld/ui/link';
import { Suspense } from 'react';
import { CartLink, CartLinkSkeleton } from '../../cart/components/cart-link.tsx';
import { UserMenu, UserMenuSkeleton } from '../../user/components/user-menu.tsx';

/** Static header: the per-session cart badge and account menu stream into their own boundaries. */
export function SiteHeader() {
  return (
    <header className="border-line bg-surface-raised border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Commerce
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm sm:gap-3">
          <Link href="/all" prefetch className="hover:bg-line/50 rounded-lg px-2 py-1">
            Shop
          </Link>
          <Link href="/about" prefetch className="hover:bg-line/50 rounded-lg px-2 py-1">
            About
          </Link>
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
          <Suspense fallback={<CartLinkSkeleton />}>
            <CartLink />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
