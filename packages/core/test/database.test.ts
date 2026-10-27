import { createTestDatabase } from '@realworld/db/testing';
import { describe, expect, it } from 'vitest';
import {
  configureDatabase,
  DatabaseNotConfiguredError,
  getDb,
  resetDatabase,
} from '../src/database.ts';

describe('getDb', () => {
  it('fails with a wiring hint before an app configures the binding', async () => {
    resetDatabase();
    await expect(getDb()).rejects.toBeInstanceOf(DatabaseNotConfiguredError);
  });

  it('resolves the binding lazily on every call and reuses the client', async () => {
    const testDb = await createTestDatabase();
    try {
      let calls = 0;
      configureDatabase(() => {
        calls += 1;
        return Promise.resolve(testDb.binding);
      });

      const first = await getDb();
      const second = await getDb();

      expect(calls).toBe(2);
      expect(first).toBe(second);
    } finally {
      resetDatabase();
      await testDb.dispose();
    }
  });
});
