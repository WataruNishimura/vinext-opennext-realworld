export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = 'in-stock' | 'low-stock' | 'sold-out';

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'sold-out';
  if (stock <= LOW_STOCK_THRESHOLD) return 'low-stock';
  return 'in-stock';
}
