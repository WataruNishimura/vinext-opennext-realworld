/**
 * Run a Next.js command (`next dev`, `next build`, `next start`) with a D1 database behind it.
 *
 * - With `CLOUDFLARE_D1_API_TOKEN` in the environment or in `.env.local`, or on Vercel, the
 *   command runs as is and lib/database.ts reaches the configured database over the D1 REST API.
 * - Otherwise this starts a migrated, seeded D1 database in Miniflare behind the emulated D1 REST
 *   API (`@realworld/db/testing`) and points the command at it. Nothing remote is touched.
 *
 * `next build` needs the database too: Cache Components prerender the cached reads of the static
 * shell at build time.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Usage: node scripts/with-d1.ts <command> [...args]');
  process.exit(2);
}

function hasRemoteD1(): boolean {
  if (process.env['VERCEL'] || process.env['CLOUDFLARE_D1_API_TOKEN']) return true;
  return (
    existsSync('.env.local') &&
    Boolean(parseEnv(readFileSync('.env.local', 'utf8'))['CLOUDFLARE_D1_API_TOKEN'])
  );
}

async function startLocalD1(): Promise<{
  env: Record<string, string>;
  dispose: () => Promise<void>;
}> {
  const { createTestDatabase } = await import('@realworld/db/testing');
  const { seed } = await import('@realworld/db/seed');
  const database = await createTestDatabase({ port: Number(process.env['LOCAL_D1_PORT'] ?? 0) });
  await seed(database.db);
  console.log(`Local D1 (Miniflare, seeded) at ${database.api.baseUrl}`);
  return {
    env: {
      CLOUDFLARE_ACCOUNT_ID: database.api.accountId,
      CLOUDFLARE_D1_DATABASE_ID: database.api.databaseId,
      CLOUDFLARE_D1_API_TOKEN: database.api.apiToken,
      CLOUDFLARE_API_BASE_URL: database.api.baseUrl,
    },
    dispose: database.dispose,
  };
}

const local = hasRemoteD1() ? null : await startLocalD1();

const child = spawn(command, args, {
  stdio: 'inherit',
  env: { ...process.env, ...local?.env },
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => child.kill(signal));
}
child.on('exit', (code, signal) => {
  void (local?.dispose() ?? Promise.resolve()).finally(() => {
    process.exit(code ?? (signal ? 1 : 0));
  });
});
