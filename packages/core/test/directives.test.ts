import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

/** The caching tier of every query, as documented in the README's "How the data loads" table. */
const EXPECTED: Record<string, Record<string, string | null>> = {
  'category/category-queries.ts': {
    getCategories: 'use cache',
    getCategoriesWithCount: 'use cache',
    getCategory: 'use cache',
  },
  'product/product-queries.ts': {
    getProduct: 'use cache',
    getProductsByIds: 'use cache',
    getProductsPageCached: 'use cache: remote',
    getFeaturedProducts: 'use cache: remote',
    getStockStatus: 'use cache: remote',
    getLiveStock: null,
    getReviewSummary: 'use cache',
    getReviews: 'use cache',
  },
  'user/user-queries.ts': {
    readSession: null,
    verifyAccount: null,
    getSession: 'use cache: private',
    getAccountById: 'use cache',
    getSavedProductsForAccount: 'use cache',
    getSavedProductIdsForAccount: 'use cache',
    getRecommendationsForAccount: 'use cache',
  },
  'cart/cart-queries.ts': {
    getCartById: 'use cache',
    getCartCountById: 'use cache',
    getCart: null,
    getCartCount: null,
  },
};

/** The directive on the first line of a function body, or null when there is none. */
function directiveOf(source: string, name: string): string | null | undefined {
  const match = new RegExp(
    `async function ${name}\\b[^{]*\\{\\s*(?:'(use cache[^']*)'|"(use cache[^"]*)")?`,
  ).exec(source);
  if (!match) return undefined;
  return match[1] ?? match[2] ?? null;
}

describe('cache directives', () => {
  for (const [file, functions] of Object.entries(EXPECTED)) {
    it(`${file} uses the documented tier for each query`, async () => {
      const source = await readFile(new URL(`../src/${file}`, import.meta.url), 'utf8');
      for (const [name, directive] of Object.entries(functions)) {
        expect({ name, directive: directiveOf(source, name) }).toEqual({ name, directive });
      }
    });
  }

  it('keeps per-id cached functions unexported', async () => {
    const source = await readFile(new URL('../src/user/user-queries.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/export async function getAccountById/);
    expect(source).not.toMatch(/export async function get\w+ForAccount/);
  });
});
