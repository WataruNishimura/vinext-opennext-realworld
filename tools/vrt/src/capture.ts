import type { Browser } from '@playwright/test';
import type { Target } from './targets.ts';

/**
 * Freeze everything that moves: CSS animations and transitions (skeleton pulses, hover fades),
 * View Transition pseudo-elements and the text caret.
 */
const FREEZE_CSS = `
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}
::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
  animation: none !important;
}
`;

/** Matches what Playwright paints over masked elements; also used for padding in the diff. */
export const MASK_COLOR = '#ff00ff';

/**
 * A full-page screenshot once the page has settled: the load event, an idle network, every
 * streamed Suspense boundary revealed (React leaves a `<template id="B:…">` in place of each
 * pending boundary) and web fonts loaded.
 */
export async function capture(browser: Browser, baseUrl: string, target: Target): Promise<Buffer> {
  const { width, height } = target.viewport;
  const mobile = width < 640;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    locale: 'en-US',
    timezoneId: 'UTC',
  });
  try {
    const page = await context.newPage();
    // Disable View Transitions before any app script runs, so a navigation never animates.
    await page.addInitScript(() => {
      Object.defineProperty(Document.prototype, 'startViewTransition', { value: undefined });
    });
    const response = await page.goto(new URL(target.route.path, baseUrl).href, {
      waitUntil: 'load',
    });
    if (!response?.ok()) {
      throw new Error(`${baseUrl}${target.route.path} answered ${response?.status() ?? 'nothing'}`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(
      () =>
        document.readyState === 'complete' &&
        document.querySelector('template[id^="B:"]') === null &&
        document.fonts.status === 'loaded',
      undefined,
      { timeout: 15_000 },
    );
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.addStyleTag({ content: FREEZE_CSS });
    // Settle layout after the style change.
    await page.evaluate(
      () =>
        new Promise<void>(resolve => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        }),
    );
    return await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      mask: (target.route.mask ?? []).map(selector => page.locator(selector)),
      maskColor: MASK_COLOR,
    });
  } finally {
    await context.close();
  }
}
