import { type Database, schema } from '@realworld/db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { productSelection, toProduct } from '../product/product-data.ts';
import type { Product } from '../product/types/product.ts';
import { MAX_CART_QUANTITY } from './cart-math.ts';

const { cartItems, categories, products } = schema;

export type CartLine = { product: Product; quantity: number };

const clampQuantity = (quantity: number) =>
  Math.min(MAX_CART_QUANTITY, Math.max(1, Math.floor(quantity)));

const lineWhere = (cartId: string, productId: number) =>
  and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId));

export async function listCartLines(db: Database, cartId: string): Promise<CartLine[]> {
  const rows = await db
    .select({ ...productSelection, quantity: cartItems.quantity })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.addedAt), asc(cartItems.productId));
  return rows.map(row => ({ product: toProduct(row), quantity: row.quantity }));
}

export async function countCartItems(db: Database, cartId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`coalesce(sum(${cartItems.quantity}), 0)`.mapWith(Number) })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));
  return row?.count ?? 0;
}

/** Add to a line, creating it if needed. Returns the line's new quantity (capped at ten). */
export async function addCartItem(
  db: Database,
  cartId: string,
  productId: number,
  quantity: number,
  now: Date,
): Promise<number> {
  const [row] = await db
    .insert(cartItems)
    .values({ cartId, productId, quantity: clampQuantity(quantity), addedAt: now })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: {
        quantity: sql`min(${cartItems.quantity} + excluded.quantity, ${MAX_CART_QUANTITY})`,
      },
    })
    .returning({ quantity: cartItems.quantity });
  return row?.quantity ?? 0;
}

/** Set a line's quantity. Returns false when the product is not in the cart. */
export async function setCartItemQuantity(
  db: Database,
  cartId: string,
  productId: number,
  quantity: number,
): Promise<boolean> {
  const updated = await db
    .update(cartItems)
    .set({ quantity: clampQuantity(quantity) })
    .where(lineWhere(cartId, productId))
    .returning({ productId: cartItems.productId });
  return updated.length > 0;
}

export async function removeCartItem(db: Database, cartId: string, productId: number) {
  await db.delete(cartItems).where(lineWhere(cartId, productId));
}

export async function getCartItemQuantity(
  db: Database,
  cartId: string,
  productId: number,
): Promise<number> {
  const [row] = await db
    .select({ quantity: cartItems.quantity })
    .from(cartItems)
    .where(lineWhere(cartId, productId))
    .limit(1);
  return row?.quantity ?? 0;
}
