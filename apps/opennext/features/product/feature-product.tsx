import { getProduct } from '@realworld/core/product/product-queries';
import { prefetch } from '@realworld/core/render-stages';
import { getCurrentAccount } from '@realworld/core/user/user-queries';
import { FeatureProductButton } from './feature-product-button.tsx';

/** Curators (any signed-in demo account) can feature a product on the home page. */
export async function FeatureProduct({ productId }: { productId: number }) {
  await prefetch();
  const [account, product] = await Promise.all([getCurrentAccount(), getProduct(productId)]);
  if (!account) return null;
  return <FeatureProductButton productId={productId} featured={product.featured} />;
}
