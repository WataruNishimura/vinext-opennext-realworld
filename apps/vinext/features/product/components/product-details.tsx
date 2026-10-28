import { getProduct } from '@realworld/core/product/product-queries';
import {
  ProductDetails as ProductDetailsView,
  ProductDetailsSkeleton,
} from '@realworld/ui/product-details';

export { ProductDetailsSkeleton };

export async function ProductDetails({ productId }: { productId: number }) {
  return <ProductDetailsView product={await getProduct(productId)} />;
}
