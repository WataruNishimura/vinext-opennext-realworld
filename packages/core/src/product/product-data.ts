import { type Database, schema } from '@realworld/db';
import { and, asc, count, desc, eq, inArray, notInArray, sql, type SQL } from 'drizzle-orm';
import { PRODUCT_PAGE_SIZE, type ProductSearch, type ProductSort } from './product-search.ts';
import type {
  Product,
  ProductDetails,
  ProductPage,
  Review,
  ReviewSummary,
} from './types/product.ts';

const { categories, inventory, products, reviews } = schema;

/** Columns every product read selects, joined with its category. Shared by cart and user reads. */
export const productSelection = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  description: products.description,
  priceCents: products.priceCents,
  brand: products.brand,
  featured: products.featured,
  // Aliased: D1 batch results are keyed by column name, and `name`/`slug` exist on both tables.
  categorySlug: sql<string>`${categories.slug}`.as('category_slug'),
  categoryName: sql<string>`${categories.name}`.as('category_name'),
};

type ProductSelectionRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  brand: string;
  featured: boolean;
  categorySlug: string;
  categoryName: string;
};

export function toProduct(row: ProductSelectionRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    brand: row.brand,
    featured: row.featured,
    category: { slug: row.categorySlug, name: row.categoryName },
  };
}

/** Join products with their category; every product read starts here. */
export function selectProducts(db: Database) {
  return db
    .select(productSelection)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id));
}

export async function findProductById(
  db: Database,
  productId: number,
): Promise<ProductDetails | null> {
  const [row] = await db
    .select({
      ...productSelection,
      sku: products.sku,
      materials: products.materials,
      origin: products.origin,
      warranty: products.warranty,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, productId))
    .limit(1);
  if (!row) return null;
  return {
    ...toProduct(row),
    sku: row.sku,
    materials: row.materials,
    origin: row.origin,
    warranty: row.warranty,
  };
}

/** Products for the given ids, in the order of the ids. Unknown ids are skipped. */
export async function findProductsByIds(db: Database, productIds: number[]): Promise<Product[]> {
  if (productIds.length === 0) return [];
  const rows = await selectProducts(db).where(inArray(products.id, productIds));
  const byId = new Map(rows.map(row => [row.id, toProduct(row)]));
  return productIds.flatMap(id => byId.get(id) ?? []);
}

const SORT_ORDER: Record<ProductSort, SQL[]> = {
  'name-asc': [asc(products.name), asc(products.id)],
  'name-desc': [desc(products.name), desc(products.id)],
  'price-asc': [asc(products.priceCents), asc(products.id)],
  'price-desc': [desc(products.priceCents), desc(products.id)],
};

const escapeLike = (value: string) => value.replace(/[\\%_]/g, match => `\\${match}`);

export async function searchProducts(db: Database, search: ProductSearch): Promise<ProductPage> {
  const conditions: SQL[] = [];
  if (search.query) {
    conditions.push(
      sql`lower(${products.name}) LIKE ${`%${escapeLike(search.query)}%`} ESCAPE '\\'`,
    );
  }
  if (search.category) conditions.push(eq(categories.slug, search.category));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [totals]] = await db.batch([
    selectProducts(db)
      .where(where)
      .orderBy(...SORT_ORDER[search.sort])
      .limit(PRODUCT_PAGE_SIZE)
      .offset((search.page - 1) * PRODUCT_PAGE_SIZE),
    db
      .select({ total: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where),
  ]);

  const total = totals?.total ?? 0;
  return {
    products: rows.map(toProduct),
    total,
    page: search.page,
    pageSize: PRODUCT_PAGE_SIZE,
    totalPages: Math.ceil(total / PRODUCT_PAGE_SIZE),
  };
}

/** Featured products, most recently featured first, topped up with the newest products. */
export async function listFeaturedProducts(db: Database, limit: number): Promise<Product[]> {
  const featured = await selectProducts(db)
    .where(eq(products.featured, true))
    .orderBy(desc(products.featuredAt), desc(products.id))
    .limit(limit);
  if (featured.length >= limit) return featured.map(toProduct);

  const newest = await selectProducts(db)
    .where(eq(products.featured, false))
    .orderBy(desc(products.createdAt), desc(products.id))
    .limit(limit - featured.length);
  return [...featured, ...newest].map(toProduct);
}

/** Feature or unfeature a product. Returns false when the product does not exist. */
export async function setProductFeatured(
  db: Database,
  productId: number,
  featured: boolean,
  now: Date,
): Promise<boolean> {
  const updated = await db
    .update(products)
    .set({ featured, featuredAt: featured ? now : null, updatedAt: now })
    .where(eq(products.id, productId))
    .returning({ id: products.id });
  return updated.length > 0;
}

export async function listReviews(db: Database, productId: number, limit = 50): Promise<Review[]> {
  const rows = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      authorName: reviews.authorName,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt), desc(reviews.id))
    .limit(limit);
  return rows.map(row => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

export async function summarizeReviews(db: Database, productId: number): Promise<ReviewSummary> {
  const [row] = await db
    .select({
      count: count(),
      average: sql<number>`coalesce(avg(${reviews.rating}), 0)`.mapWith(Number),
    })
    .from(reviews)
    .where(eq(reviews.productId, productId));
  return { count: row?.count ?? 0, average: row?.average ?? 0 };
}

/** The live stock count, or null for an unknown product. Never cache this read. */
export async function readStock(db: Database, productId: number): Promise<number | null> {
  const [row] = await db
    .select({ stock: inventory.stock })
    .from(inventory)
    .where(eq(inventory.productId, productId))
    .limit(1);
  return row?.stock ?? null;
}

/** Newest products in the given categories, excluding some ids. */
export async function listProductsInCategories(
  db: Database,
  categoryIds: number[],
  excludeIds: number[],
  limit: number,
): Promise<Product[]> {
  if (categoryIds.length === 0 || limit <= 0) return [];
  const rows = await selectProducts(db)
    .where(
      and(
        inArray(products.categoryId, categoryIds),
        excludeIds.length > 0 ? notInArray(products.id, excludeIds) : undefined,
      ),
    )
    .orderBy(desc(products.createdAt), desc(products.id))
    .limit(limit);
  return rows.map(toProduct);
}

/** Name and live stock for validating a cart change. Never cache this read. */
export async function readProductStock(
  db: Database,
  productId: number,
): Promise<{ name: string; stock: number } | null> {
  const [row] = await db
    .select({ name: products.name, stock: inventory.stock })
    .from(products)
    .innerJoin(inventory, eq(inventory.productId, products.id))
    .where(eq(products.id, productId))
    .limit(1);
  return row ?? null;
}
