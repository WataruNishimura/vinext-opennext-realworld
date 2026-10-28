import { expect, test } from '@playwright/test';
import { instant } from './fixtures.ts';

test('the home page shell holds the featured products and categories', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Featured products' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Wireless Headphones' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Audio/ }).first()).toBeVisible();
});

test('a prefetched link into the catalog shows its first page instantly', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Browse all products' });
  await link.scrollIntoViewIfNeeded();

  await instant(
    page,
    async () => {
      await link.click();
      await page.waitForURL('/all');
      await expect(page.getByRole('heading', { name: 'All products' })).toBeVisible();
      await expect(page.getByText('28 products')).toBeVisible();
    },
    { partial: true },
  );
});

test('category, search and pagination keep their state in the URL', async ({ page }) => {
  await page.goto('/all');
  await page
    .getByRole('navigation', { name: 'Categories' })
    .getByRole('link', { name: 'Audio' })
    .click();
  await page.waitForURL('/all?category=audio');
  await expect(page.getByRole('link', { name: 'Wireless Headphones' })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Search products' }).fill('speaker');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForURL('/all?q=speaker&category=audio');
  await expect(page.getByRole('link', { name: 'Portable Speaker' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Wireless Headphones' })).toHaveCount(0);

  await page.goto('/all');
  await page.getByRole('link', { name: 'Page 2' }).click();
  await page.waitForURL('/all?page=2');
  await expect(page.getByRole('link', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
});

test('the about page is fully static and instant', async ({ page }) => {
  await page.goto('/');
  await instant(page, async () => {
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'About' })
      .click();
    await page.waitForURL('/about');
    await expect(
      page.getByRole('heading', { name: 'A store where every read knows how fresh it must be.' }),
    ).toBeVisible();
  });
});
