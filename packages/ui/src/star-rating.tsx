import { cn } from './cn.ts';

export type StarFill = 'full' | 'half' | 'empty';

/** Five star fills for a rating, rounded to the nearest half star. */
export function starFills(rating: number): StarFill[] {
  const halves = Math.round(Math.min(5, Math.max(0, rating)) * 2);
  return Array.from({ length: 5 }, (_, index) => {
    const remaining = halves - index * 2;
    return remaining >= 2 ? 'full' : remaining === 1 ? 'half' : 'empty';
  });
}

const STAR_PATH = 'M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z';

export function StarRating({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const label = `Rated ${rating.toFixed(1)} out of 5${
    count === undefined ? '' : ` from ${count} ${count === 1 ? 'review' : 'reviews'}`
  }`;
  return (
    <span className={cn('text-warning inline-flex items-center gap-0.5', className)}>
      {starFills(rating).map((fill, index) => (
        <svg key={index} viewBox="0 0 20 20" className="size-4" aria-hidden>
          <defs>
            <linearGradient id={`rw-star-half-${index}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d={STAR_PATH}
            stroke="currentColor"
            strokeWidth="1.2"
            fill={
              fill === 'full'
                ? 'currentColor'
                : fill === 'half'
                  ? `url(#rw-star-half-${index})`
                  : 'none'
            }
          />
        </svg>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}
