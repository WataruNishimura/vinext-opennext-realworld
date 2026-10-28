import { describe, expect, it } from 'vitest';
import { renderReport, summarize, type TargetResult } from '../src/report.ts';

const pass: TargetResult = {
  id: 'all--desktop',
  path: '/all',
  viewport: 'desktop',
  width: 1280,
  height: 2000,
  diffPixels: 0,
  diffRatio: 0,
  sizeMismatch: false,
};
const fail: TargetResult = {
  id: 'product-7--mobile',
  path: '/product/7',
  viewport: 'mobile',
  width: 390,
  height: 1800,
  diffPixels: 7020,
  diffRatio: 0.01,
  sizeMismatch: true,
};

describe('summarize', () => {
  it('fails the targets above the allowed ratio', () => {
    expect(summarize([pass, fail], 0.001)).toEqual({ passed: false, failures: [fail] });
    expect(summarize([pass, fail], 0.02)).toEqual({ passed: true, failures: [] });
  });
});

describe('renderReport', () => {
  it('shows each target side by side with its diff and verdict', () => {
    const html = renderReport([pass, fail], { maxDiffRatio: 0.001, apps: ['opennext', 'vinext'] });
    expect(html).toContain('<img src="product-7--mobile.opennext.png"');
    expect(html).toContain('<img src="product-7--mobile.vinext.png"');
    expect(html).toContain('<img src="product-7--mobile.diff.png"');
    expect(html).toContain('1.000%');
    expect(html).toMatch(/product-7--mobile[\s\S]*FAIL/);
    expect(html).toMatch(/all--desktop[\s\S]*PASS/);
    expect(html).toContain('size differs');
  });

  it('escapes paths', () => {
    const html = renderReport([{ ...pass, path: '/all?q=<b>' }], {
      maxDiffRatio: 0.001,
      apps: ['opennext', 'vinext'],
    });
    expect(html).toContain('/all?q=&lt;b&gt;');
    expect(html).not.toContain('<b>');
  });
});
