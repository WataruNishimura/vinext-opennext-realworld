import 'server-only';

import { getDb } from '../database.ts';
import { cacheLife, cacheTag } from '../framework/next.ts';
import { productTags } from '../product/product-cache.ts';
import { getSession } from '../user/user-queries.ts';
import { cartTags } from './cart-cache.ts';
import { countCartItems, listCartLines, type CartLine } from './cart-data.ts';
import { summarizeCart, type CartSummary } from './cart-math.ts';

export type Cart = { lines: CartLine[]; summary: CartSummary };

const EMPTY_CART: Cart = { lines: [], summary: { itemCount: 0, subtotalCents: 0 } };

/** Cached per cart id; every cart write goes through a cart action that updates the tag. */
async function getCartById(cartId: string): Promise<Cart> {
  'use cache';
  cacheLife('max');
  cacheTag(cartTags.cart(cartId), productTags.all);

  const lines = await listCartLines(await getDb(), cartId);
  return { lines, summary: summarizeCart(lines) };
}

async function getCartCountById(cartId: string): Promise<number> {
  'use cache';
  cacheLife('max');
  cacheTag(cartTags.cart(cartId));

  return countCartItems(await getDb(), cartId);
}

/** The visitor's cart. Per session, so gate it with `prefetch()` to keep it out of the shell. */
export async function getCart(): Promise<Cart> {
  const { cartId } = await getSession();
  return cartId ? getCartById(cartId) : EMPTY_CART;
}

/** Item count for the header badge. */
export async function getCartCount(): Promise<number> {
  const { cartId } = await getSession();
  return cartId ? getCartCountById(cartId) : 0;
}
