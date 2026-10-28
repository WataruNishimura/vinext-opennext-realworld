import { getStockStatus } from '@realworld/core/product/product-queries';
import { StockBadge } from '@realworld/ui/stock-badge';

/** Coarse availability: `'use cache: remote'`, `minutes`, tagged `stock:<id>`. */
export async function ProductStockBadge({ productId }: { productId: number }) {
  return <StockBadge status={await getStockStatus(productId)} />;
}
