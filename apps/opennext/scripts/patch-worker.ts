/**
 * Post-build patch for the OpenNext server bundle, run after `opennextjs-cloudflare build`:
 *
 *   node scripts/patch-worker.ts
 *
 * Next.js tracks module loading with one `CacheSignal` per process, and every render subscribes
 * to it (`trackPendingModules` → `subscribeToReads`, its only caller). A chunk load in one request
 * then begins and ends reads on renders of other requests, arming their timers and resolving their
 * promises from the wrong request. Node tolerates that; workerd drops those continuations, so the
 * other renders never settle and the Worker reports a hung request.
 *
 * Making `subscribeToReads` a no-op keeps every render waiting on its own cache reads only. In the
 * Worker all server code is in one bundle, so module loads resolve within a microtask anyway.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DEFINITION = /subscribeToReads\((\w+)\)\{(?!return\(\)=>\{\};)/g;

export function isolateModuleLoadingSignal(source: string): { code: string; patched: number } {
  let patched = 0;
  const code = source.replace(DEFINITION, (_match, parameter: string) => {
    patched++;
    return `subscribeToReads(${parameter}){return()=>{};`;
  });
  return { code, patched };
}

function main() {
  const root = join(import.meta.dirname, '..', '.open-next', 'server-functions');
  const files = readdirSync(root, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(m?js|cjs)$/.test(entry.name))
    .map(entry => join(entry.parentPath, entry.name));

  let total = 0;
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    if (!source.includes('subscribeToReads(')) continue;
    const { code, patched } = isolateModuleLoadingSignal(source);
    if (patched > 0) writeFileSync(file, code);
    total += patched;
  }
  if (total === 0) {
    throw new Error(
      'patch-worker: no subscribeToReads definition found; re-check the Next.js build.',
    );
  }
  console.log(`patch-worker: isolated the module-loading signal in ${total} place(s).`);
}

if (import.meta.main) main();
