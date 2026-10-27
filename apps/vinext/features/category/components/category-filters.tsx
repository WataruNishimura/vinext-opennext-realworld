import type { ProductSearch } from '@realworld/core';
import { getCategories } from '@realworld/core/category/category-queries';
import { cn } from '@realworld/ui/cn';
import { Link } from '@realworld/ui/link';
import { catalogHref } from '../../../lib/routing.ts';

export async function CategoryFilters({ search }: { search: ProductSearch }) {
  const categories = await getCategories();
  const items = [{ slug: null, name: 'All' }, ...categories];
  return (
    <nav aria-label="Categories">
      <ul className="flex flex-wrap gap-2 lg:flex-col">
        {items.map(category => {
          const active = category.slug === search.category;
          return (
            <li key={category.slug ?? 'all'}>
              <Link
                href={catalogHref(search, { category: category.slug, page: 1 })}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-lg px-3 py-1.5 text-sm',
                  active ? 'bg-accent text-on-accent' : 'hover:bg-line/50',
                )}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
