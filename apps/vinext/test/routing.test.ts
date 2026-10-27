import { normalizeProductSearch } from '@realworld/core';
import { describe, expect, it } from 'vitest';
import { cartLinkLabel, catalogHref, parseProductId } from '../lib/routing.ts';

describe('parseProductId', () => {
  it('accepts positive integer ids', () => {
    expect(parseProductId('4')).toBe(4);
  });

  it.each(['0', '-1', '1.5', 'abc', '', '4abc', '1e3'])('rejects %j', value => {
    expect(parseProductId(value)).toBeNull();
  });
});

describe('cartLinkLabel', () => {
  it('pluralizes the item count', () => {
    expect(cartLinkLabel(0)).toBe('Cart with 0 items');
    expect(cartLinkLabel(1)).toBe('Cart with 1 item');
    expect(cartLinkLabel(3)).toBe('Cart with 3 items');
  });
});

describe('catalogHref', () => {
  const search = normalizeProductSearch({ q: 'Lamp', sort: 'price-asc', page: '3' });

  it('links to the bare catalog for the default search', () => {
    expect(catalogHref(normalizeProductSearch({}))).toBe('/all');
  });

  it('keeps the current search and applies overrides', () => {
    expect(catalogHref(search, { page: 4 })).toBe('/all?q=lamp&sort=price-asc&page=4');
  });

  it('resets to the first page when the category changes', () => {
    expect(catalogHref(search, { category: 'audio', page: 1 })).toBe(
      '/all?q=lamp&sort=price-asc&category=audio',
    );
  });
});
