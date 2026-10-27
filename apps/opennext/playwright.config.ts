import { defineConfig, devices } from '@playwright/test';

const PORT = 8799;
const externalBaseURL = process.env['PLAYWRIGHT_BASE_URL'];
const baseURL = externalBaseURL ?? `http://localhost:${PORT}`;

/**
 * Runs against the OpenNext Worker in workerd. Build with `pnpm build:e2e` (exposes the testing
 * API that `instant()` needs) and seed local state with `pnpm e2e:prepare`.
 * Set PLAYWRIGHT_BASE_URL to run the same specs against a deployment (without `instant()`).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  // A deployment adds network latency to every streamed response.
  expect: { timeout: externalBaseURL === undefined ? 5_000 : 15_000 },
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(externalBaseURL === undefined && {
    webServer: {
      command: `wrangler dev --port ${PORT}`,
      url: baseURL,
      reuseExistingServer: false,
      stdout: 'pipe',
      timeout: 120_000,
    },
  }),
});
