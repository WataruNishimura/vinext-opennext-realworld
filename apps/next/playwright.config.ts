import { defineConfig, devices } from '@playwright/test';

const externalBaseURL = process.env['PLAYWRIGHT_BASE_URL'];
const baseURL = externalBaseURL ?? 'http://localhost:3100';

/**
 * Runs against the production build (`next build && next start`), so Partial Prefetching and the
 * static shell behave as deployed. Without CLOUDFLARE_D1_API_TOKEN both commands use a local,
 * seeded D1 database in Miniflare (scripts/with-d1.ts). Set PLAYWRIGHT_BASE_URL to test a
 * deployment.
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
          command: 'pnpm build && pnpm start --port 3100',
          url: baseURL,
          reuseExistingServer: !process.env['CI'],
          timeout: 300_000,
        },
      }),
});
