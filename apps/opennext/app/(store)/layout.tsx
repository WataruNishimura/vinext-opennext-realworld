import { StoreShell } from '@realworld/ui/store-shell';
import { Suspense, type ReactNode } from 'react';
import { CartIconLink, CartLink } from '../../features/cart/cart-link.tsx';
import { AccountMenu, AccountMenuSkeleton } from '../../features/user/account-menu.tsx';

/** Every store page's App Shell is static: session content waits behind `prefetch()`. */
export const ensureStatic = 'shell';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <StoreShell
      runtime="OpenNext"
      account={
        <Suspense fallback={<AccountMenuSkeleton />}>
          <AccountMenu />
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
