import { getReviews } from '@realworld/core/product/product-queries';
import { navigation } from '@realworld/core/render-stages';
import { Skeleton } from '@realworld/ui/skeleton';
import { StarRating } from '@realworld/ui/star-rating';

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' });

export async function Reviews({ productId }: { productId: number }) {
  await navigation(); // keep review bodies out of every prefetch
  const reviews = await getReviews(productId);

  if (reviews.length === 0) return <p className="text-muted">No reviews yet.</p>;

  return (
    <ul className="flex flex-col gap-6">
      {reviews.map(review => (
        <li key={review.id} className="flex flex-col gap-1">
          <StarRating rating={review.rating} />
          <h3 className="font-medium">{review.title}</h3>
          <p>{review.body}</p>
          <p className="text-muted text-sm">
            {review.authorName} ·{' '}
            <time dateTime={review.createdAt}>{dateFormat.format(new Date(review.createdAt))}</time>
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-20 rounded-lg" />
      ))}
    </div>
  );
}
