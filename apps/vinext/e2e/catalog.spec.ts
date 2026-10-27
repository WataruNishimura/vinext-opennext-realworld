import { expect, test } from '@playwright/test';

test('home shows the cached featured products and categories', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Featured products' })).toBeVisible();
  await expect(page.getByRole('link', { exact: true, name: 'Wireless Headphones' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Kitchen/ })).toBeVisible();
});

test('the catalog filters, sorts, searches and paginates through the URL', async ({ page }) => {
  await page.goto('/all');
  await expect(page.getByText('28 products')).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Categories' })
    .getByRole('link', { name: 'Audio' })
    .click();
  await page.waitForURL('/all?category=audio');
  await expect(page.getByText('4 products')).toBeVisible();

  await page.getByRole('link', { name: 'Price: high to low' }).click();
  await page.waitForURL('/all?sort=price-desc&category=audio');
  await expect(page.getByRole('heading', { level: 3 }).first()).toHaveText('Wireless Headphones');

  await page.goto('/all');
  await page.getByRole('searchbox', { name: 'Search products' }).fill('desk');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForURL('/all?q=desk');
  await expect(page.getByRole('link', { exact: true, name: 'Desk Lamp' })).toBeVisible();

  await page.goto('/all');
  await page.getByRole('link', { name: 'Next page' }).click();
  await page.waitForURL('/all?page=2');
  await expect(page.getByRole('link', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
});

test('about is static content', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'About us' })).toBeVisible();
});
