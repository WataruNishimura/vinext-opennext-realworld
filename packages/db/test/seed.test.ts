import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '../src/index.ts';
import { buildSeedData, DEMO_ACCOUNT_ID, seed, seedStatements } from '../src/seed.ts';
import { createTestDatabase, type TestDatabase } from '../src/testing.ts';

describe('buildSeedData', () => {
  it('is deterministic', () => {
    expect(buildSeedData()).toEqual(buildSeedData());
  });

  it('gives every product an inventory row and a valid category', () => {
    const data = buildSeedData();
    const categoryIds = new Set(data.categories.map(category => category.id));

    expect(data.products.length).toBeGreaterThanOrEqual(24);
    for (const product of data.products) {
      expect(categoryIds.has(product.categoryId)).toBe(true);
      expect(data.inventory.some(row => row.productId === product.id)).toBe(true);
      expect(product.priceCents).toBeGreaterThan(0);
    }
  });

  it('features a handful of products and leaves some out of stock', () => {
    const data = buildSeedData();

    expect(data.products.filter(product => product.featured).length).toBe(4);
    expect(data.inventory.some(row => row.stock === 0)).toBe(true);
    expect(data.inventory.some(row => row.stock > 0 && row.stock <= 5)).toBe(true);
  });

  it('writes reviews with ratings between 1 and 5', () => {
    const { reviews } = buildSeedData();

    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews.every(review => review.rating >= 1 && review.rating <= 5)).toBe(true);
  });

  it('includes the demo account with saved products', () => {
    const data = buildSeedData();

    expect(data.accounts.some(account => account.id === DEMO_ACCOUNT_ID)).toBe(true);
    expect(data.savedProducts.some(saved => saved.accountId === DEMO_ACCOUNT_ID)).toBe(true);
  });
});

describe('seed', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  afterAll(async () => {
    await testDb.dispose();
  });

  it('inserts the seed data', async () => {
    const data = buildSeedData();
    await seed(testDb.db);

    expect(await testDb.db.$count(schema.categories)).toBe(data.categories.length);
    expect(await testDb.db.$count(schema.products)).toBe(data.products.length);
    expect(await testDb.db.$count(schema.inventory)).toBe(data.inventory.length);
    expect(await testDb.db.$count(schema.reviews)).toBe(data.reviews.length);
    expect(await testDb.db.$count(schema.accounts)).toBe(data.accounts.length);
    expect(await testDb.db.$count(schema.savedProducts)).toBe(data.savedProducts.length);
  });

  it('can run again and resets the data, including carts', async () => {
    await testDb.db
      .insert(schema.cartItems)
      .values({ cartId: 'cart-1', productId: 1, quantity: 2, addedAt: new Date(0) });

    await seed(testDb.db);

    expect(await testDb.db.$count(schema.products)).toBe(buildSeedData().products.length);
    expect(await testDb.db.$count(schema.cartItems)).toBe(0);
  });
});

describe('seedStatements', () => {
  it('renders SQL that recreates the seed on a fresh database', async () => {
    const testDb = await createTestDatabase();
    try {
      // D1 `exec` runs one statement per line.
      await testDb.binding.exec(seedStatements().join('\n'));

      expect(await testDb.db.$count(schema.products)).toBe(buildSeedData().products.length);
      expect(await testDb.db.$count(schema.reviews)).toBe(buildSeedData().reviews.length);
    } finally {
      await testDb.dispose();
    }
  });
});
