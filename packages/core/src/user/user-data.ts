import { type Database, schema } from '@realworld/db';
import { and, desc, eq, inArray } from 'drizzle-orm';
import {
  listFeaturedProducts,
  listProductsInCategories,
  productSelection,
  toProduct,
} from '../product/product-data.ts';
import type { Product } from '../product/types/product.ts';
import type { Account, AccountProfile } from './types/account.ts';

const { accounts, categories, products, savedProducts } = schema;

const accountSelection = {
  id: accounts.id,
  email: accounts.email,
  name: accounts.name,
  firstName: accounts.firstName,
  lastName: accounts.lastName,
  phone: accounts.phone,
  address: accounts.address,
  city: accounts.city,
  country: accounts.country,
  zipCode: accounts.zipCode,
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function findAccountByEmail(db: Database, email: string): Promise<Account | null> {
  const [account] = await db
    .select(accountSelection)
    .from(accounts)
    .where(eq(accounts.email, normalizeEmail(email)))
    .limit(1);
  return account ?? null;
}

export async function findAccountById(db: Database, accountId: string): Promise<Account | null> {
  const [account] = await db
    .select(accountSelection)
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1);
  return account ?? null;
}

export async function updateAccountProfile(
  db: Database,
  accountId: string,
  profile: AccountProfile,
  now: Date,
): Promise<boolean> {
  const updated = await db
    .update(accounts)
    .set({ ...profile, updatedAt: now })
    .where(eq(accounts.id, accountId))
    .returning({ id: accounts.id });
  return updated.length > 0;
}

export async function listSavedProducts(db: Database, accountId: string): Promise<Product[]> {
  const rows = await db
    .select(productSelection)
    .from(savedProducts)
    .innerJoin(products, eq(savedProducts.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(savedProducts.accountId, accountId))
    .orderBy(desc(savedProducts.savedAt), desc(savedProducts.productId));
  return rows.map(toProduct);
}

export async function listSavedProductIds(db: Database, accountId: string): Promise<number[]> {
  const rows = await db
    .select({ productId: savedProducts.productId })
    .from(savedProducts)
    .where(eq(savedProducts.accountId, accountId))
    .orderBy(desc(savedProducts.savedAt), desc(savedProducts.productId));
  return rows.map(row => row.productId);
}

/** Save a product, or unsave it when it is already saved. */
export async function toggleSavedProduct(
  db: Database,
  accountId: string,
  productId: number,
  now: Date,
): Promise<{ saved: boolean }> {
  const removed = await db
    .delete(savedProducts)
    .where(and(eq(savedProducts.accountId, accountId), eq(savedProducts.productId, productId)))
    .returning({ productId: savedProducts.productId });
  if (removed.length > 0) return { saved: false };

  await db.insert(savedProducts).values({ accountId, productId, savedAt: now });
  return { saved: true };
}

/**
 * Unsaved products from the categories the account saves from, newest first, topped up with
 * featured products. Deterministic, so the result can be cached per account.
 */
export async function listRecommendedProducts(
  db: Database,
  accountId: string,
  limit: number,
): Promise<Product[]> {
  const savedIds = await listSavedProductIds(db, accountId);
  const savedCategories =
    savedIds.length === 0
      ? []
      : await db
          .selectDistinct({ categoryId: products.categoryId })
          .from(products)
          .where(inArray(products.id, savedIds));

  const recommended = await listProductsInCategories(
    db,
    savedCategories.map(row => row.categoryId),
    savedIds,
    limit,
  );
  if (recommended.length >= limit) return recommended;

  const exclude = new Set([...savedIds, ...recommended.map(product => product.id)]);
  const featured = await listFeaturedProducts(db, limit + exclude.size);
  return [...recommended, ...featured.filter(product => !exclude.has(product.id))].slice(0, limit);
}
