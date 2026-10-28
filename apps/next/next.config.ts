import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // Compile the workspace packages' TypeScript and their 'use cache' / 'use server' directives.
  transpilePackages: ['@realworld/core', '@realworld/ui', '@realworld/db'],
};

export default nextConfig;
