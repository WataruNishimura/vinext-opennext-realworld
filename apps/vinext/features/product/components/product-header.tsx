import { getProduct, getReviewSummary } from '@realworld/core/product/product-queries';
import {
  ProductHeader as ProductHeaderView,
  ProductHeaderSkeleton,
} from '@realworld/ui/product-header';

export { ProductHeaderSkeleton };

/** Product header: cached per product, so a `<Link prefetch>` carries it. */
export async function ProductHeader({ productId }: { productId: number }) {
  const [product, summary] = await Promise.all([
    getProduct(productId),
    getReviewSummary(productId),
  ]);
  return <ProductHeaderView product={product} summary={summary} />;
}
