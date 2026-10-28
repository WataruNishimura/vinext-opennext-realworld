import { defineConfig, devices } from '@playwright/test';

const externalBaseURL = process.env['PLAYWRIGHT_BASE_URL'];
const baseURL = externalBaseURL ?? 'http://localhost:3100';
// Vercel's "Protection Bypass for Automation" secret, for deployments behind Vercel Authentication.
const bypassSecret = process.env['VERCEL_AUTOMATION_BYPASS_SECRET'];

/**
 * Runs against the production build (`next build && next start`), so Partial Prefetching and the
 * static shell behave as deployed. Without CLOUDFLARE_D1_API_TOKEN both commands use a local,
 * seeded D1 database in Miniflare (scripts/with-d1.ts). Set PLAYWRIGHT_BASE_URL to test a
 * deployment, and VERCEL_AUTOMATION_BYPASS_SECRET when it is protected.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...(bypassSecret
      ? {
          extraHTTPHeaders: {
            'x-vercel-protection-bypass': bypassSecret,
            'x-vercel-set-bypass-cookie': 'true',
          },
        }
      : {}),
  },
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
