import { describe, expect, it } from 'vitest';
import { cartTags } from '../src/cart/cart-cache.ts';
import { MAX_CART_QUANTITY, summarizeCart } from '../src/cart/cart-math.ts';
import { categoryTags } from '../src/category/category-cache.ts';
import { formatPrice } from '../src/money.ts';
import { productTags } from '../src/product/product-cache.ts';
import {
  normalizeProductSearch,
  PRODUCT_PAGE_SIZE,
  productSearchParams,
} from '../src/product/product-search.ts';
import { LOW_STOCK_THRESHOLD, stockStatus } from '../src/product/product-stock.ts';
import { userTags } from '../src/user/user-cache.ts';
import { isCartId } from '../src/user/user-session.ts';

describe('cache tags', () => {
  it('names catalog data with global and scoped tags', () => {
    expect(categoryTags.all).toBe('categories');
    expect(productTags.all).toBe('products');
    expect(productTags.featured).toBe('featured-products');
    expect(productTags.detail(7)).toBe('product:7');
    expect(productTags.reviews(7)).toBe('reviews:7');
    expect(productTags.stock(7)).toBe('stock:7');
  });

  it('scopes per-session and per-account data by an opaque id', () => {
    expect(cartTags.cart('c1')).toBe('cart:c1');
    expect(userTags.session).toBe('session');
    expect(userTags.account('a1')).toBe('account:a1');
    expect(userTags.saved('a1')).toBe('saved:a1');
  });

  it('never collides between scopes', () => {
    const tags = [
      categoryTags.all,
      productTags.all,
      productTags.featured,
      productTags.detail(1),
      productTags.reviews(1),
      productTags.stock(1),
      cartTags.cart('1'),
      userTags.session,
      userTags.account('1'),
      userTags.saved('1'),
    ];
    expect(new Set(tags).size).toBe(tags.length);
  });
});

describe('normalizeProductSearch', () => {
  it('falls back to defaults', () => {
    expect(normalizeProductSearch({})).toEqual({
      query: '',
      sort: 'name-asc',
      page: 1,
      category: null,
    });
  });

  it('trims and lowercases the query and keeps the first repeated value', () => {
    expect(normalizeProductSearch({ q: ['  Desk LAMP ', 'other'] }).query).toBe('desk lamp');
  });

  it('caps the query length', () => {
    expect(normalizeProductSearch({ q: 'x'.repeat(200) }).query).toHaveLength(64);
  });

  it('accepts known sorts and rejects unknown ones', () => {
    expect(normalizeProductSearch({ sort: 'price-desc' }).sort).toBe('price-desc');
    expect(normalizeProductSearch({ sort: 'random' }).sort).toBe('name-asc');
  });

  it('clamps the page to a positive integer', () => {
    expect(normalizeProductSearch({ page: '3' }).page).toBe(3);
    expect(normalizeProductSearch({ page: '-2' }).page).toBe(1);
    expect(normalizeProductSearch({ page: '2.7' }).page).toBe(2);
    expect(normalizeProductSearch({ page: 'abc' }).page).toBe(1);
    expect(normalizeProductSearch({ page: '99999' }).page).toBe(1000);
  });

  it('only keeps slug-shaped categories', () => {
    expect(normalizeProductSearch({ category: 'smart-home' }).category).toBe('smart-home');
    expect(normalizeProductSearch({ category: 'DROP TABLE' }).category).toBeNull();
  });

  it('gives equivalent inputs the same result so they share a cache entry', () => {
    expect(normalizeProductSearch({ q: ' Lamp', page: '0' })).toEqual(
      normalizeProductSearch({ q: 'lamp', page: '1', sort: 'name-asc' }),
    );
  });

  it('pages nine products at a time', () => {
    expect(PRODUCT_PAGE_SIZE).toBe(9);
  });
});

describe('productSearchParams', () => {
  it('omits defaults so canonical URLs stay short', () => {
    expect(productSearchParams(normalizeProductSearch({}))).toBe('');
  });

  it('serializes non-default values in a stable order', () => {
    const search = normalizeProductSearch({
      q: 'lamp',
      sort: 'price-asc',
      page: '2',
      category: 'home',
    });
    expect(productSearchParams(search)).toBe('q=lamp&sort=price-asc&category=home&page=2');
    expect(productSearchParams(search, { page: 1 })).toBe('q=lamp&sort=price-asc&category=home');
  });
});

describe('stockStatus', () => {
  it('maps a stock count to a coarse status', () => {
    expect(stockStatus(0)).toBe('sold-out');
    expect(stockStatus(1)).toBe('low-stock');
    expect(stockStatus(LOW_STOCK_THRESHOLD)).toBe('low-stock');
    expect(stockStatus(LOW_STOCK_THRESHOLD + 1)).toBe('in-stock');
  });
});

describe('summarizeCart', () => {
  it('sums quantities and line totals', () => {
    expect(
      summarizeCart([
        { quantity: 2, product: { priceCents: 1000 } },
        { quantity: 1, product: { priceCents: 250 } },
      ]),
    ).toEqual({ itemCount: 3, subtotalCents: 2250 });
  });

  it('is empty for an empty cart', () => {
    expect(summarizeCart([])).toEqual({ itemCount: 0, subtotalCents: 0 });
  });

  it('caps a line at ten', () => {
    expect(MAX_CART_QUANTITY).toBe(10);
  });
});

describe('formatPrice', () => {
  it('formats cents as a currency amount', () => {
    expect(formatPrice(19999)).toBe('$199.99');
    expect(formatPrice(5900)).toBe('$59.00');
  });
});

describe('isCartId', () => {
  it('only accepts UUIDs', () => {
    expect(isCartId(crypto.randomUUID())).toBe(true);
    expect(isCartId('cart-1')).toBe(false);
    expect(isCartId(undefined)).toBe(false);
  });
});
