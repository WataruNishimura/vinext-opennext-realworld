import { fileURLToPath } from 'node:url';
import type { Route, Viewport } from './targets.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));

/**
 * The two apps under comparison. Each builds once, prepares its seeded LOCAL D1 state and is
 * served from its production build on its own port. Nothing remote is created or deployed.
 */
export const APPS = [
  {
    name: 'opennext',
    cwd: `${root}apps/opennext`,
    port: 8790,
    build: ['pnpm', 'build:worker'],
    // Wipes .wrangler/state, applies migrations, writes the deterministic seed and the OpenNext cache.
    prepare: ['pnpm', 'exec', './scripts/setup-local.sh'],
    start: (port: number) => [
      'pnpm',
      'exec',
      'wrangler',
      'dev',
      '--port',
      String(port),
      '--inspector-port',
      String(port + 1),
    ],
  },
  {
    name: 'vinext',
    cwd: `${root}apps/vinext`,
    port: 4174,
    build: ['pnpm', 'build'],
    prepare: ['pnpm', 'db:setup:local'],
    start: (port: number) => [
      'pnpm',
      'exec',
      'vite',
      'preview',
      '--port',
      String(port),
      '--strictPort',
    ],
  },
] as const;

export type AppName = (typeof APPS)[number]['name'];

/** The runtime name in the footer: the one intended difference between the two apps. */
const RUNTIME_NAME = '[data-testid="runtime-name"]';
/** Request-time values, painted over in both screenshots. */
const LIVE_STOCK = '[data-testid="live-stock"]';

const route = (path: string, mask: string[] = []): Route => ({
  path,
  mask: [RUNTIME_NAME, ...mask],
});

/**
 * Routes to compare. Add a route here to cover it at every viewport. Products from the
 * deterministic seed: 1 is in stock, 5 runs low, 7 is sold out (packages/db/src/seed.ts).
 */
export const ROUTES: Route[] = [
  route('/all'),
  route('/product/1', [LIVE_STOCK]),
  route('/product/5', [LIVE_STOCK]),
  route('/product/7', [LIVE_STOCK]),
];

export const VIEWPORTS: Viewport[] = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];

/** A target fails when more than this share of its pixels differ (0.1%). */
export const MAX_DIFF_RATIO = 0.001;

export const REPORT_DIR = fileURLToPath(new URL('../report/', import.meta.url));
