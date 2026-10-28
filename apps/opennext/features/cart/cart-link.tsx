import { getCartCount } from '@realworld/core/cart/cart-queries';
import { prefetch } from '@realworld/core/render-stages';
import { CartIconLink } from '@realworld/ui/cart-link';

export { CartIconLink };

/** Header cart badge. Per session, so it waits for a per-link prefetch or the navigation. */
export async function CartLink() {
  await prefetch();
  const count = await getCartCount();
  return <CartIconLink count={count} />;
}
