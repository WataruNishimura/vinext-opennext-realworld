import type { StockStatus } from '@realworld/core';
import { cn } from './cn.ts';

const LABELS: Record<StockStatus, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Only a few left',
  'sold-out': 'Sold out',
};

const TONES: Record<StockStatus, string> = {
  'in-stock': 'text-success',
  'low-stock': 'text-warning',
  'sold-out': 'text-danger',
};

export function StockBadge({ status, className }: { status: StockStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full border border-current/30 px-2 text-xs font-medium',
        TONES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}

/** Same footprint as the badge, for a `<Suspense>` fallback. */
export function StockBadgeSkeleton() {
  return <span aria-hidden className="bg-line inline-block h-6 w-20 animate-pulse rounded-full" />;
}
