import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';

const visible = { visible: true };

test('a product page renders its cached content and streams live stock', async ({ page }) => {
  await page.goto('/all?category=audio');
  const product = page.getByRole('link', { exact: true, name: 'Earbuds Pro' }).filter(visible);

  await instant(page, async () => {
    await product.click();
    await page.waitForURL('/product/4');
    await expect(page.getByRole('heading', { exact: true, name: 'Earbuds Pro' })).toBeVisible();
    await expect(page.getByRole('heading', { exact: true, name: 'Product Details' })).toBeVisible();
  });

  await expect(page.getByText(/\d+ in stock/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Customer reviews' })).toBeVisible();
});

test('vinext does not hold dynamic content behind the instant() lock', async ({ page }) => {
  // On Next.js, uncached content (live stock, the per-session cart button) waits until the
  // instant() scope ends. vinext has no instant-navigation lock, so it streams in right away.
  await page.goto('/all?category=audio');
  await instant(page, async () => {
    await page.getByRole('link', { exact: true, name: 'Earbuds Pro' }).filter(visible).click();
    await page.waitForURL('/product/4');
    await expect(page.getByText(/\d+ in stock/)).toBeVisible();
    await expect(page.getByRole('button', { exact: true, name: 'Add to cart' })).toBeVisible();
  });
});

test('adding to and removing from the cart updates the cached cart', async ({ page }) => {
  await page.goto('/product/4');
  await expect(page.getByRole('link', { name: 'Cart with 0 items' })).toBeVisible();

  await page.getByRole('button', { exact: true, name: 'Add to cart' }).click();
  await expect(page.getByRole('button', { exact: true, name: 'Remove from cart' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart with 1 item' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { exact: true, name: 'Remove from cart' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart with 1 item' })).toBeVisible();

  await page.getByRole('link', { name: 'Cart with 1 item' }).click();
  await page.waitForURL('/cart');
  await expect(page.getByRole('link', { exact: true, name: 'Earbuds Pro' })).toBeVisible();

  await page.getByRole('button', { name: 'Increase quantity of Earbuds Pro' }).click();
  await expect(page.getByText('Subtotal (2 items)')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart with 2 items' })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Subtotal (2 items)')).toBeVisible();

  await page.getByRole('button', { name: 'Remove Earbuds Pro from cart' }).click();
  await expect(page.getByText('Your cart is empty.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart with 0 items' })).toBeVisible();
});

test('the empty cart links back to the catalog', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /^Cart with/ }).click();
  await page.waitForURL('/cart');
  await expect(page.getByText('Your cart is empty.')).toBeVisible();
  await expect(page.getByRole('link', { exact: true, name: 'Browse products' })).toBeVisible();
});
