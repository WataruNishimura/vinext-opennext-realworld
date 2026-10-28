import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { compareScreenshots } from '../src/compare.ts';
import { solidPng } from './png.ts';

const WHITE = [255, 255, 255] as const;
const BLACK = [0, 0, 0] as const;

describe('compareScreenshots', () => {
  it('reports no difference for identical images', () => {
    const image = solidPng(10, 10, WHITE);
    const result = compareScreenshots(image, image);
    expect(result).toMatchObject({
      width: 10,
      height: 10,
      diffPixels: 0,
      diffRatio: 0,
      sizeMismatch: false,
    });
  });

  it('counts the differing pixels and their share of the image', () => {
    const before = solidPng(10, 10, WHITE);
    const after = solidPng(10, 10, WHITE, { x: 0, y: 0, width: 5, height: 2, color: BLACK });
    const result = compareScreenshots(before, after);
    expect(result.diffPixels).toBe(10);
    expect(result.diffRatio).toBeCloseTo(0.1);
  });

  it('writes a diff image of the compared size', () => {
    const before = solidPng(4, 3, WHITE);
    const after = solidPng(4, 3, BLACK);
    const diff = PNG.sync.read(compareScreenshots(before, after).diff);
    expect([diff.width, diff.height]).toEqual([4, 3]);
  });

  it('pads different heights and counts the missing area as different', () => {
    const shorter = solidPng(10, 8, WHITE);
    const taller = solidPng(10, 10, WHITE);
    const result = compareScreenshots(shorter, taller);
    expect(result).toMatchObject({ width: 10, height: 10, sizeMismatch: true });
    expect(result.diffPixels).toBe(20);
    expect(result.diffRatio).toBeCloseTo(0.2);
  });
});
