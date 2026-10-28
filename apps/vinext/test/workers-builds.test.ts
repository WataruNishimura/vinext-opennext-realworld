import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson: unknown = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

function scripts(): Record<string, string> {
  if (typeof packageJson !== 'object' || packageJson === null || !('scripts' in packageJson)) {
    throw new Error('package.json has no scripts');
  }
  return Object.fromEntries(
    Object.entries(packageJson.scripts as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
}

describe('Workers Builds scripts', () => {
  it('deploys the output of the build step instead of building twice', () => {
    expect(scripts()['deploy:ci']).toBe('cf deploy --prebuilt --mode production');
  });

  it('builds with cf build, which needs no credentials', () => {
    expect(scripts()['build']).toBe('cf build');
  });
});
