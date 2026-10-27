import { getReviews } from '@realworld/core/product/product-queries';
import { navigation } from '@realworld/core/render-stages';
import { Card } from '@realworld/ui/card';
import { Skeleton } from '@realworld/ui/skeleton';
import { StarRating } from '@realworld/ui/star-rating';

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

/** Full review bodies: cached per product, but kept out of every prefetch with `navigation()`. */
export async function Reviews({ productId }: { productId: number }) {
  await navigation();
  const reviews = await getReviews(productId);
  if (reviews.length === 0) {
    return <p className="text-muted">No reviews yet for this product.</p>;
  }
  return (
    <ul className="flex flex-col gap-4">
      {reviews.map(review => (
        <li key={review.id}>
          <Card className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">{review.title}</h3>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-muted text-sm leading-relaxed">{review.body}</p>
            <p className="text-muted text-xs">
              {review.authorName} · {dateFormat.format(new Date(review.createdAt))}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}
