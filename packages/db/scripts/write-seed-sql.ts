/** Print the deterministic seed as SQL, e.g. `node scripts/write-seed-sql.ts > seed.sql`. */
import { seedStatements } from '../src/seed.ts';

process.stdout.write(`${seedStatements().join('\n')}\n`);
