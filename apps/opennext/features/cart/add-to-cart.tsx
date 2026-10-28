import { getCart } from '@realworld/core/cart/cart-queries';
import { prefetch } from '@realworld/core/render-stages';
import { Skeleton } from '@realworld/ui/skeleton';
import { AddToCartButton } from './add-to-cart-button.tsx';

/** Per session (`cart:<cartId>`), so it renders with a per-link prefetch, not in the shell. */
export async function AddToCart({ productId }: { productId: number }) {
  await prefetch();
  const cart = await getCart();
  const quantity = cart.lines.find(line => line.product.id === productId)?.quantity ?? 0;
  return <AddToCartButton productId={productId} quantity={quantity} />;
}

export function AddToCartSkeleton() {
  return <Skeleton className="h-10 w-40" />;
}
