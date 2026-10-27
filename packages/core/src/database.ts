import { createDb, type D1Binding, type Database } from '@realworld/db';

/**
 * Returns the D1 binding for the current request. Each app supplies its own:
 * OpenNext reads `getCloudflareContext().env`, vinext reads `env` from `cloudflare:workers`.
 */
export type DatabaseResolver = () => D1Binding | Promise<D1Binding>;

const RESOLVER = Symbol.for('@realworld/core/database-resolver');

// Stored on globalThis so every bundle layer (RSC, SSR, Server Functions) sees the same resolver.
const registry = globalThis as typeof globalThis & { [RESOLVER]?: DatabaseResolver };

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      'No D1 binding configured. Call configureDatabase(() => env.DB) from @realworld/core/database ' +
        'in a module every server entry imports (see README: "Wiring D1").',
    );
    this.name = 'DatabaseNotConfiguredError';
  }
}

/** Register how `@realworld/core` obtains the D1 binding. Call once per server runtime. */
export function configureDatabase(resolver: DatabaseResolver): void {
  registry[RESOLVER] = resolver;
}

/** Forget the configured resolver. Intended for tests. */
export function resetDatabase(): void {
  Reflect.deleteProperty(registry, RESOLVER);
}

/** The typed Drizzle client for the current request's D1 binding. */
export async function getDb(): Promise<Database> {
  const resolver = registry[RESOLVER];
  if (!resolver) throw new DatabaseNotConfiguredError();
  return createDb(await resolver());
}
