export const userTags = {
  /** The signed-in session, read with `'use cache: private'`. */
  session: 'session',
  account: (accountId: string) => `account:${accountId}`,
  /** Saved products and everything derived from them (recommendations). */
  saved: (accountId: string) => `saved:${accountId}`,
};
