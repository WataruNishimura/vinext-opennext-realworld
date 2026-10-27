import { seed } from '@realworld/db/seed';
import { DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_ID } from '@realworld/db/seed';
import { beforeEach, describe, expect, it } from 'vitest';
import { addToCart, removeFromCart, updateCartQuantity } from '../src/cart/cart-actions.ts';
import { listCartLines } from '../src/cart/cart-data.ts';
import { setFeaturedProduct } from '../src/product/product-actions.ts';
import { signIn, signOut, toggleSaveProduct, updateProfile } from '../src/user/user-actions.ts';
import { ACCOUNT_COOKIE, CART_COOKIE } from '../src/user/user-session.ts';
import { cookieStore, nextMock, RedirectError } from './next-mock.ts';
import { useSeededDatabase } from './seeded-database.ts';

const database = useSeededDatabase();

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};

beforeEach(async () => {
  nextMock.reset();
  await seed(database().db);
});

describe('cart actions', () => {
  it('creates a cart on first add and invalidates the cart and the session', async () => {
    const result = await addToCart(1);

    const cartId = nextMock.cookies.get(CART_COOKIE)?.value;
    expect(result).toEqual({ ok: true, quantity: 1 });
    expect(cartId).toMatch(/^[0-9a-f-]{36}$/);
    expect(nextMock.cookies.get(CART_COOKIE)?.options).toMatchObject({ httpOnly: true });
    expect(nextMock.updatedTags).toEqual([`cart:${cartId ?? ''}`, 'session']);
  });

  it('only invalidates the cart once the cart exists', async () => {
    const cartId = crypto.randomUUID();
    cookieStore.set(CART_COOKIE, cartId);

    await addToCart(1, 2);

    expect(nextMock.updatedTags).toEqual([`cart:${cartId}`]);
    expect((await listCartLines(database().db, cartId))[0]?.quantity).toBe(2);
  });

  it('refuses sold-out products and quantities above stock', async () => {
    expect(await addToCart(7)).toEqual({ ok: false, error: 'Ergonomic Mouse is sold out.' });
    expect(await addToCart(10, 9)).toEqual({
      ok: false,
      error: expect.stringMatching(/^Only \d available\.$/) as unknown,
    });
    expect(nextMock.updatedTags).toEqual([]);
  });

  it('rejects invalid input', async () => {
    expect(await addToCart(0)).toEqual({ ok: false, error: 'Invalid product.' });
    expect(await addToCart(1, 11)).toEqual({
      ok: false,
      error: 'Quantity must be between 1 and 10.',
    });
    expect(await addToCart(9999)).toEqual({ ok: false, error: 'Product not found.' });
  });

  it('updates and removes a line', async () => {
    const cartId = crypto.randomUUID();
    cookieStore.set(CART_COOKIE, cartId);
    await addToCart(1);
    nextMock.resetCache();

    expect(await updateCartQuantity(1, 4)).toEqual({ ok: true, quantity: 4 });
    expect(await removeFromCart(1)).toEqual({ ok: true });
    expect(nextMock.updatedTags).toEqual([`cart:${cartId}`, `cart:${cartId}`]);
    expect(await listCartLines(database().db, cartId)).toEqual([]);
  });

  it('cannot update a product that is not in the cart', async () => {
    cookieStore.set(CART_COOKIE, crypto.randomUUID());
    expect(await updateCartQuantity(1, 2)).toEqual({
      ok: false,
      error: 'That product is not in your cart.',
    });
    expect(nextMock.updatedTags).toEqual([]);
  });
});

describe('product actions', () => {
  it('requires a signed-in account to change the featured selection', async () => {
    expect(await setFeaturedProduct(9, true)).toEqual({
      ok: false,
      error: 'Sign in to change featured products.',
    });
  });

  it('updates only the featured selection and the product', async () => {
    cookieStore.set(ACCOUNT_COOKIE, DEMO_ACCOUNT_ID);

    expect(await setFeaturedProduct(9, true)).toEqual({ ok: true, featured: true });
    expect(nextMock.updatedTags).toEqual(['featured-products', 'product:9']);
  });

  it('reports an unknown product', async () => {
    cookieStore.set(ACCOUNT_COOKIE, DEMO_ACCOUNT_ID);
    expect(await setFeaturedProduct(9999, true)).toEqual({
      ok: false,
      error: 'Product not found.',
    });
    expect(nextMock.updatedTags).toEqual([]);
  });
});

describe('user actions', () => {
  it('signs in by email, invalidates the session and redirects to a local path', async () => {
    await expect(
      signIn(null, form({ email: DEMO_ACCOUNT_EMAIL, redirectTo: '/cart' })),
    ).rejects.toEqual(new RedirectError('/cart'));

    expect(nextMock.cookies.get(ACCOUNT_COOKIE)?.value).toBe(DEMO_ACCOUNT_ID);
    expect(nextMock.updatedTags).toEqual(['session']);
  });

  it('never redirects off-site after sign in', async () => {
    await expect(
      signIn(null, form({ email: DEMO_ACCOUNT_EMAIL, redirectTo: '//evil.example' })),
    ).rejects.toEqual(new RedirectError('/'));
  });

  it('keeps the typed email when sign in fails', async () => {
    expect(await signIn(null, form({ email: 'nobody@example.com' }))).toEqual({
      ok: false,
      error: 'No account found for that email.',
      email: 'nobody@example.com',
    });
    expect(await signIn(null, form({ email: 'not an email' }))).toMatchObject({ ok: false });
    expect(nextMock.updatedTags).toEqual([]);
  });

  it('signs out', async () => {
    cookieStore.set(ACCOUNT_COOKIE, DEMO_ACCOUNT_ID);
    expect(await signOut()).toEqual({ ok: true });
    expect(nextMock.cookies.has(ACCOUNT_COOKIE)).toBe(false);
    expect(nextMock.updatedTags).toEqual(['session']);
  });

  it('toggles a saved product and invalidates only that account’s saved data', async () => {
    cookieStore.set(ACCOUNT_COOKIE, DEMO_ACCOUNT_ID);

    expect(await toggleSaveProduct(9)).toEqual({ ok: true, saved: true });
    expect(await toggleSaveProduct(9)).toEqual({ ok: true, saved: false });
    expect(nextMock.updatedTags).toEqual([`saved:${DEMO_ACCOUNT_ID}`, `saved:${DEMO_ACCOUNT_ID}`]);
  });

  it('asks a signed-out visitor to sign in before saving', async () => {
    expect(await toggleSaveProduct(9)).toEqual({ ok: false, error: 'Sign in to save products.' });
    cookieStore.set(ACCOUNT_COOKIE, DEMO_ACCOUNT_ID);
    expect(await toggleSaveProduct(9999)).toEqual({ ok: false, error: 'Product not found.' });
  });

  it('updates the profile and invalidates the account', async () => {
    cookieStore.set(ACCOUNT_COOKIE, DEMO_ACCOUNT_ID);

    expect(await updateProfile(null, form({ name: 'Jane S.', city: 'Oslo' }))).toEqual({
      ok: true,
    });
    expect(nextMock.updatedTags).toEqual([`account:${DEMO_ACCOUNT_ID}`]);
  });

  it('keeps the submitted values when the profile is invalid', async () => {
    cookieStore.set(ACCOUNT_COOKIE, DEMO_ACCOUNT_ID);
    expect(await updateProfile(null, form({ name: '', city: 'Oslo' }))).toEqual({
      ok: false,
      error: 'Enter your name.',
      values: { name: '', city: 'Oslo' },
    });
  });
});
