import { DEMO_ACCOUNT_ID } from '@realworld/db/seed';
import { describe, expect, it } from 'vitest';
import {
  findCategoryBySlug,
  listCategories,
  listCategoriesWithCount,
} from '../src/category/category-data.ts';
import {
  findProductById,
  findProductsByIds,
  listFeaturedProducts,
  listReviews,
  readStock,
  searchProducts,
  setProductFeatured,
  summarizeReviews,
} from '../src/product/product-data.ts';
import { normalizeProductSearch } from '../src/product/product-search.ts';
import { useSeededDatabase } from './seeded-database.ts';

const database = useSeededDatabase();

describe('categories', () => {
  it('lists categories alphabetically', async () => {
    const categories = await listCategories(database().db);
    expect(categories.map(category => category.slug)).toEqual([
      'accessories',
      'audio',
      'electronics',
      'home',
      'kitchen',
      'smart-home',
      'wearables',
    ]);
  });

  it('counts products per category', async () => {
    const categories = await listCategoriesWithCount(database().db);
    expect(categories.find(category => category.slug === 'audio')?.productCount).toBe(4);
  });

  it('finds a category by slug', async () => {
    expect((await findCategoryBySlug(database().db, 'smart-home'))?.name).toBe('Smart Home');
    expect(await findCategoryBySlug(database().db, 'missing')).toBeNull();
  });
});

describe('products', () => {
  it('returns product details with the category', async () => {
    const product = await findProductById(database().db, 1);
    expect(product).toMatchObject({
      id: 1,
      name: 'Wireless Headphones',
      priceCents: 19999,
      category: { slug: 'audio', name: 'Audio' },
      featured: true,
      sku: 'RW-0001',
    });
  });

  it('returns null for an unknown product', async () => {
    expect(await findProductById(database().db, 9999)).toBeNull();
  });

  it('returns products by id in the requested order', async () => {
    const products = await findProductsByIds(database().db, [17, 2, 9999, 6]);
    expect(products.map(product => product.id)).toEqual([17, 2, 6]);
  });

  it('returns nothing for an empty id list', async () => {
    expect(await findProductsByIds(database().db, [])).toEqual([]);
  });
});

describe('searchProducts', () => {
  it('pages the whole catalog by name', async () => {
    const page = await searchProducts(database().db, normalizeProductSearch({}));
    expect(page.total).toBe(28);
    expect(page.totalPages).toBe(4);
    expect(page.products).toHaveLength(9);
    expect(page.products[0]?.name).toBe('Air Purifier');
  });

  it('returns the last partial page', async () => {
    const page = await searchProducts(database().db, normalizeProductSearch({ page: '4' }));
    expect(page.products).toHaveLength(1);
    expect(page.page).toBe(4);
  });

  it('matches names case-insensitively', async () => {
    const page = await searchProducts(database().db, normalizeProductSearch({ q: 'DESK' }));
    expect(page.products.map(product => product.name)).toEqual(['Desk Lamp', 'Desk Mat']);
  });

  it('treats LIKE wildcards in the query literally', async () => {
    const page = await searchProducts(database().db, normalizeProductSearch({ q: '%' }));
    expect(page.total).toBe(0);
  });

  it('filters by category and sorts by price', async () => {
    const page = await searchProducts(
      database().db,
      normalizeProductSearch({ category: 'audio', sort: 'price-desc' }),
    );
    expect(page.products.map(product => product.priceCents)).toEqual([19999, 14900, 12950, 7999]);
  });
});

describe('featured products', () => {
  it('lists featured products, most recently featured first', async () => {
    const products = await listFeaturedProducts(database().db, 4);
    expect(products.map(product => product.name)).toEqual([
      'Fitness Watch',
      'Pour-Over Kettle',
      'Ultrawide Monitor',
      'Wireless Headphones',
    ]);
  });

  it('fills up with the newest products when fewer are featured', async () => {
    const products = await listFeaturedProducts(database().db, 6);
    expect(products).toHaveLength(6);
    expect(products.slice(4).map(product => product.featured)).toEqual([false, false]);
  });

  it('features and unfeatures a product', async () => {
    const { db } = database();
    const now = new Date(Date.UTC(2026, 5, 1));

    expect(await setProductFeatured(db, 9, true, now)).toBe(true);
    expect((await listFeaturedProducts(db, 1))[0]?.id).toBe(9);

    expect(await setProductFeatured(db, 9, false, now)).toBe(true);
    expect((await findProductById(db, 9))?.featured).toBe(false);
  });

  it('reports an unknown product', async () => {
    expect(await setProductFeatured(database().db, 9999, true, new Date())).toBe(false);
  });
});

describe('reviews', () => {
  it('lists reviews newest first', async () => {
    const reviews = await listReviews(database().db, 1);
    expect(reviews.length).toBeGreaterThan(0);
    const times = reviews.map(review => Date.parse(review.createdAt));
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it('summarizes the count and average rating', async () => {
    const reviews = await listReviews(database().db, 1);
    const summary = await summarizeReviews(database().db, 1);
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    expect(summary.count).toBe(reviews.length);
    expect(summary.average).toBeCloseTo(average, 5);
  });

  it('summarizes a product without reviews as zero', async () => {
    expect(await summarizeReviews(database().db, 9999)).toEqual({ count: 0, average: 0 });
  });
});

describe('readStock', () => {
  it('reads the live stock count', async () => {
    expect(await readStock(database().db, 7)).toBe(0);
    expect(await readStock(database().db, 9999)).toBeNull();
  });
});

describe('seeded demo account', () => {
  it('exists', () => {
    expect(DEMO_ACCOUNT_ID).toMatch(/^[0-9a-f-]{36}$/);
  });
});
