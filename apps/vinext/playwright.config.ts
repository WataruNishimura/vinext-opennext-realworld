import { defineConfig, devices } from '@playwright/test';

const externalBaseURL = process.env['PLAYWRIGHT_BASE_URL'];
const baseURL = externalBaseURL ?? 'http://localhost:4173';

/**
 * Runs against the production build (`vite preview` serves it in workerd with local D1 and KV), so
 * vinext's production-only link prefetching is active. Set PLAYWRIGHT_BASE_URL to test a deployment.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  use: { baseURL, trace: 'on-first-retry' },
  ...(externalBaseURL
    ? {}
    : {
        webServer: {
          command: 'pnpm build && pnpm db:setup:local && vite preview --port 4173 --strictPort',
          url: baseURL,
          reuseExistingServer: !process.env['CI'],
          timeout: 300_000,
        },
      }),
});
