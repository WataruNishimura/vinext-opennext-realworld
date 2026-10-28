import type { NextConfig } from 'next';

/** `instant()` from @next/playwright needs the testing API; only the e2e build exposes it. */
const exposeTestingApi = process.env['NEXT_TESTING_API'] === '1';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  transpilePackages: ['@realworld/core', '@realworld/ui', '@realworld/db'],
  experimental: {
    exposeTestingApiInProductionBuild: exposeTestingApi,
    inlineCss: true,
    // The zlib-deflated Resume Data Cache fails to inflate on workerd ("Failed to parse postponed
    // state", RangeError), which drops every cached read when a partial prerender resumes.
    disableResumeDataCacheCompression: true,
  },
};

export default nextConfig;
