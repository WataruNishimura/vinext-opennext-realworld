import { getCartCount } from '@realworld/core/cart/cart-queries';
import { prefetch } from '@realworld/core/render-stages';
import { CartIconLink } from '@realworld/ui/cart-link';

/** Header cart badge, per session. Its fallback is the same link without a count. */
export async function CartLink() {
  await prefetch();
  return <CartIconLink count={await getCartCount()} />;
}
