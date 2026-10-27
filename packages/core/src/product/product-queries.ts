import 'server-only';

import { getDb } from '../database.ts';
import { cacheLife, cacheTag, notFound } from '../framework/next.ts';
import { productTags } from './product-cache.ts';
import {
  findProductById,
  findProductsByIds,
  listFeaturedProducts,
  listReviews,
  readStock,
  searchProducts,
  summarizeReviews,
} from './product-data.ts';
import type { ProductSearch, ProductSort } from './product-search.ts';
import { stockStatus, type StockStatus } from './product-stock.ts';
import type {
  Product,
  ProductDetails,
  ProductPage,
  Review,
  ReviewSummary,
} from './types/product.ts';

const FEATURED_LIMIT = 4;

const isProductId = (value: number) => Number.isInteger(value) && value > 0;

/**
 * Product page header. Keyed on the id, so `<Link prefetch>` resolves it per link.
 * Prices change outside the app, so the entry lives for hours; featuring calls updateTag.
 */
export async function getProduct(productId: number): Promise<ProductDetails> {
  'use cache';
  cacheLife('hours');
  cacheTag(productTags.all, productTags.detail(productId));

  if (!isProductId(productId)) notFound();
  const product = await findProductById(await getDb(), productId);
  if (!product) notFound();
  return product;
}

export async function getProductsByIds(productIds: number[]): Promise<Product[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(productTags.all, ...productIds.map(productTags.detail));

  return findProductsByIds(await getDb(), productIds);
}

/** One page of the catalog. Takes the normalized search so equivalent URLs share an entry. */
export async function getProductsPage(search: ProductSearch): Promise<ProductPage> {
  return getProductsPageCached(search.query, search.sort, search.page, search.category);
}

/**
 * Shared across users and instances: every visitor browsing the catalog hits the same few
 * pages, so the durable remote cache earns its lookup cost.
 */
async function getProductsPageCached(
  query: string,
  sort: ProductSort,
  page: number,
  category: string | null,
): Promise<ProductPage> {
  'use cache: remote';
  cacheLife('hours');
  cacheTag(productTags.all);

  return searchProducts(await getDb(), { query, sort, page, category });
}

/** Home page offers. Only `setFeaturedProduct` changes the selection, and it updates the tag. */
export async function getFeaturedProducts(): Promise<Product[]> {
  'use cache: remote';
  cacheLife('max');
  cacheTag(productTags.featured, productTags.all);

  return listFeaturedProducts(await getDb(), FEATURED_LIMIT);
}

/**
 * Coarse availability for cards and badges, shared by every visitor. Orders change stock outside
 * the app, so the entry is short-lived; exact counts come from `getLiveStock`.
 */
export async function getStockStatus(productId: number): Promise<StockStatus> {
  'use cache: remote';
  cacheLife('minutes');
  cacheTag(productTags.stock(productId));

  return stockStatus((await readStock(await getDb(), productId)) ?? 0);
}

/**
 * Exact stock, deliberately uncached: it must be fresh on every request. Render it in its own
 * `<Suspense>` boundary so it never holds back cached content.
 */
export async function getLiveStock(productId: number): Promise<number> {
  return (await readStock(await getDb(), productId)) ?? 0;
}

/** Rating and count for the product header; cheap enough for a per-link prefetch. */
export async function getReviewSummary(productId: number): Promise<ReviewSummary> {
  'use cache';
  cacheLife('hours');
  cacheTag(productTags.reviews(productId));

  return summarizeReviews(await getDb(), productId);
}

/** Full review bodies. Await `navigation()` before calling this to keep them out of prefetches. */
export async function getReviews(productId: number): Promise<Review[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(productTags.reviews(productId));

  return listReviews(await getDb(), productId);
}
