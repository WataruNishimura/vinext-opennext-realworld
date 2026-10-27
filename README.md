# vinext × OpenNext RealWorld

One commerce demo, two Cloudflare Workers deployments. The same shared packages are rendered by:

- **`apps/opennext`**: Next.js 16.5 canary on Workers through [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **`apps/vinext`**: Cloudflare's [vinext](https://github.com/cloudflare/vinext) (the Next.js API surface on Vite)

The product is modeled on [next16-commerce](https://github.com/aurorascharff/next16-commerce), with the caching ideas of [next16-airline](https://github.com/aurorascharff/next16-airline) (one caching tier per read) and [next16-mail](https://github.com/aurorascharff/next16-mail) (account-scoped cached queries, a private session, heavy bodies kept out of prefetches). It aims to exercise Cache Components as fully as possible: `'use cache'`, `'use cache: private'`, `'use cache: remote'`, `cacheLife`, `cacheTag`, `updateTag` in Server Functions, Partial Prefetching, `ensureStatic`, and the `prefetch()` / `navigation()` render-stage gates.

The code follows the [Next.js App Architecture](https://github.com/aurorascharff/nextjs-app-architecture-skill) skill: queries in `<domain>-queries.ts` (`server-only`), Server Functions in `<domain>-actions.ts` (`'use server'`), tags in a pure `<domain>-cache.ts`, and components that receive ids and own their skeletons.

> The two apps are not in this branch yet. This branch builds the root tooling and the `packages/*` both apps import.

## Repository layout

```
apps/
  opennext/          Next.js + @opennextjs/cloudflare  (added later)
  vinext/            vinext                             (added later)
packages/
  db/                Drizzle schema, migrations, seed, D1 client, Miniflare test database
  core/              Data layer: queries by caching tier, Server Functions, tags, session
  ui/                Shared React components (Tailwind CSS v4, Ariakit, View Transitions)
```

```
@realworld/ui  ──▶  @realworld/core  ──▶  @realworld/db  ──▶  drizzle-orm / D1
     │                    │
     └── next/link        └── next/cache, next/headers, next/navigation (src/framework only)
```

Packages ship TypeScript source. Each one exposes typed entry points through `package.json` `exports`, and apps import them by workspace package name (`@realworld/core/product/product-queries`). There are no `paths`, `baseUrl` or import aliases anywhere.

## Tooling

| Tool                  | Notes                                                                                                                                                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm workspaces       | Versions live once in the `catalog:` in `pnpm-workspace.yaml`.                                                                                                                                                                                                                                                      |
| Turborepo             | `lint`, `typecheck`, `test` and `build` run per package.                                                                                                                                                                                                                                                            |
| TypeScript 7          | `tsc` is the native TypeScript 7 compiler (`typescript-7` in the catalog). typescript-eslint and Next.js still load the JavaScript compiler API, so the `typescript` package name resolves to `@typescript/typescript6`, which ships that API (its binary is `tsc6`). Strict settings live in `tsconfig.base.json`. |
| ESLint (flat config)  | `typescript-eslint` strict + stylistic type-checked, `react-hooks` (including the React Compiler rules), `eslint-config-prettier`. `any` is an error.                                                                                                                                                               |
| Prettier              | With `prettier-plugin-tailwindcss`.                                                                                                                                                                                                                                                                                 |
| Vitest                | Per package. Database tests run against a real D1 database in Miniflare (the workerd runtime).                                                                                                                                                                                                                      |
| `cf` (Cloudflare CLI) | D1 migrations and remote queries. Wrangler is not used.                                                                                                                                                                                                                                                             |

```bash
pnpm install
pnpm lint        # ESLint in every package
pnpm typecheck   # tsc --noEmit (TypeScript 7) in every package
pnpm test        # Vitest in every package
pnpm format      # Prettier
```

Node.js 24 or later is required. Scripts in `packages/db/scripts` run directly with Node's built-in TypeScript type stripping.

## How the data loads

Each read has its own caching tier and arrives at a different stage of a navigation. Tags are defined once per domain in `<domain>-cache.ts` and shared by the query (`cacheTag`) and the Server Functions (`updateTag`).

| Read                                           | Function (`@realworld/core/…`)                                                        | How it is cached                                       | Tags                                                 | Lifetime     | When it arrives                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | ------------ | -------------------------------------------- |
| Categories, category counts, a category        | `category/category-queries`: `getCategories`, `getCategoriesWithCount`, `getCategory` | `'use cache'`                                          | `categories` (+ `products` for counts)               | `days`       | In the static shell                          |
| Featured products (home page offers)           | `product/product-queries`: `getFeaturedProducts`                                      | `'use cache: remote'`, tagged                          | `featured-products`, `products`                      | `max`        | In the static shell                          |
| A page of the catalog (search, sort, category) | `product/product-queries`: `getProductsPage`                                          | `'use cache: remote'`, keyed on normalized search      | `products`                                           | `hours`      | With the link's prefetch (`<Link prefetch>`) |
| Product header and details                     | `product/product-queries`: `getProduct`, `getProductsByIds`                           | `'use cache'` per product                              | `products`, `product:<id>`                           | `hours`      | With the link's prefetch                     |
| Rating summary                                 | `product/product-queries`: `getReviewSummary`                                         | `'use cache'` per product                              | `reviews:<id>`                                       | `hours`      | With the link's prefetch                     |
| Stock badge (in stock / low / sold out)        | `product/product-queries`: `getStockStatus`                                           | `'use cache: remote'`, short-lived                     | `stock:<id>`                                         | `minutes`    | With the link's prefetch                     |
| The session (account id, cart id)              | `user/user-queries`: `getSession`                                                     | `'use cache: private'` (browser only)                  | `session`                                            | `stale: 300` | Per session, before the cached reads it keys |
| Signed-in account                              | `user/user-queries`: `getCurrentAccount`, `requireAccount`                            | `'use cache'` per account id, from the private session | `account:<id>`                                       | `max`        | Per session                                  |
| Your cart and cart count                       | `cart/cart-queries`: `getCart`, `getCartCount`                                        | `'use cache'` per cart id, after `prefetch()`          | `cart:<cartId>` (+ `products`)                       | `max`        | With a per-link prefetch                     |
| Your saved products, "is saved"                | `user/user-queries`: `getSavedProducts`, `isProductSaved`                             | `'use cache'` per account, after `prefetch()`          | `saved:<accountId>` (+ `products`)                   | `max`        | With a per-link prefetch                     |
| Reviews (full bodies)                          | `product/product-queries`: `getReviews`                                               | `'use cache'` per product, after `navigation()`        | `reviews:<id>`                                       | `hours`      | On the navigation                            |
| Recommendations                                | `user/user-queries`: `getRecommendations`                                             | `'use cache'` per account, after `navigation()`        | `saved:<accountId>`, `featured-products`, `products` | `hours`      | On the navigation                            |
| Exact stock ("Only 3 left")                    | `product/product-queries`: `getLiveStock`                                             | Uncached                                               | –                                                    | –            | On every request, in its own `<Suspense>`    |

How the lifetimes were chosen: reads whose every write goes through a Server Function that calls `updateTag` use `max`. Reads that also change outside the app (catalog edits, prices, orders reducing stock) get a shorter profile matched to how stale they may get. Product changes made outside the app can be pushed with `revalidateTag('products', 'max')` from a route handler or webhook.

The gates (`prefetch()`, `navigation()`) are awaited in the app's feature component right before it calls the query, never inside the cache scope:

```tsx
import { navigation } from '@realworld/core/render-stages';
import { getReviews } from '@realworld/core/product/product-queries';

export async function Reviews({ productId }: { productId: number }) {
  await navigation(); // keep review bodies out of every prefetch
  const reviews = await getReviews(productId);
  // …
}
```

Per-user data never reads cookies inside a shared cache scope: an uncached wrapper resolves the session (`'use cache: private'`) and passes only the normalized account or cart id into the cached function, which stays unexported.

### Server Functions and the tags they update

Every Server Function re-reads the session, validates its input with zod, returns a discriminated union (`{ ok: true, … } | { ok: false, error }`), and updates only the tags whose data it changed. The tests in `packages/core/test/actions.test.ts` assert the exact tags.

| Server Function                           | Module                    | Updates                                                              |
| ----------------------------------------- | ------------------------- | -------------------------------------------------------------------- |
| `addToCart(productId, quantity?)`         | `cart/cart-actions`       | `cart:<cartId>`; plus `session` only when it creates the cart cookie |
| `updateCartQuantity(productId, quantity)` | `cart/cart-actions`       | `cart:<cartId>`                                                      |
| `removeFromCart(productId)`               | `cart/cart-actions`       | `cart:<cartId>`                                                      |
| `setFeaturedProduct(productId, featured)` | `product/product-actions` | `featured-products`, `product:<id>`                                  |
| `toggleSaveProduct(productId)`            | `user/user-actions`       | `saved:<accountId>` (saved list, saved flag and recommendations)     |
| `signIn(state, formData)` / `signOut()`   | `user/user-actions`       | `session`                                                            |
| `updateProfile(state, formData)`          | `user/user-actions`       | `account:<accountId>`                                                |

Cart changes check the live stock (uncached) and never invalidate the catalog. Featuring a product does not touch catalog pages. Sign-in is a demo flow: an email from the seed (for example `jane.smith@example.com`) signs in without a password.

## Packages

### `@realworld/db`

| Export                     | What it is                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `@realworld/db`            | `createDb(binding)`, `schema`, row types, `Database`, `D1Binding`                          |
| `@realworld/db/seed`       | `buildSeedData()`, `seed(db)`, `seedStatements()`, `DEMO_ACCOUNT_ID`, `DEMO_ACCOUNT_EMAIL` |
| `@realworld/db/migrations` | `migrationsDir`, `readMigrations()`                                                        |
| `@realworld/db/testing`    | `createTestDatabase()`: an isolated, migrated D1 database in Miniflare                     |

Tables: `categories`, `products` (with the `featured` flag), `inventory`, `accounts`, `reviews`, `cart_items` (keyed by an opaque cart id cookie), `saved_products`. Money is stored in cents, timestamps as integer milliseconds. The seed is deterministic (seeded PRNG, fixed timestamps): 7 categories, 28 products (4 featured, some sold out, some low in stock), 2 accounts and generated reviews.

```bash
pnpm db:generate                                     # drizzle-kit generate after a schema change
D1_DATABASE_ID=<uuid> pnpm db:migrate:local          # cf d1 migrations apply <uuid> --local --dir packages/db/migrations
D1_DATABASE_ID=<uuid> pnpm db:seed:local             # write the seed into the same local state
pnpm -s --filter @realworld/db db:seed-sql > seed.sql # the seed as SQL
```

`cf` identifies databases by ID and targets the remote database by default, so the scripts run locally unless you pass `--remote` (`pnpm --filter @realworld/db db:migrate:remote`, `db:seed:remote`). `cf d1 query` has no local mode yet, so the local seed opens the state `cf` keeps (`~/.config/cloudflare/state/v3/d1` by default, override with `--persist-to`) through Miniflare; the remote seed goes through `cf d1 query --sql`.

### `@realworld/core`

| Export                                      | What it is                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `@realworld/core`                           | Client-safe: tags, domain types, `normalizeProductSearch`, `formatPrice`, `stockStatus`, … |
| `@realworld/core/database`                  | `configureDatabase(resolver)`, `getDb()`                                                   |
| `@realworld/core/render-stages`             | `prefetch()`, `navigation()`; no-op fallbacks under the `vinext` export condition          |
| `@realworld/core/<domain>/<domain>-queries` | Server-only queries (`category`, `product`, `cart`, `user`)                                |
| `@realworld/core/<domain>/<domain>-actions` | Server Functions (`product`, `cart`, `user`)                                               |
| `@realworld/core/<domain>/<domain>-cache`   | Tag helpers                                                                                |
| `@realworld/core/<domain>/<domain>-data`    | Framework-free D1 reads and writes, each taking a `Database`                               |

Each domain is split into a framework-free data layer (`*-data.ts`, tested against Miniflare D1) and a thin Next-facing layer (`*-queries.ts` with cache directives, `*-actions.ts` with `updateTag`). All Next.js imports go through `src/framework/next.ts` (`next/cache`, `next/headers`, `next/navigation`), which vinext shims; the only APIs vinext lacks today, `prefetch()` and `navigation()`, are swapped by an export condition.

### `@realworld/ui`

Shared components, one per kebab-case file, imported as `@realworld/ui/<file>`: `button`, `card`, `skeleton`, `price`, `star-rating`, `stock-badge`, `product-image`, `product-card` (`ProductCard`, `ProductGrid`, `ProductGridSkeleton`), `pagination`, `animated-suspense`, and the client leaves `quantity-stepper` (`useOptimistic` action prop), `modal` (native `<dialog>`) and `dropdown-menu` (Ariakit menu). Components are pure and free of manual memoization, so the React Compiler can optimize them. Skeletons sit next to their components and match their size.

Design tokens use `light-dark()` with `color-scheme: light dark`. Apps load them after Tailwind:

```css
@import 'tailwindcss';
@import '@realworld/ui/styles.css';
```

Also add `<meta name="color-scheme" content="light dark">` to the root layout's `<head>`.

## Wiring the apps

### D1 binding

Both apps declare the same binding, **`DB`**, in `cloudflare.config.ts`:

```ts
import { bindings, defineConfig } from 'cf/config';

export default defineConfig({
  name: 'realworld-opennext', // or realworld-vinext
  env: {
    DB: bindings.d1({ id: '<d1-database-uuid>', name: 'realworld' }),
  },
});
```

Use the same database ID for `D1_DATABASE_ID` when running the migration and seed scripts.

`@realworld/core` never reads the binding itself. Each app registers how to get it, once per server runtime, in a module that every server entry imports (the root layout and `instrumentation.ts`):

```ts
// apps/opennext/lib/database.ts
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { configureDatabase } from '@realworld/core/database';

configureDatabase(async () => (await getCloudflareContext({ async: true })).env.DB);
```

```ts
// apps/vinext/lib/database.ts
import { env } from 'cloudflare:workers';
import { configureDatabase } from '@realworld/core/database';

configureDatabase(() => env.DB);
```

The resolver runs on every `getDb()` call; the Drizzle client is memoized per binding object, so this is cheap. Until an app configures it, `getDb()` throws a `DatabaseNotConfiguredError` that points back here.

### Next.js (`apps/opennext`)

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  transpilePackages: ['@realworld/core', '@realworld/ui', '@realworld/db'],
};
```

`transpilePackages` makes Next compile the packages' TypeScript and their `'use cache'` / `'use server'` directives. Routes whose output must stay static can assert it with `export const ensureStatic = 'navigation'` (or a less strict level); see `node_modules/next/dist/docs/01-app/02-guides/keeping-pages-static.md`. `'use cache: remote'` needs a remote cache handler; configure the OpenNext Cloudflare cache (for example KV) for it.

### vinext (`apps/vinext`)

Add the `vinext` export condition so `@realworld/core/render-stages` resolves to its fallback:

```ts
// vite.config.ts
export default defineConfig({
  resolve: { conditions: ['vinext'] },
  // …
});
```

vinext implements `'use cache'` (including the `remote` and `private` variants), `cacheLife`, `cacheTag`, `updateTag`, `cookies()` and `next/link`. It does not implement Partial Prefetching render stages yet, so `prefetch()` and `navigation()` resolve immediately there; the reads behind them stay cached.

## Testing

```bash
pnpm test
```

- **`@realworld/db`**: migrations apply to a fresh Miniflare D1 database; the seed is deterministic, idempotent, and its SQL form recreates the same data.
- **`@realworld/core`**: every data function runs against a seeded Miniflare D1 database. Queries and Server Functions run with in-memory stand-ins for `next/cache`, `next/headers` and `next/navigation`, and the tests assert each query's tags and lifetime, each query's cache directive (read from source, matching the table above), and the exact tags each Server Function updates.
- **`@realworld/ui`**: components render under happy-dom with Testing Library.
