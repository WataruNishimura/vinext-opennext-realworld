import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDb, schema } from '../src/index.ts';
import { createTestDatabase, type TestDatabase } from '../src/testing.ts';

describe('createTestDatabase', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  afterAll(async () => {
    await testDb.dispose();
  });

  it('applies every migration to a fresh D1 database', async () => {
    const result = await testDb.binding
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all<{ name: string }>();
    const tables = result.results.map(row => row.name);

    expect(tables).toEqual(
      expect.arrayContaining([
        'accounts',
        'cart_items',
        'categories',
        'inventory',
        'products',
        'reviews',
        'saved_products',
      ]),
    );
  });

  it('starts empty', async () => {
    expect(await testDb.db.$count(schema.products)).toBe(0);
  });
});

describe('createDb', () => {
  it('returns the same drizzle instance for the same binding', async () => {
    const testDb = await createTestDatabase();
    try {
      expect(createDb(testDb.binding)).toBe(createDb(testDb.binding));
    } finally {
      await testDb.dispose();
    }
  });
});
