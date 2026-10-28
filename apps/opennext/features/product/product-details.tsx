import { getProduct } from '@realworld/core/product/product-queries';
import {
  ProductDetails as ProductDetailsView,
  ProductDetailsSkeleton,
} from '@realworld/ui/product-details';

export { ProductDetailsSkeleton };

/** Same cached entry as the header (`product:<id>`). */
export async function ProductDetails({ productId }: { productId: number }) {
  return <ProductDetailsView product={await getProduct(productId)} />;
}
