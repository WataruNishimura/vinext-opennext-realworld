import { getLiveStock } from '@realworld/core/product/product-queries';
import { Skeleton } from '@realworld/ui/skeleton';

/** Exact stock, uncached on every request. Keep it in its own `<Suspense>`. */
export async function LiveStock({ productId }: { productId: number }) {
  const stock = await getLiveStock(productId);
  return (
    <p className="text-muted text-sm" aria-live="polite">
      {stock > 0 ? `${stock} in stock` : 'Out of stock'}
    </p>
  );
}

export function LiveStockSkeleton() {
  return <Skeleton className="h-5 w-24" />;
}
