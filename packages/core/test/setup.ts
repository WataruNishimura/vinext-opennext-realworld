import { afterEach, vi } from 'vitest';
import { cookieStore, nextMock, NotFoundError, RedirectError } from './next-mock.ts';

vi.mock('next/cache', () => ({
  cacheLife: (profile: unknown) => {
    nextMock.cacheLifes.push(profile);
  },
  cacheTag: (...tags: string[]) => {
    nextMock.cacheTags.push(...tags);
  },
  updateTag: (tag: string) => {
    nextMock.updatedTags.push(tag);
  },
  revalidateTag: (tag: string) => {
    nextMock.revalidatedTags.push(tag);
  },
  refresh: () => {
    nextMock.refreshCount += 1;
  },
  prefetch: () => Promise.resolve(),
  navigation: () => Promise.resolve(),
}));

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve(cookieStore),
}));

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundError();
  },
  redirect: (url: string) => {
    throw new RedirectError(url);
  },
}));

afterEach(() => {
  nextMock.reset();
});
