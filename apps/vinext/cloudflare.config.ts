import { bindings, defineConfig, defineWorker } from 'cf/config';

/**
 * The vinext Worker. `cf dev`, `cf build` and `cf deploy` read this file through the Cloudflare
 * Vite plugin. `cf` addresses resources by ID, so both bindings carry theirs.
 */
export default defineConfig({
  worker: defineWorker({
    name: 'realworld-vinext',
    entrypoint: 'vinext/server/fetch-handler',
    compatibilityDate: '2026-10-27',
    compatibilityFlags: ['nodejs_compat'],
    observability: { enabled: true },
    assets: {
      htmlHandling: 'none',
      notFoundHandling: 'none',
      runWorkerFirst: ['/*', '!/_next/static/*', '!/*/_next/static/*'],
    },
    env: {
      ASSETS: bindings.assets(),
      // The shared D1 contract from the root README: one binding named DB.
      DB: bindings.d1({ id: '7c6d99ba-4407-484b-8fd8-4fb8dbf07bbc', name: 'realworld-vinext' }),
      // Backs vinext's "use cache" data cache (kvDataAdapter in vite.config.ts).
      VINEXT_KV_CACHE: bindings.kv({ id: '30c4ae3e5e0e4942bf72e4d72d564c4d' }),
    },
  }),
});
