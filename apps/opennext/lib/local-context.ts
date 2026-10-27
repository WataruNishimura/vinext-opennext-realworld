import type { D1Binding } from '@realworld/db';
import type * as Seed from '@realworld/db/seed';
import type * as Testing from '@realworld/db/testing';

/**
 * Outside workerd (`next build` prerendering, `next dev`, `next start`) there is no Worker `env`, so D1 comes
 * from an in-memory Miniflare database with the same migrations and deterministic seed as the
 * deployed one. One per Node process: every prerender worker builds its own.
 *
 * The modules load through bundler-ignored imports at runtime, so Miniflare stays a Node-only
 * dependency and never reaches the Worker bundle.
 */
// Joined at runtime: a string literal gets constant-folded into the chunk and followed by
// OpenNext's esbuild step, which would then try to bundle Miniflare into the Worker.
const moduleId = (...parts: string[]) => parts.join('/');
const TESTING_MODULE = moduleId('@realworld', 'db', 'testing');
const SEED_MODULE = moduleId('@realworld', 'db', 'seed');

let localDatabase: Promise<D1Binding> | undefined;

export function runsOutsideWorkerd(): boolean {
  const runtime = globalThis.navigator as Navigator | undefined;
  return runtime?.userAgent !== 'Cloudflare-Workers';
}

export function getLocalDatabase(): Promise<D1Binding> {
  localDatabase ??= createLocalDatabase();
  return localDatabase;
}

async function createLocalDatabase(): Promise<D1Binding> {
  const testing = (await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ TESTING_MODULE
  )) as typeof Testing;
  const { seed } = (await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ SEED_MODULE
  )) as typeof Seed;
  const { db, binding } = await testing.createTestDatabase();
  await seed(db);
  return binding;
}
