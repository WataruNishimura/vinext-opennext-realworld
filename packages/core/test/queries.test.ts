import { DEMO_ACCOUNT_ID } from '@realworld/db/seed';
import { beforeEach, describe, expect, it } from 'vitest';
import { getCart, getCartCount } from '../src/cart/cart-queries.ts';
import { addCartItem } from '../src/cart/cart-data.ts';
import {
  getCategories,
  getCategoriesWithCount,
  getCategory,
} from '../src/category/category-queries.ts';
import {
  getFeaturedProducts,
  getLiveStock,
  getProduct,
  getProductsByIds,
  getProductsPage,
  getReviews,
  getReviewSummary,
  getStockStatus,
} from '../src/product/product-queries.ts';
import { normalizeProductSearch } from '../src/product/product-search.ts';
import {
  getCurrentAccount,
  getRecommendations,
  getSavedProducts,
  getSession,
  isProductSaved,
  requireAccount,
} from '../src/user/user-queries.ts';
import { ACCOUNT_COOKIE, CART_COOKIE } from '../src/user/user-session.ts';
import { cookieStore, nextMock, NotFoundError, RedirectError } from './next-mock.ts';
import { useSeededDatabase } from './seeded-database.ts';

const database = useSeededDatabase();

beforeEach(() => {
  nextMock.reset();
});

describe('static shell tier', () => {
  it('caches categories for the shell', async () => {
    expect(await getCategories()).toHaveLength(7);
    expect(nextMock.cacheTags).toEqual(['categories']);
    expect(nextMock.cacheLifes).toEqual(['days']);
  });

  it('tags category counts with the catalog', async () => {
    await getCategoriesWithCount();
    expect(nextMock.cacheTags).toEqual(['categories', 'products']);
  });

  it('owns notFound for an unknown category', async () => {
    expect((await getCategory('audio')).name).toBe('Audio');
    await expect(getCategory('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('product tier', () => {
  it('caches a product under its own tag', async () => {
    expect((await getProduct(1)).name).toBe('Wireless Headphones');
    expect(nextMock.cacheTags).toEqual(['products', 'product:1']);
    expect(nextMock.cacheLifes).toEqual(['hours']);
  });

  it('throws notFound for unknown or invalid ids', async () => {
    await expect(getProduct(9999)).rejects.toBeInstanceOf(NotFoundError);
    await expect(getProduct(-1)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('tags products fetched by id with each product', async () => {
    await getProductsByIds([2, 3]);
    expect(nextMock.cacheTags).toEqual(['products', 'product:2', 'product:3']);
  });

  it('serves catalog pages from the remote cache tier', async () => {
    const page = await getProductsPage(normalizeProductSearch({ category: 'audio' }));
    expect(page.total).toBe(4);
    expect(nextMock.cacheTags).toEqual(['products']);
  });

  it('serves featured products from the remote cache tier, tagged featured', async () => {
    expect(await getFeaturedProducts()).toHaveLength(4);
    expect(nextMock.cacheTags).toEqual(['featured-products', 'products']);
    expect(nextMock.cacheLifes).toEqual(['max']);
  });

  it('caches coarse stock status in the remote tier for minutes', async () => {
    expect(await getStockStatus(7)).toBe('sold-out');
    expect(await getStockStatus(10)).toBe('low-stock');
    expect(await getStockStatus(1)).toBe('in-stock');
    expect(nextMock.cacheTags).toContain('stock:7');
    expect(nextMock.cacheLifes).toEqual(['minutes', 'minutes', 'minutes']);
  });

  it('reads live stock uncached', async () => {
    expect(await getLiveStock(7)).toBe(0);
    expect(nextMock.cacheTags).toEqual([]);
    expect(nextMock.cacheLifes).toEqual([]);
  });

  it('caches reviews and their summary under the reviews tag', async () => {
    const summary = await getReviewSummary(1);
    const reviews = await getReviews(1);
    expect(summary.count).toBe(reviews.length);
    expect(nextMock.cacheTags).toEqual(['reviews:1', 'reviews:1']);
  });
});

describe('session tier', () => {
  it('reads the session privately from cookies', async () => {
    const cartId = crypto.randomUUID();
    cookieStore.set(ACCOUNT_COOKIE, DEMO_ACCOUNT_ID);
    cookieStore.set(CART_COOKIE, cartId);

    expect(await getSession()).toEqual({ accountId: DEMO_ACCOUNT_ID, cartId });
    expect(nextMock.cacheTags).toEqual(['session']);
  });

  it('ignores a malformed cart cookie', async () => {
    cookieStore.set(CART_COOKIE, 'not-a-uuid');
    expect((await getSession()).cartId).toBeNull();
  });

  it('returns the signed-in account, cached per account', async () => {
    cookieStore.set(ACCOUNT_COOKIE, DEMO_ACCOUNT_ID);
    expect(await getCurrentAccount()).toEqual({
      id: DEMO_ACCOUNT_ID,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
    });
    expect(nextMock.cacheTags).toContain(`account:${DEMO_ACCOUNT_ID}`);
  });

  it('returns null for a signed-out visitor or an unknown account', async () => {
    expect(await getCurrentAccount()).toBeNull();
    cookieStore.set(ACCOUNT_COOKIE, 'missing');
    expect(await getCurrentAccount()).toBeNull();
  });

  it('redirects to sign in when an account is required', async () => {
    await expect(requireAccount('/user')).rejects.toEqual(
      new RedirectError('/sign-in?redirectTo=%2Fuser'),
    );
  });
});

describe('per-account tier', () => {
  beforeEach(() => {
    cookieStore.set(ACCOUNT_COOKIE, DEMO_ACCOUNT_ID);
  });

  it('caches saved products per account', async () => {
    expect((await getSavedProducts()).map(product => product.id)).toEqual([17, 6, 2]);
    expect(nextMock.cacheTags).toContain(`saved:${DEMO_ACCOUNT_ID}`);
  });

  it('answers whether a product is saved from one entry per account', async () => {
    expect(await isProductSaved(17)).toBe(true);
    expect(await isProductSaved(1)).toBe(false);
  });

  it('tags recommendations with saved products and the featured selection', async () => {
    expect(await getRecommendations()).toHaveLength(4);
    expect(nextMock.cacheTags).toEqual(
      expect.arrayContaining([`saved:${DEMO_ACCOUNT_ID}`, 'featured-products']),
    );
  });

  it('returns nothing account-scoped for a signed-out visitor', async () => {
    cookieStore.delete(ACCOUNT_COOKIE);
    expect(await getSavedProducts()).toEqual([]);
    expect(await isProductSaved(17)).toBe(false);
    expect(await getRecommendations()).toEqual([]);
  });
});

describe('per-session cart tier', () => {
  it('is empty without a cart cookie', async () => {
    expect(await getCart()).toEqual({ lines: [], summary: { itemCount: 0, subtotalCents: 0 } });
    expect(await getCartCount()).toBe(0);
  });

  it('caches the cart per cart id', async () => {
    const cartId = crypto.randomUUID();
    await addCartItem(database().db, cartId, 9, 2, new Date());
    cookieStore.set(CART_COOKIE, cartId);

    const cart = await getCart();
    expect(cart.summary).toEqual({ itemCount: 2, subtotalCents: 11800 });
    expect(await getCartCount()).toBe(2);
    expect(nextMock.cacheTags).toEqual(expect.arrayContaining([`cart:${cartId}`, 'products']));
  });
});
