// Bindings declared in cloudflare.config.ts, merged into the global `CloudflareEnv` that
// `getCloudflareContext()` from @opennextjs/cloudflare returns.
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- declaration merging needs an interface
  interface CloudflareEnv {
    ASSETS: Fetcher;
    DB: D1Database;
    NEXT_INC_CACHE_KV: KVNamespace;
    NEXT_TAG_CACHE_D1: D1Database;
    NEXT_CACHE_DO_QUEUE: DurableObjectNamespace;
    WORKER_SELF_REFERENCE: Fetcher;
  }
}

export {};
