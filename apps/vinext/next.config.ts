import type { NextConfig } from 'next';

/**
 * vinext reads this file for Next.js options. The React Compiler is enabled in vite.config.ts
 * instead (vinext's `react.compiler` option), because vinext runs it through @vitejs/plugin-react.
 */
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
