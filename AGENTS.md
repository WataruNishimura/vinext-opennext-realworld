# Agent notes

- Read `README.md` first: package roles, the caching-tier table, and how apps wire D1.
- Architecture follows the [Next.js App Architecture](https://github.com/aurorascharff/nextjs-app-architecture-skill) skill. Queries live in `<domain>-queries.ts` (`import 'server-only'`), Server Functions in `<domain>-actions.ts` (`'use server'`), tags in `<domain>-cache.ts`, framework-free D1 access in `<domain>-data.ts`.
- Next.js APIs are version-specific (16.5 canary). Read `node_modules/next/dist/docs/` before using a cache or prefetch API; do not guess names.
- Only `packages/core/src/framework/` imports `next/*` in core; only `packages/ui/src/link.tsx` imports `next/link` in ui.
- Test-driven: add a failing Vitest test first. Database tests use `createTestDatabase()` from `@realworld/db/testing` (Miniflare D1). When a query's directive or tags change, update `packages/core/test/directives.test.ts`, `queries.test.ts` and the README table together.
- TypeScript: strict, no `any`, no `paths`/`baseUrl`/aliases. Import workspace packages by name; relative imports use the `.ts`/`.tsx` extension.
- File names are kebab-case, including React components.
- Cloudflare tooling is the `cf` CLI (`cf cli search "<task>"`, `cf docs search "<question>"`), not Wrangler. Never run `cf dev`, `cf build` or `cf deploy` or create remote resources without being asked.
- Before committing: `pnpm format && pnpm lint && pnpm typecheck && pnpm test`. Conventional commits.
