import { expect, test } from '@playwright/test';
import { clickAndWaitForAction, instant } from './fixtures.ts';

test('a product page shows its cached header instantly and its live stock after', async ({
  page,
}) => {
  await page.goto('/all?category=audio');
  const product = page.getByRole('link', { name: 'Wireless Headphones' });
  await product.scrollIntoViewIfNeeded();

  await instant(
    page,
    async ({ locked }) => {
      await product.click();
      await page.waitForURL('/product/1');
      await expect(
        page.getByRole('heading', { level: 1, name: 'Wireless Headphones' }),
      ).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Customer reviews' })).toBeVisible();
      // Uncached exact stock is never part of the instant UI.
      if (locked) await expect(page.getByTestId('live-stock')).toHaveCount(0);
    },
    { partial: true },
  );

  await expect(page.getByTestId('live-stock')).toHaveText(/\d+ in stock/);
  await expect(
    page
      .getByRole('list')
      .filter({ has: page.getByRole('heading') })
      .first(),
  ).toBeVisible();
});

test('adding to the cart updates the badge, and the cart page edits it', async ({ page }) => {
  await page.goto('/product/1');
  await clickAndWaitForAction(page, page.getByRole('button', { name: 'Add to cart' }));
  await expect(page.getByText('1 in your cart')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart with 1 item' })).toBeVisible();

  // The cart entry was invalidated with updateTag, so a fresh request sees it.
  await page.reload();
  await expect(page.getByRole('link', { name: 'Cart with 1 item' })).toBeVisible();

  await page.getByRole('link', { name: 'Cart with 1 item' }).click();
  await page.waitForURL('/cart');
  await expect(page.getByRole('link', { name: 'Wireless Headphones' })).toBeVisible();

  await clickAndWaitForAction(
    page,
    page.getByRole('button', { name: 'Increase quantity of Wireless Headphones' }),
  );
  await expect(page.getByText('Subtotal (2 items)')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart with 2 items' })).toBeVisible();

  await clickAndWaitForAction(
    page,
    page.getByRole('button', { name: 'Remove Wireless Headphones from cart' }),
  );
  // On a deployment the Server Function's own re-render can still show the removed line
  // (README: 「Server Function 直後の再描画」); a following request is fresh within a second or so.
  await expect(async () => {
    if (!(await page.getByText('Your cart is empty.').first().isVisible())) await page.reload();
    await expect(page.getByText('Your cart is empty.').first()).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
  await expect(page.getByRole('link', { name: 'Cart with 0 items' })).toBeVisible();
});

test('an empty cart is ready instantly from the home page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /^Cart/ }).hover();
  await instant(
    page,
    async () => {
      await page.getByRole('link', { name: /^Cart/ }).click();
      await page.waitForURL('/cart');
      await expect(page.getByRole('heading', { name: 'Your cart' })).toBeVisible();
    },
    { partial: true },
  );
  await expect(page.getByText('Your cart is empty.').first()).toBeVisible();
});
