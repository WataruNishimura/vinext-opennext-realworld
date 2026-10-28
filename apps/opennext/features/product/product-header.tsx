import { getProduct, getReviewSummary } from '@realworld/core/product/product-queries';
import {
  ProductHeader as ProductHeaderView,
  ProductHeaderSkeleton,
} from '@realworld/ui/product-header';

export { ProductHeaderSkeleton };

/** `'use cache'` per product (`product:<id>`, `reviews:<id>`): resolved by a per-link prefetch. */
export async function ProductHeader({ productId }: { productId: number }) {
  const [product, summary] = await Promise.all([
    getProduct(productId),
    getReviewSummary(productId),
  ]);
  return <ProductHeaderView product={product} summary={summary} />;
}
