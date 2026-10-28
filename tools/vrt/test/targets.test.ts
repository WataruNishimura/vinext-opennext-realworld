import { describe, expect, it } from 'vitest';
import { buildTargets, slugForPath } from '../src/targets.ts';

describe('slugForPath', () => {
  it('turns a path into a file-name-safe slug', () => {
    expect(slugForPath('/')).toBe('home');
    expect(slugForPath('/all')).toBe('all');
    expect(slugForPath('/product/7')).toBe('product-7');
    expect(slugForPath('/all?category=audio&page=2')).toBe('all-category-audio-page-2');
  });
});

describe('buildTargets', () => {
  it('crosses every route with every viewport', () => {
    const targets = buildTargets(
      [{ path: '/all' }, { path: '/product/1', mask: ['[data-testid="live-stock"]'] }],
      [
        { name: 'desktop', width: 1280, height: 800 },
        { name: 'mobile', width: 390, height: 844 },
      ],
    );
    expect(targets.map(target => target.id)).toEqual([
      'all--desktop',
      'all--mobile',
      'product-1--desktop',
      'product-1--mobile',
    ]);
    expect(targets[2]).toMatchObject({
      route: { path: '/product/1', mask: ['[data-testid="live-stock"]'] },
      viewport: { name: 'desktop', width: 1280, height: 800 },
    });
  });

  it('keeps only the targets whose id contains the filter', () => {
    const targets = buildTargets(
      [{ path: '/all' }, { path: '/product/1' }],
      [
        { name: 'desktop', width: 1280, height: 800 },
        { name: 'mobile', width: 390, height: 844 },
      ],
      'product-1',
    );
    expect(targets.map(target => target.id)).toEqual(['product-1--desktop', 'product-1--mobile']);
  });
});
