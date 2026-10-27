import type { D1Database } from '@cloudflare/workers-types';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema.ts';

export type Schema = typeof schema;

/** The typed Drizzle database every query and mutation in `@realworld/core` receives. */
export type Database = DrizzleD1Database<Schema>;

/**
 * The Cloudflare D1 binding, as declared in `cloudflare.config.ts` and read from
 * `getCloudflareContext().env` (OpenNext) or `cloudflare:workers` (vinext).
 * Imported as a module type so the global Workers types never leak into Node code.
 */
export type D1Binding = D1Database;

const instances = new WeakMap<D1Binding, Database>();

/**
 * Wrap a D1 binding in a typed Drizzle client. The same binding always yields the same client,
 * so calling this on every request is cheap.
 */
export function createDb(binding: D1Binding): Database {
  const existing = instances.get(binding);
  if (existing) return existing;

  const db = drizzle(binding, { schema });
  instances.set(binding, db);
  return db;
}
