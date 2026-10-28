import type { Review } from '@realworld/core';
import { Card } from './card.tsx';
import { Skeleton } from './skeleton.tsx';
import { StarRating } from './star-rating.tsx';

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

export function ReviewList({ reviews }: { reviews: Review[] }) {
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
              {review.authorName} ·{' '}
              <time dateTime={review.createdAt}>
                {dateFormat.format(new Date(review.createdAt))}
              </time>
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export function ReviewListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}
