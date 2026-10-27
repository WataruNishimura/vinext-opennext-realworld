/**
 * Render-stage gates for feature components (Next.js 16.5 canary).
 *
 * - `await prefetch()` keeps what follows out of the shared App Shell; a `<Link prefetch>` or the
 *   navigation renders it.
 * - `await navigation()` defers what follows to the navigation itself.
 *
 * Await them in the async server component right before calling a query, never inside a cache
 * scope. Apps import them from `@realworld/core/render-stages`; under the `vinext` export
 * condition that resolves to `render-stages.vinext.ts`.
 */
export { navigation, prefetch } from 'next/cache';
