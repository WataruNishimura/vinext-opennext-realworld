import type { ReactNode } from 'react';
import { buttonClasses } from './button.tsx';
import { CartIconLink } from './cart-link.tsx';
import { Link } from './link.tsx';
import { SiteFooter } from './site-footer.tsx';
import { SiteHeader } from './site-header.tsx';

/** Header, main column and footer of every store page. */
export function StoreShell({
  account,
  cart,
  runtime,
  children,
}: {
  account: ReactNode;
  cart: ReactNode;
  runtime: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader account={account} cart={cart} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8">
        {children}
      </main>
      <SiteFooter runtime={runtime} />
    </div>
  );
}

/** Fully static pages (about): plain account and cart links instead of per-session slots. */
export function MarketingShell({ runtime, children }: { runtime: string; children: ReactNode }) {
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
      <SiteFooter runtime={runtime} />
    </div>
  );
}
