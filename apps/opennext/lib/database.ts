import 'server-only';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { configureDatabase } from '@realworld/core/database';
import { getLocalDatabase, runsOutsideWorkerd } from './local-context.ts';

/**
 * Wire @realworld/core to the Worker's D1 binding. Imported by the root layout and
 * instrumentation.ts, so every server entry configures it before the first query.
 */
configureDatabase(async () =>
  runsOutsideWorkerd() ? getLocalDatabase() : (await getCloudflareContext({ async: true })).env.DB,
);
