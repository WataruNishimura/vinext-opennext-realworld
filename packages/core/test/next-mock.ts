/**
 * In-memory stand-ins for the Next.js request and cache APIs, so queries and Server Functions run
 * under Vitest and tests can assert exactly which tags they cache under and invalidate.
 */
export type CookieOptions = Record<string, unknown>;

export const nextMock = {
  cookies: new Map<string, { value: string; options: CookieOptions }>(),
  cacheTags: [] as string[],
  cacheLifes: [] as unknown[],
  updatedTags: [] as string[],
  revalidatedTags: [] as string[],
  refreshCount: 0,
  reset() {
    this.cookies.clear();
    this.resetCache();
  },
  resetCache() {
    this.cacheTags = [];
    this.cacheLifes = [];
    this.updatedTags = [];
    this.revalidatedTags = [];
    this.refreshCount = 0;
  },
};

export class NotFoundError extends Error {
  constructor() {
    super('NEXT_NOT_FOUND');
  }
}

export class RedirectError extends Error {
  readonly url: string;
  constructor(url: string) {
    super(`NEXT_REDIRECT:${url}`);
    this.url = url;
  }
}

export const cookieStore = {
  get(name: string) {
    const cookie = nextMock.cookies.get(name);
    return cookie ? { name, value: cookie.value } : undefined;
  },
  has(name: string) {
    return nextMock.cookies.has(name);
  },
  set(name: string, value: string, options: CookieOptions = {}) {
    nextMock.cookies.set(name, { value, options });
  },
  delete(name: string) {
    nextMock.cookies.delete(name);
  },
};
