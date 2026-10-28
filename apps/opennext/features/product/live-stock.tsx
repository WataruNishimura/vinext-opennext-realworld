import { getLiveStock } from '@realworld/core/product/product-queries';
import { LiveStock as LiveStockView, LiveStockSkeleton } from '@realworld/ui/live-stock';

export { LiveStockSkeleton };

/** Exact stock, uncached: fresh on every request, in its own `<Suspense>`. */
export async function LiveStock({ productId }: { productId: number }) {
  return <LiveStockView stock={await getLiveStock(productId)} />;
}
