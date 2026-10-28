import { Suspense, type ReactNode } from 'react';
import { SiteFooter } from '../../components/site-footer.tsx';
import { SiteHeader } from '../../components/site-header.tsx';
import { CartIconLink, CartLink } from '../../features/cart/cart-link.tsx';
import { AccountMenu, AccountMenuSkeleton } from '../../features/user/account-menu.tsx';

/** Every store page's App Shell is static: session content waits behind `prefetch()`. */
export const ensureStatic = 'shell';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
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
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
