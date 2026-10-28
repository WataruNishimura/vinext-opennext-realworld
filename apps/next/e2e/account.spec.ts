import { expect, test, type Page } from '@playwright/test';

async function signIn(page: Page, redirectTo: string) {
  await page.goto(`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
  await page.getByLabel('Email').fill('kenji.sato@example.com');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(redirectTo);
}

test('the account page asks signed-out visitors to sign in', async ({ page }) => {
  await page.goto('/account');
  await page.waitForURL(/\/sign-in\?redirectTo=%2Faccount/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('an unknown email cannot sign in', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('nobody@example.com');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Scoped to the page: Next.js adds its own role="alert" route announcer outside <main>.
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'No account found for that email.',
  );
});

test('saving a product updates the cached saved list', async ({ page }) => {
  await signIn(page, '/product/13');
  const save = page.getByRole('button', { name: /Save/ });
  await expect(save).toHaveAttribute('aria-pressed', 'false');

  await save.click();
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  // The pressed state is optimistic; wait for the Server Function before reading the saved list.
  await expect(save).toHaveAttribute('aria-busy', 'false');

  await page.goto('/saved');
  const saved = page.getByRole('button', { name: 'Save Desk Lamp' });
  await expect(saved).toHaveAttribute('aria-pressed', 'true');

  // updateTag(saved:<account>) re-renders the list without the product, then a reload agrees.
  await saved.click();
  await expect(page.getByText('You have no saved products yet.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('You have no saved products yet.')).toBeVisible();
});

test('the profile form saves through a Server Function', async ({ page }) => {
  await signIn(page, '/account');
  const city = page.getByLabel('City');
  const original = await city.inputValue();

  await city.fill('Osaka');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Profile saved.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('City')).toHaveValue('Osaka');

  await page.getByLabel('City').fill(original);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Profile saved.')).toBeVisible();
});

test('signing out returns to the signed-out header', async ({ page }) => {
  await signIn(page, '/');
  await page.getByRole('button', { name: 'Kenji Sato' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
});
