import { describe, expect, it, vi } from 'vitest';
import { tolerateCrossRequestTimerCleanup } from '../lib/cross-request-timers.ts';

const CROSS_REQUEST_ERROR = new Error(
  'Cannot perform I/O on behalf of a different request. I/O objects (such as streams, …) …',
);

function timers(clear: (handle: unknown) => void) {
  return { clearImmediate: vi.fn(clear), clearTimeout: vi.fn(clear) };
}

describe('tolerateCrossRequestTimerCleanup', () => {
  it('ignores clearing a timer that belongs to another request', () => {
    const target = timers(() => {
      throw CROSS_REQUEST_ERROR;
    });
    tolerateCrossRequestTimerCleanup(target);
    expect(() => {
      target.clearImmediate(1);
    }).not.toThrow();
    expect(() => {
      target.clearTimeout(1);
    }).not.toThrow();
  });

  it('still clears timers of the current request', () => {
    const cleared: unknown[] = [];
    const target = timers(handle => cleared.push(handle));
    tolerateCrossRequestTimerCleanup(target);
    target.clearImmediate('a');
    target.clearTimeout('b');
    expect(cleared).toEqual(['a', 'b']);
  });

  it('rethrows any other error', () => {
    const target = timers(() => {
      throw new TypeError('boom');
    });
    tolerateCrossRequestTimerCleanup(target);
    expect(() => {
      target.clearImmediate(1);
    }).toThrow('boom');
  });
});
