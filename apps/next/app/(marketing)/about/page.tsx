import { buttonClasses } from '@realworld/ui/button';
import { Card } from '@realworld/ui/card';
import { Link } from '@realworld/ui/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };
// Static through the per-link prefetch. Not 'navigation': the shared header streams the
// per-session cart badge and account menu on the navigation (see README).
export const ensureStatic = 'prefetch';

const SERVICES = [
  ['Price match', 'Found a lower price? We match it.'],
  ['Free delivery', 'Complimentary shipping on orders over $50.'],
  ['Trade-in', 'Credit towards your next purchase.'],
  ['Easy returns', '30-day returns with free return shipping.'],
] as const;

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-4xl font-bold tracking-tight">About us</h1>
        <p className="text-muted max-w-2xl text-lg">
          This store is part of a comparison: the same shared packages rendered by Next.js on
          Vercel, by vinext on Cloudflare Workers and by Next.js through OpenNext.
        </p>
        <Link href="/all" prefetch className={buttonClasses()}>
          Browse products
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SERVICES.map(([title, description]) => (
          <Card key={title} className="flex flex-col gap-2 p-6">
            <h2 className="font-semibold">{title}</h2>
            <p className="text-muted text-sm">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
