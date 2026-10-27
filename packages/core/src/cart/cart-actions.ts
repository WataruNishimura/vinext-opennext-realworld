'use server';

import { z } from 'zod';
import type { ActionError } from '../action-result.ts';
import { getDb } from '../database.ts';
import { cookies, updateTag } from '../framework/next.ts';
import { readProductStock } from '../product/product-data.ts';
import { userTags } from '../user/user-cache.ts';
import { readSession } from '../user/user-queries.ts';
import { CART_COOKIE, createCartId, sessionCookieOptions } from '../user/user-session.ts';
import { cartTags } from './cart-cache.ts';
import {
  addCartItem,
  getCartItemQuantity,
  removeCartItem,
  setCartItemQuantity,
} from './cart-data.ts';
import { MAX_CART_QUANTITY } from './cart-math.ts';
import { parseInput } from '../validation.ts';

const productIdSchema = z.int().positive({ error: 'Invalid product.' });
const quantitySchema = z
  .int({ error: 'Quantity must be between 1 and 10.' })
  .min(1, { error: 'Quantity must be between 1 and 10.' })
  .max(MAX_CART_QUANTITY, { error: 'Quantity must be between 1 and 10.' });

type QuantityResult = { ok: true; quantity: number } | ActionError;

/** Check the requested quantity against live stock (never a cached read). */
async function checkStock(productId: number, quantity: number): Promise<ActionError | null> {
  const product = await readProductStock(await getDb(), productId);
  if (!product) return { ok: false, error: 'Product not found.' };
  if (product.stock === 0) return { ok: false, error: `${product.name} is sold out.` };
  if (quantity > product.stock) return { ok: false, error: `Only ${product.stock} available.` };
  return null;
}

export async function addToCart(productId: number, quantity = 1): Promise<QuantityResult> {
  const id = parseInput(productIdSchema, productId);
  if (!id.ok) return id;
  const amount = parseInput(quantitySchema, quantity);
  if (!amount.ok) return amount;

  const { cartId: existingCartId } = await readSession();
  const db = await getDb();
  const current = existingCartId ? await getCartItemQuantity(db, existingCartId, id.data) : 0;
  const stockError = await checkStock(id.data, Math.min(current + amount.data, MAX_CART_QUANTITY));
  if (stockError) return stockError;

  const cartId = existingCartId ?? createCartId();
  if (!existingCartId) {
    (await cookies()).set(CART_COOKIE, cartId, sessionCookieOptions());
  }

  const next = await addCartItem(db, cartId, id.data, amount.data, new Date());
  updateTag(cartTags.cart(cartId));
  // A new cart changes the session's cart id; existing carts leave the session untouched.
  if (!existingCartId) updateTag(userTags.session);
  return { ok: true, quantity: next };
}

export async function updateCartQuantity(
  productId: number,
  quantity: number,
): Promise<QuantityResult> {
  const id = parseInput(productIdSchema, productId);
  if (!id.ok) return id;
  const amount = parseInput(quantitySchema, quantity);
  if (!amount.ok) return amount;

  const { cartId } = await readSession();
  const db = await getDb();
  if (!cartId || (await getCartItemQuantity(db, cartId, id.data)) === 0) {
    return { ok: false, error: 'That product is not in your cart.' };
  }
  const stockError = await checkStock(id.data, amount.data);
  if (stockError) return stockError;

  await setCartItemQuantity(db, cartId, id.data, amount.data);
  updateTag(cartTags.cart(cartId));
  return { ok: true, quantity: amount.data };
}

export async function removeFromCart(productId: number): Promise<{ ok: true } | ActionError> {
  const id = parseInput(productIdSchema, productId);
  if (!id.ok) return id;

  const { cartId } = await readSession();
  if (!cartId) return { ok: true };

  await removeCartItem(await getDb(), cartId, id.data);
  updateTag(cartTags.cart(cartId));
  return { ok: true };
}
