/**
 * The only module in @realworld/core that imports Next.js request and cache APIs.
 * vinext provides compatible shims for every export here, so both apps share this file; if a shim
 * diverges, swap it here (or behind a conditional export) without touching any query or action.
 */
export { cacheLife, cacheTag, revalidateTag, updateTag } from 'next/cache';
export { cookies } from 'next/headers';
export { notFound, redirect } from 'next/navigation';
