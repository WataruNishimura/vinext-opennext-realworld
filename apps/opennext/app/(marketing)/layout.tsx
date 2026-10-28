import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';
import type { ReactNode } from 'react';
import { SiteFooter } from '../../components/site-footer.tsx';
import { SiteHeader } from '../../components/site-header.tsx';
import { CartIconLink } from '../../features/cart/cart-link.tsx';

/** Marketing pages are fully static: no session reads anywhere in the route. */
export const ensureStatic = 'navigation';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        account={
          <Link href="/account" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
            Account
          </Link>
        }
        cart={<CartIconLink />}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-12">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
