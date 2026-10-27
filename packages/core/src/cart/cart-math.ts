export const MAX_CART_QUANTITY = 10;

export type CartSummary = { itemCount: number; subtotalCents: number };

export function summarizeCart(
  lines: readonly { quantity: number; product: { priceCents: number } }[],
): CartSummary {
  return lines.reduce<CartSummary>(
    (summary, line) => ({
      itemCount: summary.itemCount + line.quantity,
      subtotalCents: summary.subtotalCents + line.quantity * line.product.priceCents,
    }),
    { itemCount: 0, subtotalCents: 0 },
  );
}
