import { MAX_CART_QUANTITY } from '@realworld/core';
import { getCart } from '@realworld/core/cart/cart-queries';
import { prefetch } from '@realworld/core/render-stages';
import { buttonClasses } from '@realworld/ui/button';
import { Card } from '@realworld/ui/card';
import { Link } from '@realworld/ui/link';
import { Price } from '@realworld/ui/price';
import { ProductImage } from '@realworld/ui/product-image';
import { Skeleton } from '@realworld/ui/skeleton';
import { CartLineActions } from './cart-line-actions.tsx';

/** The visitor's cart: `'use cache'` per cart id (`cart:<cartId>`), after `prefetch()`. */
export async function Cart() {
  await prefetch();
  const { lines, summary } = await getCart();

  if (lines.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link href="/all" prefetch className={buttonClasses()}>
          Browse products
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {lines.map(({ product, quantity }) => (
          <li key={product.id}>
            <Card className="flex items-center gap-4 p-4">
              <ProductImage
                productId={product.id}
                name={product.name}
                className="size-20 text-lg"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${product.id}`}
                  prefetch
                  className="font-medium hover:underline"
                >
                  {product.name}
                </Link>
                <Price cents={product.priceCents} className="text-muted block text-sm" />
              </div>
              <CartLineActions
                productId={product.id}
                name={product.name}
                quantity={quantity}
                max={MAX_CART_QUANTITY}
              />
            </Card>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-end gap-4 text-lg">
        <span className="text-muted">
          Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
        </span>
        <Price cents={summary.subtotalCents} />
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 2 }, (_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}
