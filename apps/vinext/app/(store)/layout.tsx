import { CartIconLink } from '@realworld/ui/cart-link';
import { StoreShell } from '@realworld/ui/store-shell';
import { Suspense, type ReactNode } from 'react';
import { CartLink } from '../../features/cart/components/cart-link.tsx';
import { UserMenu, UserMenuSkeleton } from '../../features/user/components/user-menu.tsx';

// Next.js asserts the layout stays in the static shell; vinext ignores this export (see README).
export const ensureStatic = 'shell';

/** The per-session cart badge and account menu stream into their own boundaries. */
export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <StoreShell
      runtime="vinext"
      account={
        <Suspense fallback={<UserMenuSkeleton />}>
          <UserMenu />
        </Suspense>
      }
      cart={
        <Suspense fallback={<CartIconLink />}>
          <CartLink />
        </Suspense>
      }
    >
      {children}
    </StoreShell>
  );
}
