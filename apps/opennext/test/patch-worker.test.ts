import { describe, expect, it } from 'vitest';
import { isolateModuleLoadingSignal } from '../scripts/patch-worker.ts';

describe('isolateModuleLoadingSignal', () => {
  it('turns readable subscribeToReads definitions into no-ops', () => {
    const source =
      'class CacheSignal{subscribeToReads(subscriber){if(subscriber===this)throw Error("x");this.s.add(subscriber)}}';
    expect(isolateModuleLoadingSignal(source)).toEqual({
      code: 'class CacheSignal{subscribeToReads(subscriber){return()=>{};if(subscriber===this)throw Error("x");this.s.add(subscriber)}}',
      patched: 1,
    });
  });

  it('patches minified copies too', () => {
    const source = 'x{subscribeToReads(e10){if(e10===this)throw 1}}y{subscribeToReads(t){t()}}';
    expect(isolateModuleLoadingSignal(source).patched).toBe(2);
  });

  it('leaves call sites alone', () => {
    const source = 'let u=getModuleLoadingSignal().subscribeToReads(cacheSignal);';
    expect(isolateModuleLoadingSignal(source)).toEqual({ code: source, patched: 0 });
  });

  it('is idempotent', () => {
    const once = isolateModuleLoadingSignal('{subscribeToReads(e){e()}}').code;
    expect(isolateModuleLoadingSignal(once)).toEqual({ code: once, patched: 0 });
  });
});
