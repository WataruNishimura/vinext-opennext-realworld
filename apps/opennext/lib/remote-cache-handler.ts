import composableCache from '@opennextjs/aws/adapters/composable-cache.js';

/**
 * OpenNext registers its KV-backed composable cache only as `cacheHandlers.default`, and it
 * replaces any `cacheHandlers` from next.config.ts at runtime. Next.js then backs
 * `'use cache: remote'` with its built-in in-memory handler, which OpenNext disables
 * (`cacheMaxMemorySize: 0`), so remote entries would never be stored.
 *
 * Next.js reads platform-provided handlers from this global symbol when it initializes cache
 * handlers (next/dist/server/use-cache/handlers.js), so `remote` gets the same durable handler.
 */
const HANDLERS = Symbol.for('@next/cache-handlers');

type PlatformCacheHandlers = { DefaultCache?: unknown; RemoteCache?: unknown };

export function registerRemoteCacheHandler(): void {
  const registry = globalThis as typeof globalThis & { [HANDLERS]?: PlatformCacheHandlers };
  registry[HANDLERS] = { ...registry[HANDLERS], RemoteCache: composableCache };
}
