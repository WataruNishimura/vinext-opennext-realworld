import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { kvDataAdapter } from '@vinext/cloudflare/cache/kv-data-adapter';
import vinext from 'vinext';
import { defaultClientConditions, defaultServerConditions, defineConfig } from 'vite';

// kvDataAdapter() types `options` as possibly undefined, which vinext's descriptor type rejects under
// exactOptionalPropertyTypes; the options are always set here.
const kvCache = kvDataAdapter({ appPrefix: 'realworld-vinext' });

// Resolve @realworld/core/render-stages to its vinext fallback (see the root README). Top-level
// `resolve.conditions` only reaches the client, so the server environments (rsc, ssr) set it too.
const serverResolve = { conditions: ['vinext', ...defaultServerConditions] };

export default defineConfig({
  resolve: {
    conditions: ['vinext', ...defaultClientConditions],
    // vinext's "use cache" and "use server" transforms inject imports of these packages into the
    // workspace packages' source; resolve them from the app, since packages/* do not depend on them.
    dedupe: ['@vitejs/plugin-rsc', 'react-server-dom-webpack', 'vinext'],
  },
  environments: {
    rsc: { resolve: serverResolve },
    ssr: { resolve: serverResolve },
  },
  plugins: [
    tailwindcss(),
    vinext({
      react: { compiler: true },
      // "use cache" entries, cacheTag and updateTag/revalidateTag go through Workers KV.
      cache: { data: { ...kvCache, options: kvCache.options ?? {} } },
    }),
    cloudflare({
      viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
    }),
  ],
});
