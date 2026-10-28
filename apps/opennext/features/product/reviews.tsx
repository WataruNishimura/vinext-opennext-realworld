import { getReviews } from '@realworld/core/product/product-queries';
import { navigation } from '@realworld/core/render-stages';
import { ReviewList, ReviewListSkeleton } from '@realworld/ui/review-list';

export { ReviewListSkeleton as ReviewsSkeleton };

/** Full review bodies: cached per product, but kept out of every prefetch with `navigation()`. */
export async function Reviews({ productId }: { productId: number }) {
  await navigation();
  return <ReviewList reviews={await getReviews(productId)} />;
}
