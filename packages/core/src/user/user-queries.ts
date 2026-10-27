import 'server-only';

import { getDb } from '../database.ts';
import { cacheLife, cacheTag, cookies, redirect } from '../framework/next.ts';
import { productTags } from '../product/product-cache.ts';
import type { Product } from '../product/types/product.ts';
import type { Account, SessionAccount } from './types/account.ts';
import { userTags } from './user-cache.ts';
import {
  findAccountById,
  listRecommendedProducts,
  listSavedProductIds,
  listSavedProducts,
} from './user-data.ts';
import { ACCOUNT_COOKIE, CART_COOKIE, isCartId } from './user-session.ts';

export type Session = { accountId: string | null; cartId: string | null };

const RECOMMENDATION_LIMIT = 4;

/** Read the session cookies. Uncached: Server Functions call this to authorize themselves. */
export async function readSession(): Promise<Session> {
  const store = await cookies();
  const cartId = store.get(CART_COOKIE)?.value;
  return {
    accountId: store.get(ACCOUNT_COOKIE)?.value ?? null,
    cartId: isCartId(cartId) ? cartId : null,
  };
}

/** The signed-in account, read fresh. Server Functions use this to authorize themselves. */
export async function verifyAccount(): Promise<Account | null> {
  const { accountId } = await readSession();
  return accountId ? findAccountById(await getDb(), accountId) : null;
}

/**
 * The visitor's session, cached privately in the browser so per-session content can be
 * prefetched. Sign-in, sign-out and cart creation update the `session` tag.
 */
export async function getSession(): Promise<Session> {
  'use cache: private';
  cacheLife({ stale: 300 });
  cacheTag(userTags.session);

  return readSession();
}

/** Shared server cache per account id. Unexported: callers go through the session. */
async function getAccountById(accountId: string): Promise<Account | null> {
  'use cache';
  cacheLife('max');
  cacheTag(userTags.account(accountId));

  return findAccountById(await getDb(), accountId);
}

/** The signed-in account, narrowed to what the header and menus need. */
export async function getCurrentAccount(): Promise<SessionAccount | null> {
  const { accountId } = await getSession();
  if (!accountId) return null;
  const account = await getAccountById(accountId);
  return account ? { id: account.id, name: account.name, email: account.email } : null;
}

/** The signed-in account's full profile, or a redirect to sign in. */
export async function requireAccount(redirectTo = '/'): Promise<Account> {
  const { accountId } = await getSession();
  const account = accountId ? await getAccountById(accountId) : null;
  if (!account) redirect(`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
  return account;
}

async function getSavedProductsForAccount(accountId: string): Promise<Product[]> {
  'use cache';
  cacheLife('max');
  cacheTag(userTags.saved(accountId), productTags.all);

  return listSavedProducts(await getDb(), accountId);
}

async function getSavedProductIdsForAccount(accountId: string): Promise<number[]> {
  'use cache';
  cacheLife('max');
  cacheTag(userTags.saved(accountId));

  return listSavedProductIds(await getDb(), accountId);
}

async function getRecommendationsForAccount(accountId: string): Promise<Product[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(userTags.saved(accountId), productTags.featured, productTags.all);

  return listRecommendedProducts(await getDb(), accountId, RECOMMENDATION_LIMIT);
}

/** Saved products for the signed-in account; empty when signed out. Gate with `prefetch()`. */
export async function getSavedProducts(): Promise<Product[]> {
  const { accountId } = await getSession();
  return accountId ? getSavedProductsForAccount(accountId) : [];
}

/** One cached entry per account answers this for every product page. */
export async function isProductSaved(productId: number): Promise<boolean> {
  const { accountId } = await getSession();
  if (!accountId) return false;
  return (await getSavedProductIdsForAccount(accountId)).includes(productId);
}

/** Personal recommendations. Gate with `navigation()`: they are below the fold. */
export async function getRecommendations(): Promise<Product[]> {
  const { accountId } = await getSession();
  return accountId ? getRecommendationsForAccount(accountId) : [];
}
