/**
 * Cross-app visual regression test: renders the same routes in apps/opennext and apps/vinext
 * and compares the screenshots pixel by pixel.
 *
 *   pnpm vrt                      build both apps, seed local D1, serve, capture, compare
 *   pnpm vrt --skip-build         reuse the existing builds (still reseeds and serves)
 *   pnpm vrt --only product-7     only targets whose id contains the text
 *   pnpm vrt --opennext-url http://localhost:8799 --vinext-url http://localhost:4173
 *                                 compare servers that are already running (no build or seed)
 *   pnpm vrt --max-diff 0.002     allowed share of differing pixels per target
 *
 * Writes tools/vrt/report/index.html, results.json and per-target PNGs (`<id>.<app>.png`,
 * `<id>.diff.png`). Exits 1 when a target differs by more than the allowed share.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';
import { capture } from './capture.ts';
import { compareScreenshots } from './compare.ts';
import { APPS, MAX_DIFF_RATIO, REPORT_DIR, ROUTES, VIEWPORTS, type AppName } from './config.ts';
import { formatRatio, renderReport, summarize, type TargetResult } from './report.ts';
import { run, startServer, type Server } from './servers.ts';
import { buildTargets } from './targets.ts';

const { values } = parseArgs({
  options: {
    'skip-build': { type: 'boolean', default: false },
    only: { type: 'string' },
    'opennext-url': { type: 'string' },
    'vinext-url': { type: 'string' },
    'max-diff': { type: 'string' },
  },
});

const maxDiffRatio = values['max-diff'] === undefined ? MAX_DIFF_RATIO : Number(values['max-diff']);
if (!Number.isFinite(maxDiffRatio) || maxDiffRatio < 0) {
  throw new Error(`--max-diff must be a non-negative number, got ${values['max-diff']}`);
}
const externalUrls: Record<AppName, string | undefined> = {
  opennext: values['opennext-url'],
  vinext: values['vinext-url'],
};

const targets = buildTargets(ROUTES, VIEWPORTS, values.only);
if (targets.length === 0) throw new Error(`No target id contains "${values.only ?? ''}"`);

rmSync(REPORT_DIR, { recursive: true, force: true });
mkdirSync(REPORT_DIR, { recursive: true });

const servers: Server[] = [];
const stopAll = () => {
  for (const server of servers) server.stop();
};
process.on('SIGINT', () => {
  stopAll();
  process.exit(130);
});

function log(message: string) {
  console.log(`[vrt] ${message}`);
}

async function serve(app: (typeof APPS)[number]): Promise<string> {
  const external = externalUrls[app.name];
  if (external !== undefined) return external;
  const logFile = join(REPORT_DIR, `${app.name}.log`);
  if (!values['skip-build']) {
    log(`building ${app.name} (log: ${logFile})`);
    await run(app.build, app.cwd, logFile);
  }
  log(`seeding local D1 for ${app.name}`);
  await run(app.prepare, app.cwd, logFile);
  const url = `http://localhost:${app.port}`;
  log(`starting ${app.name} on ${url}`);
  const server = await startServer(app.start(app.port), app.cwd, url, logFile);
  servers.push(server);
  return url;
}

try {
  const urls = await Promise.all(APPS.map(serve));
  const [opennextUrl, vinextUrl] = urls;
  if (opennextUrl === undefined || vinextUrl === undefined) throw new Error('Missing app URL');

  const browser = await chromium.launch();
  const results: TargetResult[] = [];
  try {
    for (const target of targets) {
      const [a, b] = await Promise.all([
        capture(browser, opennextUrl, target),
        capture(browser, vinextUrl, target),
      ]);
      const comparison = compareScreenshots(a, b);
      writeFileSync(join(REPORT_DIR, `${target.id}.opennext.png`), a);
      writeFileSync(join(REPORT_DIR, `${target.id}.vinext.png`), b);
      writeFileSync(join(REPORT_DIR, `${target.id}.diff.png`), comparison.diff);
      const result: TargetResult = {
        id: target.id,
        path: target.route.path,
        viewport: target.viewport.name,
        width: comparison.width,
        height: comparison.height,
        diffPixels: comparison.diffPixels,
        diffRatio: comparison.diffRatio,
        sizeMismatch: comparison.sizeMismatch,
      };
      results.push(result);
      const ok = result.diffRatio <= maxDiffRatio;
      log(
        `${ok ? 'PASS' : 'FAIL'} ${target.id.padEnd(24)} ${formatRatio(result.diffRatio).padStart(8)}` +
          (result.sizeMismatch ? '  (size differs)' : ''),
      );
    }
  } finally {
    await browser.close();
  }

  const apps = [APPS[0].name, APPS[1].name] as const;
  writeFileSync(join(REPORT_DIR, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);
  writeFileSync(join(REPORT_DIR, 'index.html'), renderReport(results, { maxDiffRatio, apps }));
  const { passed, failures } = summarize(results, maxDiffRatio);
  log(`report: ${join(REPORT_DIR, 'index.html')}`);
  if (!passed) {
    log(
      `${failures.length} of ${results.length} targets differ by more than ${formatRatio(maxDiffRatio)}`,
    );
    process.exitCode = 1;
  }
} finally {
  stopAll();
}
