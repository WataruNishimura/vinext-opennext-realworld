import { Link } from './link.tsx';

/**
 * The header cart link. Without a `count` (the session is still streaming) it is a plain link;
 * with one, its accessible name carries the count and a badge shows a non-empty cart.
 */
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
