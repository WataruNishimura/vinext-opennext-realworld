import { beforeEach, describe, expect, it } from 'vitest';
import {
  addCartItem,
  countCartItems,
  listCartLines,
  removeCartItem,
  setCartItemQuantity,
} from '../src/cart/cart-data.ts';
import { useSeededDatabase } from './seeded-database.ts';

const database = useSeededDatabase();
const now = new Date(Date.UTC(2026, 5, 1));
let cartId: string;

beforeEach(() => {
  cartId = crypto.randomUUID();
});

describe('cart', () => {
  it('starts empty', async () => {
    expect(await listCartLines(database().db, cartId)).toEqual([]);
    expect(await countCartItems(database().db, cartId)).toBe(0);
  });

  it('adds a product and increments it on repeat', async () => {
    const { db } = database();
    expect(await addCartItem(db, cartId, 1, 1, now)).toBe(1);
    expect(await addCartItem(db, cartId, 1, 2, now)).toBe(3);

    const lines = await listCartLines(db, cartId);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      quantity: 3,
      product: { id: 1, name: 'Wireless Headphones' },
    });
  });

  it('caps a line at ten', async () => {
    const { db } = database();
    await addCartItem(db, cartId, 2, 8, now);
    expect(await addCartItem(db, cartId, 2, 8, now)).toBe(10);
  });

  it('keeps lines in the order they were added', async () => {
    const { db } = database();
    await addCartItem(db, cartId, 5, 1, now);
    await addCartItem(db, cartId, 3, 1, new Date(now.getTime() + 1000));

    expect((await listCartLines(db, cartId)).map(line => line.product.id)).toEqual([5, 3]);
    expect(await countCartItems(db, cartId)).toBe(2);
  });

  it('sets and removes quantities', async () => {
    const { db } = database();
    await addCartItem(db, cartId, 4, 1, now);

    expect(await setCartItemQuantity(db, cartId, 4, 6)).toBe(true);
    expect(await countCartItems(db, cartId)).toBe(6);

    await removeCartItem(db, cartId, 4);
    expect(await listCartLines(db, cartId)).toEqual([]);
  });

  it('does not set the quantity of a product that is not in the cart', async () => {
    expect(await setCartItemQuantity(database().db, cartId, 4, 2)).toBe(false);
  });

  it('keeps carts apart', async () => {
    const { db } = database();
    await addCartItem(db, cartId, 1, 1, now);
    expect(await listCartLines(db, crypto.randomUUID())).toEqual([]);
  });
});
