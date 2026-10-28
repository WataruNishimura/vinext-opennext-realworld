/** A `[id]` route param as a product id, or null when it is not a positive integer. */
export function parseProductId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
