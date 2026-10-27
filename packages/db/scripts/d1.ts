/**
 * Apply migrations or the deterministic seed to a D1 database with the Cloudflare `cf` CLI.
 *
 *   node scripts/d1.ts migrate [--remote] [--persist-to <dir>]
 *   node scripts/d1.ts seed [--remote] [--persist-to <dir>]
 *
 * `cf` identifies databases by ID (never by name) and targets the remote database by default,
 * so this script reads the ID from `D1_DATABASE_ID` and runs against the local simulation
 * unless `--remote` is passed explicitly.
 *
 * `cf d1 query` has no local mode yet, so the local seed opens the same persisted state `cf`
 * uses (Miniflare's `<persist-to>/v3/d1` layout) and runs the statements there.
 */
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { Miniflare } from 'miniflare';
import { migrationsDir } from '../src/migrations.ts';
import { seedStatements } from '../src/seed.ts';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    remote: { type: 'boolean', default: false },
    'persist-to': { type: 'string', default: join(homedir(), '.config', 'cloudflare', 'state') },
  },
});

const command = positionals[0];
const databaseId = process.env['D1_DATABASE_ID'];
const persistTo = values['persist-to'];

if (command !== 'migrate' && command !== 'seed') {
  console.error('Usage: node scripts/d1.ts <migrate|seed> [--remote] [--persist-to <dir>]');
  process.exit(1);
}
if (!databaseId) {
  console.error('Set D1_DATABASE_ID to the database ID declared in cloudflare.config.ts.');
  process.exit(1);
}

function cf(args: string[]): never {
  const target = values.remote ? [] : ['--local', '--persist-to', persistTo];
  const result = spawnSync('cf', [...args, ...target], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

async function seedLocal(id: string) {
  const miniflare = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response(null, { status: 404 }); } };',
    d1Databases: { DB: id },
    d1Persist: join(persistTo, 'v3', 'd1'),
  });
  try {
    const db = await miniflare.getD1Database('DB');
    await db.batch(seedStatements().map(statement => db.prepare(statement)));
    const { results } = await db
      .prepare('SELECT count(*) AS products FROM products')
      .all<{ products: number }>();
    console.log(`Seeded local D1 ${id}: ${results[0]?.products ?? 0} products.`);
  } finally {
    await miniflare.dispose();
  }
}

if (command === 'migrate') {
  cf(['d1', 'migrations', 'apply', databaseId, '--dir', migrationsDir]);
} else if (values.remote) {
  cf(['d1', 'query', databaseId, '--sql', seedStatements().join('\n')]);
} else {
  await seedLocal(databaseId);
}
