import { describe, expect, it } from 'vitest';
import { parseProductId } from '../lib/routing.ts';

describe('parseProductId', () => {
  it('accepts positive integer ids', () => {
    expect(parseProductId('4')).toBe(4);
  });

  it.each(['0', '-1', '1.5', 'abc', '', '4abc', '1e3'])('rejects %j', value => {
    expect(parseProductId(value)).toBeNull();
  });
});
