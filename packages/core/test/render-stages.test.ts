import { describe, expect, it } from 'vitest';
import * as nextStages from '../src/framework/render-stages.ts';
import * as vinextStages from '../src/framework/render-stages.vinext.ts';

describe('render stages', () => {
  it('exposes the same gates for Next.js and vinext', () => {
    expect(Object.keys(nextStages).sort()).toEqual(['navigation', 'prefetch']);
    expect(Object.keys(vinextStages).sort()).toEqual(['navigation', 'prefetch']);
  });

  it('resolves immediately under vinext, which has no per-link prefetch stage yet', async () => {
    await expect(vinextStages.prefetch()).resolves.toBeUndefined();
    await expect(vinextStages.navigation()).resolves.toBeUndefined();
  });
});
