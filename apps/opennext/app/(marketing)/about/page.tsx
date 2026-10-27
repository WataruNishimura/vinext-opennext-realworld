import { buttonClasses } from '@realworld/ui/button';
import { Card } from '@realworld/ui/card';
import { Link } from '@realworld/ui/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };

const TIERS = [
  {
    title: 'Static shell',
    body: "Categories and featured products are cached with 'use cache' and 'use cache: remote', so every page's shell is prerendered.",
  },
  {
    title: 'Per-link prefetch',
    body: 'Catalog pages, product headers and stock badges resolve with <Link prefetch>, before you click.',
  },
  {
    title: 'Per session',
    body: "Your cart, saved products and account wait behind prefetch() and read a 'use cache: private' session.",
  },
  {
    title: 'On navigation',
    body: 'Review bodies and recommendations wait behind navigation(), so no prefetch pays for them.',
  },
  {
    title: 'Always fresh',
    body: 'Exact stock is read on every request in its own Suspense boundary.',
  },
  {
    title: 'Precise invalidation',
    body: 'Server Functions call updateTag for exactly the tags they change; OpenNext stores tags in D1.',
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="flex flex-col items-center gap-4 text-center">
        <p className="text-accent text-sm font-semibold tracking-wide uppercase">About</p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          A store where every read knows how fresh it must be.
        </h1>
        <p className="text-muted max-w-2xl">
          Next.js Cache Components on Cloudflare Workers through OpenNext, with D1 for data, Workers
          KV for the incremental cache and a Durable Object revalidation queue.
        </p>
        <Link href="/all" prefetch className={buttonClasses()}>
          Browse products
        </Link>
      </section>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TIERS.map(tier => (
          <li key={tier.title}>
            <Card className="h-full">
              <h2 className="font-semibold">{tier.title}</h2>
              <p className="text-muted mt-2 text-sm leading-relaxed">{tier.body}</p>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
