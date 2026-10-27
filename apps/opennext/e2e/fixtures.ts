import { instant as nextInstant } from '@next/playwright';
import { test, type Locator, type Page } from '@playwright/test';

/**
 * `instant()` needs the testing API, which only the e2e build exposes: the local Worker, or that
 * build under `next start` (set E2E_INSTANT=1 with PLAYWRIGHT_BASE_URL).
 */
export const exposesTestingApi =
  process.env['PLAYWRIGHT_BASE_URL'] === undefined || process.env['E2E_INSTANT'] === '1';

/** `E2E_RUNTIME=node` when the specs run against `next start` instead of the OpenNext Worker. */
const onOpenNext = process.env['E2E_RUNTIME'] !== 'node';

/**
 * Assert the instant UI with the testing API. On the OpenNext Worker an instant navigation into a
 * partially prerendered route never commits (it does under `next start`, see README), so for those
 * routes (`partial: true`) the steps run without the lock and only the final UI is asserted.
 */
export async function instant(
  page: Page,
  steps: (context: { locked: boolean }) => Promise<void>,
  { partial = false }: { partial?: boolean } = {},
): Promise<void> {
  if (!exposesTestingApi) {
    await steps({ locked: false });
    return;
  }
  if (partial && onOpenNext) {
    test.info().annotations.push({
      type: 'not-instant-on-opennext',
      description: 'Instant navigation into a partially prerendered route does not commit.',
    });
    await steps({ locked: false });
    return;
  }
  await nextInstant(page, () => steps({ locked: true }));
}

export const DEMO_EMAIL = 'jane.smith@example.com';

export async function signIn(page: Page, redirectTo = '/') {
  await page.goto(`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
  await page.getByLabel('Email').fill(DEMO_EMAIL);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(redirectTo);
}

/**
 * Click a control that calls a Server Function and wait for its response. The UI updates
 * optimistically, so without this a following navigation can race the mutation.
 */
export async function clickAndWaitForAction(page: Page, control: Locator): Promise<void> {
  const response = page.waitForResponse(
    res =>
      res.request().method() === 'POST' && res.request().headers()['next-action'] !== undefined,
  );
  await control.click();
  await response;
}
