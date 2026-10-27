import { getStockStatus } from '@realworld/core/product/product-queries';
import { StockBadge } from '@realworld/ui/stock-badge';

/** Coarse availability from the short-lived remote cache. Wrap in `<Suspense>`. */
export async function StockStatus({ productId }: { productId: number }) {
  return <StockBadge status={await getStockStatus(productId)} />;
}
