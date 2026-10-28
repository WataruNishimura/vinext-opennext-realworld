import { cn } from './cn.ts';
import { Skeleton } from './skeleton.tsx';

/** The exact stock count. A request-time value: keep it in its own `<Suspense>`. */
export function LiveStock({ stock }: { stock: number }) {
  return (
    <p className="flex items-center gap-2 text-sm" data-testid="live-stock">
      <span
        aria-hidden
        className={cn('size-2 rounded-full', stock > 0 ? 'bg-success' : 'bg-danger')}
      />
      {stock > 0 ? `${stock} in stock` : 'Out of stock'}
    </p>
  );
}

export function LiveStockSkeleton() {
  return <Skeleton className="h-5 w-24" />;
}
