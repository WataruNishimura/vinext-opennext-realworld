import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Miniflare } from 'miniflare';
import { createDb, type D1Binding, type Database } from './client.ts';
import type { D1HttpOptions } from './d1-http.ts';
import { readMigrations } from './migrations.ts';

/** How to reach the test database through the emulated D1 REST API (see `createD1HttpBinding`). */
export type TestD1HttpApi = Required<Omit<D1HttpOptions, 'fetch'>> & {
  /** Sends a request straight into Miniflare, without a network round trip. */
  fetch: typeof fetch;
};

export type TestDatabase = {
  /** Typed Drizzle client over the Miniflare D1 binding. */
  db: Database;
  /** The raw D1 binding, as a Worker would receive it. */
  binding: D1Binding;
  /** The same database behind the D1 endpoints of the Cloudflare REST API. */
  api: TestD1HttpApi;
  dispose: () => Promise<void>;
};

export type TestDatabaseOptions = {
  /** Serve the REST API on this port (default: a free port on 127.0.0.1). */
  port?: number;
  host?: string;
};

const WORKER = fileURLToPath(new URL('d1-http-api.worker.js', import.meta.url));
const ACCOUNT_ID = 'test-account';
const API_TOKEN = 'test-token';

/**
 * Start an in-memory D1 database in Miniflare (the same workerd runtime as production) and apply
 * every migration. Each call returns an isolated database, so test files never share state.
 */
export async function createTestDatabase(options: TestDatabaseOptions = {}): Promise<TestDatabase> {
  const databaseId = crypto.randomUUID();
  const miniflare = new Miniflare({
    modules: true,
    scriptPath: WORKER,
    // Module paths are relative to this root, so the worker loads from any working directory.
    modulesRoot: dirname(WORKER),
    d1Databases: { DB: databaseId },
    bindings: { ACCOUNT_ID, DATABASE_ID: databaseId, API_TOKEN },
    host: options.host ?? '127.0.0.1',
    port: options.port ?? 0,
  });

  // Miniflare ships its own copy of the D1 types; the runtime object is the real binding.
  const binding: D1Binding = await miniflare.getD1Database('DB');

  for (const migration of await readMigrations()) {
    await binding.batch(migration.statements.map(statement => binding.prepare(statement)));
  }

  const url = await miniflare.ready;
  return {
    db: createDb(binding),
    binding,
    api: {
      baseUrl: new URL('client/v4', url).href,
      accountId: ACCOUNT_ID,
      databaseId,
      apiToken: API_TOKEN,
      fetch: async (input, init) => {
        const request = new Request(input, init);
        const response = await miniflare.dispatchFetch(request.url, {
          method: request.method,
          headers: Object.fromEntries(request.headers),
          body: request.body ? await request.text() : null,
        });
        return new Response(await response.arrayBuffer(), {
          status: response.status,
          headers: Object.fromEntries(response.headers),
        });
      },
    },
    dispose: () => miniflare.dispose(),
  };
}
