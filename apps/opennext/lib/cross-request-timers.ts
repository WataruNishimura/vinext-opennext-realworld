/**
 * Next.js tracks module loading with one `CacheSignal` per server process
 * (next/dist/server/app-render/module-loading). When a read ends it arms an immediate/timeout
 * check, and the next read cancels it, often from another request. Node allows that; workerd
 * throws "Cannot perform I/O on behalf of a different request" and the render hangs.
 *
 * The cleanup marks the check cancelled before clearing the timer, so a timer that cannot be
 * cleared from this request is already a no-op. Ignore exactly that error.
 */
const CROSS_REQUEST_IO = 'Cannot perform I/O on behalf of a different request';

type ClearTimer = (handle: never) => void;
type TimerTarget = { clearImmediate: ClearTimer; clearTimeout: ClearTimer };

export function tolerateCrossRequestTimerCleanup(target: TimerTarget): void {
  for (const name of ['clearImmediate', 'clearTimeout'] as const) {
    const clear = target[name];
    target[name] = (handle: never) => {
      try {
        clear(handle);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith(CROSS_REQUEST_IO)) return;
        throw error;
      }
    };
  }
}
