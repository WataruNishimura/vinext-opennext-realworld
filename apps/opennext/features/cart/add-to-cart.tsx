import { addToCart } from '@realworld/core/cart/cart-actions';
import { getCart } from '@realworld/core/cart/cart-queries';
import { getStockStatus } from '@realworld/core/product/product-queries';
import { prefetch } from '@realworld/core/render-stages';
import { AddToCartButton, AddToCartSkeleton } from '@realworld/ui/add-to-cart-button';

export { AddToCartSkeleton };

/** Per session (`cart:<cartId>`), so it renders with a per-link prefetch, not in the shell. */
export async function AddToCart({ productId }: { productId: number }) {
  await prefetch();
  const [cart, status] = await Promise.all([getCart(), getStockStatus(productId)]);
  const quantity = cart.lines.find(line => line.product.id === productId)?.quantity ?? 0;
  return (
    <AddToCartButton
      productId={productId}
      quantity={quantity}
      soldOut={status === 'sold-out'}
      action={addToCart}
    />
  );
}
