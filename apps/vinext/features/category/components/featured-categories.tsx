import { getCategoriesWithCount } from '@realworld/core/category/category-queries';
import { Link } from '@realworld/ui/link';

export async function FeaturedCategories() {
  const categories = await getCategoriesWithCount();
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {categories.map(category => (
        <li key={category.slug}>
          <Link
            href={`/all?category=${category.slug}`}
            className="border-line bg-surface-raised hover:border-accent flex h-full flex-col gap-1 rounded-xl border p-4"
          >
            <span className="font-medium">{category.name}</span>
            <span className="text-muted text-xs">{category.productCount} products</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
