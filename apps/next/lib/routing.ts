import { productSearchParams, type ProductSearch } from '@realworld/core';

/** A `[id]` route param as a product id, or null when it is not a positive integer. */
export function parseProductId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/** Accessible name of the header cart link. */
export function cartLinkLabel(count: number): string {
  return `Cart with ${count} ${count === 1 ? 'item' : 'items'}`;
}

/** The catalog URL for a search, leaving out defaults so equal searches share one URL. */
export function catalogHref(search: ProductSearch, overrides: Partial<ProductSearch> = {}): string {
  const query = productSearchParams(search, overrides);
  return query ? `/all?${query}` : '/all';
}
