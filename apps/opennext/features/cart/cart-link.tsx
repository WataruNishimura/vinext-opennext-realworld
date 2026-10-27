import { getCartCount } from '@realworld/core/cart/cart-queries';
import { prefetch } from '@realworld/core/render-stages';
import { Link } from '@realworld/ui/link';

/** Header cart badge. Per session, so it waits for a per-link prefetch or the navigation. */
export async function CartLink() {
  await prefetch();
  const count = await getCartCount();
  return <CartIconLink count={count} />;
}

export function CartIconLink({ count }: { count?: number }) {
  const label =
    count === undefined ? 'Cart' : `Cart with ${count} ${count === 1 ? 'item' : 'items'}`;
  return (
    <Link
      href="/cart"
      prefetch
      aria-label={label}
      className="hover:bg-line/50 relative inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium"
    >
      Cart
      {count !== undefined && count > 0 ? (
        <span
          aria-hidden
          className="bg-accent text-on-accent inline-grid min-w-5 place-items-center rounded-full px-1.5 text-xs tabular-nums"
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
