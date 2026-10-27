const formatters = new Map<string, Intl.NumberFormat>();

/** Format an amount in the smallest currency unit, e.g. `formatPrice(19999)` → `$199.99`. */
export function formatPrice(cents: number, currency = 'USD', locale = 'en-US'): string {
  const key = `${locale}:${currency}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
    formatters.set(key, formatter);
  }
  return formatter.format(cents / 100);
}
