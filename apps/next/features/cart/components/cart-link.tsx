import { getCartCount } from '@realworld/core/cart/cart-queries';
import { prefetch } from '@realworld/core/render-stages';
import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';
import { Skeleton } from '@realworld/ui/skeleton';
import { cartLinkLabel } from '../../../lib/routing.ts';

export async function CartLink() {
  await prefetch();
  const count = await getCartCount();
  return (
    <Link
      href="/cart"
      prefetch
      aria-label={cartLinkLabel(count)}
      className={buttonClasses({ variant: 'secondary', size: 'sm' })}
    >
      Cart
      <span className="bg-accent text-on-accent min-w-5 rounded-full px-1.5 text-xs tabular-nums">
        {count}
      </span>
    </Link>
  );
}

export function CartLinkSkeleton() {
  return <Skeleton className="h-8 w-20 rounded-lg" />;
}
