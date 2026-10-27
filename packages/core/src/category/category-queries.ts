import 'server-only';

import { getDb } from '../database.ts';
import { cacheLife, cacheTag, notFound } from '../framework/next.ts';
import { productTags } from '../product/product-cache.ts';
import { categoryTags } from './category-cache.ts';
import { findCategoryBySlug, listCategories, listCategoriesWithCount } from './category-data.ts';
import type { Category, CategoryWithCount } from './types/category.ts';

/** Static shell. Categories only change outside the app, so a daily lifetime bounds staleness. */
export async function getCategories(): Promise<Category[]> {
  'use cache';
  cacheLife('days');
  cacheTag(categoryTags.all);

  return listCategories(await getDb());
}

/** Static shell. Counts move with the catalog, so the entry also carries the products tag. */
export async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
  'use cache';
  cacheLife('days');
  cacheTag(categoryTags.all, productTags.all);

  return listCategoriesWithCount(await getDb());
}

export async function getCategory(slug: string): Promise<Category> {
  'use cache';
  cacheLife('days');
  cacheTag(categoryTags.all);

  const category = await findCategoryBySlug(await getDb(), slug);
  if (!category) notFound();
  return category;
}
