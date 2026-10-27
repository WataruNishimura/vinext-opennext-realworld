import { seed } from '@realworld/db/seed';
import { createTestDatabase, type TestDatabase } from '@realworld/db/testing';
import { afterAll, beforeAll } from 'vitest';
import { configureDatabase } from '../src/database.ts';

/**
 * Register a seeded Miniflare D1 database for the current test file and wire it into
 * `configureDatabase`, exactly as an app would with its D1 binding.
 */
export function useSeededDatabase(): () => TestDatabase {
  let testDb: TestDatabase | undefined;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    await seed(testDb.db);
    const { binding } = testDb;
    configureDatabase(() => binding);
  });

  afterAll(async () => {
    await testDb?.dispose();
  });

  return () => {
    if (!testDb) throw new Error('The test database is only available inside tests.');
    return testDb;
  };
}
