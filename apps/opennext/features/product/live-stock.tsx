import { getLiveStock } from '@realworld/core/product/product-queries';
import { Skeleton } from '@realworld/ui/skeleton';

/** Exact stock, uncached: fresh on every request, in its own `<Suspense>`. */
export async function LiveStock({ productId }: { productId: number }) {
  const stock = await getLiveStock(productId);
  return (
    <p className="flex items-center gap-2 text-sm" data-testid="live-stock">
      <span
        aria-hidden
        className={stock > 0 ? 'bg-success size-2 rounded-full' : 'bg-danger size-2 rounded-full'}
      />
      {stock > 0 ? `${stock} in stock` : 'Out of stock'}
    </p>
  );
}

export function LiveStockSkeleton() {
  return <Skeleton className="h-5 w-24" />;
}
