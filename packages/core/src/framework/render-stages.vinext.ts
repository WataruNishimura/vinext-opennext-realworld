/**
 * vinext does not implement Partial Prefetching render stages yet, so the gates resolve
 * immediately and the content below them renders with the rest of the request. The queries
 * behind them stay cached either way. Selected by the `vinext` export condition.
 */
export function prefetch(): Promise<void> {
  return Promise.resolve();
}

export function navigation(): Promise<void> {
  return Promise.resolve();
}
