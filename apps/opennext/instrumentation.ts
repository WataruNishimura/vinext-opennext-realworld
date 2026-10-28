import './lib/database.ts';
import { tolerateCrossRequestTimerCleanup } from './lib/cross-request-timers.ts';
import { runsOutsideWorkerd } from './lib/local-context.ts';
// Imported statically: OpenNext's bundle has no factory for a dynamic chunk loaded from here.
import { registerRemoteCacheHandler } from './lib/remote-cache-handler.ts';

export function register() {
  // Only the deployed Worker (workerd, with OpenNext's KV-backed composable cache) needs these.
  if (process.env['NEXT_RUNTIME'] !== 'nodejs' || runsOutsideWorkerd()) return;
  registerRemoteCacheHandler();
  // Next.js shares one module-loading signal across requests; workerd isolates them
  // (see also scripts/patch-worker.ts).
  tolerateCrossRequestTimerCleanup(globalThis);
}
