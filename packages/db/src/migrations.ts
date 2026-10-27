import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Directory holding the drizzle-kit generated SQL migrations, for `cf d1 migrations apply --dir`. */
export const migrationsDir = fileURLToPath(new URL('../migrations/', import.meta.url));

export type Migration = { name: string; statements: string[] };

/** Split a drizzle-kit migration file into individual statements. */
export function splitMigration(sql: string): string[] {
  return sql
    .split('--> statement-breakpoint')
    .map(statement => statement.trim())
    .filter(statement => statement.length > 0);
}

/** Read every migration in numeric order, the same order `cf d1 migrations apply` uses. */
export async function readMigrations(dir: string = migrationsDir): Promise<Migration[]> {
  const files = (await readdir(dir)).filter(file => file.endsWith('.sql')).sort();
  return Promise.all(
    files.map(async name => ({
      name,
      statements: splitMigration(await readFile(join(dir, name), 'utf8')),
    })),
  );
}
