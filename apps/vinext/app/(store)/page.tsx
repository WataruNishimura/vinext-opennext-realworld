import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';
import { ProductGridSkeleton } from '@realworld/ui/product-card';
import { Suspense } from 'react';
import { FeaturedCategories } from '../../features/category/components/featured-categories.tsx';
import { FeaturedProducts } from '../../features/product/components/featured-products.tsx';
import { Recommendations } from '../../features/user/components/recommendations.tsx';

export default function HomePage() {
  return (
    <>
      <section className="bg-surface-raised border-line flex flex-col items-start gap-4 rounded-2xl border p-8 sm:p-12">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase">New season</p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Gear that keeps up with you.
        </h1>
        <p className="text-muted max-w-xl">
          A Cache Components demo: the shell, featured products and categories are cached; your cart
          and saved products stream in per session.
        </p>
        <Link href="/all" prefetch className={buttonClasses()}>
          Shop all products
        </Link>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold tracking-tight">Featured products</h2>
          <Link href="/all" prefetch className="text-sm font-medium hover:underline">
            View all →
          </Link>
        </div>
        <FeaturedProducts />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-tight">Shop by category</h2>
        <FeaturedCategories />
      </section>

      <Suspense fallback={<ProductGridSkeleton count={4} className="md:grid-cols-4" />}>
        <Recommendations />
      </Suspense>
    </>
  );
}
