import { DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_ID } from '@realworld/db/seed';
import { describe, expect, it } from 'vitest';
import {
  findAccountByEmail,
  findAccountById,
  listRecommendedProducts,
  listSavedProductIds,
  listSavedProducts,
  toggleSavedProduct,
  updateAccountProfile,
} from '../src/user/user-data.ts';
import { useSeededDatabase } from './seeded-database.ts';

const database = useSeededDatabase();
const now = new Date(Date.UTC(2026, 5, 1));

describe('accounts', () => {
  it('finds an account by email, ignoring case and whitespace', async () => {
    const account = await findAccountByEmail(
      database().db,
      `  ${DEMO_ACCOUNT_EMAIL.toUpperCase()} `,
    );
    expect(account?.id).toBe(DEMO_ACCOUNT_ID);
  });

  it('finds an account by id', async () => {
    expect((await findAccountById(database().db, DEMO_ACCOUNT_ID))?.name).toBe('Jane Smith');
    expect(await findAccountById(database().db, 'missing')).toBeNull();
  });

  it('updates the profile', async () => {
    const { db } = database();
    await updateAccountProfile(db, DEMO_ACCOUNT_ID, { name: 'Jane S.', city: 'Oslo' }, now);
    expect(await findAccountById(db, DEMO_ACCOUNT_ID)).toMatchObject({
      name: 'Jane S.',
      city: 'Oslo',
    });
  });
});

describe('saved products', () => {
  it('lists saved products, most recently saved first', async () => {
    const products = await listSavedProducts(database().db, DEMO_ACCOUNT_ID);
    expect(products.map(product => product.id)).toEqual([17, 6, 2]);
    expect(await listSavedProductIds(database().db, DEMO_ACCOUNT_ID)).toEqual([17, 6, 2]);
  });

  it('toggles a saved product', async () => {
    const { db } = database();
    expect(await toggleSavedProduct(db, DEMO_ACCOUNT_ID, 9, now)).toEqual({ saved: true });
    expect(await listSavedProductIds(db, DEMO_ACCOUNT_ID)).toContain(9);

    expect(await toggleSavedProduct(db, DEMO_ACCOUNT_ID, 9, now)).toEqual({ saved: false });
    expect(await listSavedProductIds(db, DEMO_ACCOUNT_ID)).not.toContain(9);
  });
});

describe('recommendations', () => {
  it('recommends unsaved products from saved categories first, deterministically', async () => {
    const { db } = database();
    const first = await listRecommendedProducts(db, DEMO_ACCOUNT_ID, 4);
    const saved = await listSavedProductIds(db, DEMO_ACCOUNT_ID);

    expect(first).toHaveLength(4);
    expect(first.some(product => saved.includes(product.id))).toBe(false);
    expect(first[0]?.category.slug).toMatch(/^(audio|electronics|kitchen)$/);
    expect(await listRecommendedProducts(db, DEMO_ACCOUNT_ID, 4)).toEqual(first);
  });

  it('falls back to featured products for an account with nothing saved', async () => {
    const products = await listRecommendedProducts(database().db, 'nobody', 2);
    expect(products.map(product => product.featured)).toEqual([true, true]);
  });
});
