import { getCart } from '@realworld/core/cart/cart-queries';
import { getStockStatus } from '@realworld/core/product/product-queries';
import { prefetch } from '@realworld/core/render-stages';
import { Skeleton } from '@realworld/ui/skeleton';
import { AddToCartButton } from './add-to-cart-button.tsx';

export async function AddToCart({ productId }: { productId: number }) {
  await prefetch();
  const [cart, status] = await Promise.all([getCart(), getStockStatus(productId)]);
  const inCart = cart.lines.some(line => line.product.id === productId);
  return <AddToCartButton productId={productId} inCart={inCart} soldOut={status === 'sold-out'} />;
}

export function AddToCartSkeleton() {
  return <Skeleton className="h-10 w-36 rounded-lg" />;
}
