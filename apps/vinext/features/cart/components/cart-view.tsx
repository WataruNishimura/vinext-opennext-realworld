import { getCart } from '@realworld/core/cart/cart-queries';
import { prefetch } from '@realworld/core/render-stages';
import { buttonClasses } from '@realworld/ui/button';
import { Card } from '@realworld/ui/card';
import { Link } from '@realworld/ui/link';
import { Price } from '@realworld/ui/price';
import { ProductImage } from '@realworld/ui/product-image';
import { Skeleton } from '@realworld/ui/skeleton';
import { CartLineActions } from './cart-line-actions.tsx';

export async function CartView() {
  await prefetch();
  const { lines, summary } = await getCart();

  if (lines.length === 0) {
    return (
      <Card className="flex flex-col items-start gap-4 p-6">
        <p>Your cart is empty.</p>
        <Link href="/all" prefetch className={buttonClasses()}>
          Browse products
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="divide-line flex flex-col divide-y">
        {lines.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center gap-4 py-4">
            <ProductImage
              productId={product.id}
              name={product.name}
              className="size-16 rounded-lg"
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
            <CartLineActions productId={product.id} name={product.name} quantity={quantity} />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between text-lg font-semibold">
        <span>
          Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
        </span>
        <Price cents={summary.subtotalCents} />
      </div>
    </div>
  );
}

export function CartViewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-20 rounded-lg" />
      ))}
    </div>
  );
}
