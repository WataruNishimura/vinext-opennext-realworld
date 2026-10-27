/** Cookie holding the signed-in demo account id. */
export const ACCOUNT_COOKIE = 'rw-account';
/** Cookie holding the opaque id of the visitor's cart. */
export const CART_COOKIE = 'rw-cart';

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCartId(value: string | undefined): value is string {
  return value !== undefined && UUID.test(value);
}

export function createCartId(): string {
  return crypto.randomUUID();
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  } as const;
}
