import { getCategoriesWithCount } from '@realworld/core/category/category-queries';
import { Link } from '@realworld/ui/link';
import { Skeleton } from '@realworld/ui/skeleton';
import { connection } from 'next/server';

/** `'use cache'`, `days`, tagged `categories` and `products`. */
export async function FeaturedCategories() {
  // Kept out of the build-time shell: regenerating a stale shell hangs on workerd (see README).
  await connection();
  const categories = await getCategoriesWithCount();
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.slice(0, 4).map(category => (
        <li key={category.id}>
          <Link
            href={`/all?category=${category.slug}`}
            prefetch
            className="border-line bg-surface-raised hover:border-accent block h-full rounded-2xl border p-5 transition-colors"
          >
            <h3 className="font-semibold">{category.name}</h3>
            <p className="text-muted mt-1 text-sm">{category.description}</p>
            <p className="text-accent mt-3 text-sm font-medium">
              {category.productCount} products →
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FeaturedCategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-36 rounded-2xl" />
      ))}
    </div>
  );
}
