import { getReviews } from '@realworld/core/product/product-queries';
import { navigation } from '@realworld/core/render-stages';
import { ReviewList, ReviewListSkeleton } from '@realworld/ui/review-list';

export { ReviewListSkeleton as ReviewsSkeleton };

export async function Reviews({ productId }: { productId: number }) {
  await navigation(); // keep review bodies out of every prefetch
  return <ReviewList reviews={await getReviews(productId)} />;
}
