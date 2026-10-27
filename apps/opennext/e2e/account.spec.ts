import { expect, test } from '@playwright/test';
import { signIn } from './fixtures.ts';

test('saving a product toggles it on the saved page', async ({ page }) => {
  await signIn(page, '/product/2');
  const save = page.getByRole('button', { name: /^Save/ });
  await expect(save).toBeVisible();
  const wasSaved = (await save.getAttribute('aria-pressed')) === 'true';

  await save.click();
  await expect(save).toHaveAttribute('aria-pressed', String(!wasSaved));

  // `saved:<accountId>` was updated, so the saved page reflects the change.
  await page.goto('/saved');
  const savedLink = page.getByRole('link', { name: 'Portable Speaker' });
  await expect(savedLink).toHaveCount(wasSaved ? 0 : 1);

  await page.goto('/product/2');
  await page.getByRole('button', { name: /^Save/ }).click();
  await expect(page.getByRole('button', { name: /^Save/ })).toHaveAttribute(
    'aria-pressed',
    String(wasSaved),
  );
  await page.goto('/saved');
  await expect(savedLink).toHaveCount(wasSaved ? 1 : 0);
});

test('featuring a product invalidates the remote-cached home page selection', async ({ page }) => {
  await signIn(page, '/product/3');
  const feature = page.getByRole('button', { name: 'Feature on home page' });
  await feature.click();
  await expect(page.getByRole('button', { name: 'Remove from featured' })).toBeVisible();

  await page.goto('/');
  const featured = page
    .getByRole('heading', { name: 'Featured products' })
    .locator('..')
    .locator('..');
  await expect(featured.getByRole('link', { name: 'Studio Microphone' })).toBeVisible();

  await page.goto('/product/3');
  await page.getByRole('button', { name: 'Remove from featured' }).click();
  await expect(page.getByRole('button', { name: 'Feature on home page' })).toBeVisible();
  await page.goto('/');
  await expect(featured.getByRole('link', { name: 'Studio Microphone' })).toHaveCount(0);
});

test('the account page updates the profile and requires sign-in', async ({ page }) => {
  await page.goto('/account');
  await page.waitForURL(/\/sign-in\?redirectTo=%2Faccount/);

  await signIn(page, '/account');
  await expect(page.getByText('Signed in as jane.smith@example.com')).toBeVisible();
  await page.getByLabel('City').fill('Kyoto');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Profile saved.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('City')).toHaveValue('Kyoto');
});
