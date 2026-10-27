import { type Database, schema } from '@realworld/db';
import { asc, count, eq } from 'drizzle-orm';
import type { Category, CategoryWithCount } from './types/category.ts';

const { categories, products } = schema;

const categorySelection = {
  id: categories.id,
  slug: categories.slug,
  name: categories.name,
  description: categories.description,
};

export async function listCategories(db: Database): Promise<Category[]> {
  return db.select(categorySelection).from(categories).orderBy(asc(categories.name));
}

export async function listCategoriesWithCount(db: Database): Promise<CategoryWithCount[]> {
  return db
    .select({ ...categorySelection, productCount: count(products.id) })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}

export async function findCategoryBySlug(db: Database, slug: string): Promise<Category | null> {
  const [category] = await db
    .select(categorySelection)
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return category ?? null;
}
