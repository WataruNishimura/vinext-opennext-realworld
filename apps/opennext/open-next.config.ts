import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache';

/**
 * - Incremental cache: Workers KV (`NEXT_INC_CACHE_KV`). Holds ISR/static shells and every
 *   `'use cache'` / `'use cache: remote'` entry (instrumentation.ts routes `remote` here too).
 *   R2 is the usual choice, but it is not enabled on this account; KV is durable and global.
 * - Tag cache: D1 (`NEXT_TAG_CACHE_D1`, table `revalidations`), so `updateTag` / `revalidateTag`
 *   invalidate entries across every isolate and colo.
 * - Queue: Durable Object (`NEXT_CACHE_DO_QUEUE`), deduplicating background revalidations.
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  tagCache: d1NextTagCache,
  queue: doQueue,
  // Must stay off with Partial Prerendering / Cache Components.
  enableCacheInterception: false,
});
