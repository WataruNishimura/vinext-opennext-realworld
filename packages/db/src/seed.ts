import { getTableColumns, getTableName, sql, type Table } from 'drizzle-orm';
import type { Database } from './client.ts';
import * as schema from './schema.ts';
import {
  CATEGORY_CATALOG,
  FEATURED_PRODUCT_NAMES,
  PRODUCT_CATALOG,
  REVIEW_TEMPLATES,
  REVIEWER_NAMES,
} from './seed-catalog.ts';

export const DEMO_ACCOUNT_ID = 'a833bc10-64dd-4069-8573-4bbb4b0065ed';
export const DEMO_ACCOUNT_EMAIL = 'jane.smith@example.com';

/** Every seeded timestamp is an offset from this instant, so the seed never depends on the clock. */
const SEED_EPOCH = Date.UTC(2026, 0, 1);
const DAY = 24 * 60 * 60 * 1000;
const at = (days: number) => new Date(SEED_EPOCH + days * DAY);

export type SeedData = {
  categories: schema.NewCategory[];
  products: (schema.NewProduct & { id: number; categoryId: number; priceCents: number })[];
  inventory: (schema.NewInventory & { stock: number })[];
  accounts: (schema.NewAccount & { id: string })[];
  reviews: (schema.NewReview & { rating: number })[];
  savedProducts: schema.NewSavedProduct[];
};

/** Small, seedable PRNG (mulberry32) so generated reviews and stock are reproducible. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function pick<T>(items: readonly T[], random: () => number): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error('Cannot pick from an empty list.');
  return item;
}

export function buildSeedData(): SeedData {
  const random = createRandom(20260101);

  const categories = CATEGORY_CATALOG.map((category, index) => ({
    id: index + 1,
    slug: category.slug,
    name: category.name,
    description: category.description,
    createdAt: at(0),
  }));
  const categoryIdBySlug = new Map(categories.map(category => [category.slug, category.id]));

  const products = PRODUCT_CATALOG.map((entry, index) => {
    const id = index + 1;
    const categoryId = categoryIdBySlug.get(entry.category);
    if (categoryId === undefined) throw new Error(`Unknown category ${entry.category}`);
    const featuredIndex = FEATURED_PRODUCT_NAMES.indexOf(
      entry.name as (typeof FEATURED_PRODUCT_NAMES)[number],
    );
    return {
      id,
      slug: slugify(entry.name),
      name: entry.name,
      description: entry.description,
      priceCents: Math.round(entry.price * 100),
      categoryId,
      brand: entry.brand,
      sku: `RW-${String(id).padStart(4, '0')}`,
      materials: entry.materials ?? null,
      origin: entry.origin ?? null,
      warranty: entry.warranty ?? null,
      featured: featuredIndex !== -1,
      featuredAt: featuredIndex === -1 ? null : at(30 + featuredIndex),
      createdAt: at(index),
      updatedAt: at(index),
    };
  });

  // Every seventh product is sold out and every fifth runs low, the rest are well stocked.
  const inventory = products.map(product => ({
    productId: product.id,
    stock:
      product.id % 7 === 0
        ? 0
        : product.id % 5 === 0
          ? 1 + Math.floor(random() * 4)
          : 12 + Math.floor(random() * 60),
    updatedAt: at(40),
  }));

  const accounts = [
    {
      id: DEMO_ACCOUNT_ID,
      email: DEMO_ACCOUNT_EMAIL,
      name: 'Jane Smith',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0123',
      address: '123 Tech Street',
      city: 'San Francisco',
      country: 'United States',
      zipCode: '94105',
      createdAt: at(0),
      updatedAt: at(0),
    },
    {
      id: '5f0c2c1e-8a8e-4bb4-9a52-6b9c0c0f2d11',
      email: 'kenji.sato@example.com',
      name: 'Kenji Sato',
      firstName: 'Kenji',
      lastName: 'Sato',
      phone: null,
      address: '1-2-3 Shibuya',
      city: 'Tokyo',
      country: 'Japan',
      zipCode: '150-0002',
      createdAt: at(2),
      updatedAt: at(2),
    },
  ];

  let reviewId = 0;
  const reviews = products.flatMap(product => {
    const count = 2 + Math.floor(random() * 5);
    return Array.from({ length: count }, (_, index) => {
      const template = pick(REVIEW_TEMPLATES, random);
      reviewId += 1;
      return {
        id: reviewId,
        productId: product.id,
        accountId: null,
        authorName: pick(REVIEWER_NAMES, random),
        rating: template.rating,
        title: template.title,
        body: template.body,
        createdAt: at(45 + index * 3 + Math.floor(random() * 3)),
      };
    });
  });

  const savedProducts = [2, 6, 17].map((productId, index) => ({
    accountId: DEMO_ACCOUNT_ID,
    productId,
    savedAt: at(50 + index),
  }));

  return { categories, products, inventory, accounts, reviews, savedProducts };
}

/** Tables in insert order. Deletion runs in reverse so foreign keys are always satisfied. */
const TABLE_ORDER = [
  ['categories', schema.categories],
  ['products', schema.products],
  ['inventory', schema.inventory],
  ['accounts', schema.accounts],
  ['reviews', schema.reviews],
  ['savedProducts', schema.savedProducts],
] as const satisfies readonly (readonly [keyof SeedData, Table])[];

const ALL_TABLES = [
  'cart_items',
  'saved_products',
  'reviews',
  'accounts',
  'inventory',
  'products',
  'categories',
] as const;

function toSqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (value instanceof Date) return String(value.getTime());
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`Cannot seed non-finite number ${value}`);
    return String(value);
  }
  if (typeof value === 'string') return `'${value.replaceAll("'", "''")}'`;
  throw new Error(`Unsupported seed value: ${typeof value}`);
}

function insertStatement(table: Table, row: Record<string, unknown>): string {
  const columns = Object.entries(getTableColumns(table)).filter(([key]) => key in row);
  const names = columns.map(([, column]) => `"${column.name}"`).join(', ');
  const values = columns.map(([key]) => toSqlLiteral(row[key])).join(', ');
  return `INSERT INTO "${getTableName(table)}" (${names}) VALUES (${values});`;
}

/**
 * The seed as single-line SQL statements: deletes followed by inserts. Write them to a file for
 * `cf d1 query --sql`, or run them through {@link seed}.
 */
export function seedStatements(data: SeedData = buildSeedData()): string[] {
  const deletes = ALL_TABLES.map(table => `DELETE FROM "${table}";`);
  const inserts = TABLE_ORDER.flatMap(([key, table]) =>
    data[key].map(row => insertStatement(table, row)),
  );
  return [...deletes, ...inserts];
}

/** Reset the database to the deterministic seed in a single D1 batch. */
export async function seed(db: Database, data: SeedData = buildSeedData()): Promise<void> {
  const [first, ...rest] = seedStatements(data).map(statement => db.run(sql.raw(statement)));
  if (!first) return;
  await db.batch([first, ...rest]);
}
