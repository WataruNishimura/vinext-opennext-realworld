import { Miniflare } from 'miniflare';
import { createDb, type D1Binding, type Database } from './client.ts';
import { readMigrations } from './migrations.ts';

export type TestDatabase = {
  /** Typed Drizzle client over the Miniflare D1 binding. */
  db: Database;
  /** The raw D1 binding, as a Worker would receive it. */
  binding: D1Binding;
  dispose: () => Promise<void>;
};

/**
 * Start an in-memory D1 database in Miniflare (the same workerd runtime as production) and apply
 * every migration. Each call returns an isolated database, so test files never share state.
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  const miniflare = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response(null, { status: 404 }); } };',
    d1Databases: { DB: crypto.randomUUID() },
  });

  // Miniflare ships its own copy of the D1 types; the runtime object is the real binding.
  const binding: D1Binding = await miniflare.getD1Database('DB');

  for (const migration of await readMigrations()) {
    await binding.batch(migration.statements.map(statement => binding.prepare(statement)));
  }

  return {
    db: createDb(binding),
    binding,
    dispose: () => miniflare.dispose(),
  };
}
