import { AnimatedSuspense } from '@realworld/ui/animated-suspense';
import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';
import { Suspense } from 'react';
import {
  FeaturedCategories,
  FeaturedCategoriesSkeleton,
} from '../../features/category/featured-categories.tsx';
import {
  FeaturedProducts,
  FeaturedProductsSkeleton,
} from '../../features/product/featured-products.tsx';
import { Recommendations } from '../../features/user/recommendations.tsx';

export const instant = true;

export default function HomePage() {
  return (
    <>
      <section className="border-line bg-surface-raised flex flex-col gap-4 rounded-3xl border p-8 sm:p-12">
        <p className="text-accent text-sm font-semibold tracking-wide uppercase">
          Cache Components on Workers
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Gear for people who ship.
        </h1>
        <p className="text-muted max-w-xl">
          Every read on this page has its own caching tier. The shell is static, your cart and
          account stream in per session, and edits invalidate exactly the tags they touch.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/all" prefetch className={buttonClasses()}>
            Browse all products
          </Link>
          <Link href="/about" className={buttonClasses({ variant: 'secondary' })}>
            How it works
          </Link>
        </div>
      </section>

      <section aria-labelledby="featured" className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="featured" className="text-xl font-semibold">
            Featured products
          </h2>
          <Link href="/all" prefetch className="text-accent text-sm font-medium">
            View all →
          </Link>
        </div>
        <AnimatedSuspense fallback={<FeaturedProductsSkeleton />}>
          <FeaturedProducts />
        </AnimatedSuspense>
      </section>

      <section aria-labelledby="categories" className="flex flex-col gap-4">
        <h2 id="categories" className="text-xl font-semibold">
          Shop by category
        </h2>
        <AnimatedSuspense fallback={<FeaturedCategoriesSkeleton />}>
          <FeaturedCategories />
        </AnimatedSuspense>
      </section>

      <Suspense fallback={null}>
        <Recommendations />
      </Suspense>
    </>
  );
}
