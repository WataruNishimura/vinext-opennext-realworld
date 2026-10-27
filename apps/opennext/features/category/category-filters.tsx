import { getCategories } from '@realworld/core/category/category-queries';
import { connection } from 'next/server';
import { CategoryFilterLink } from './category-filter-link.tsx';

/** The category list is `'use cache'` (`days`); the active state is client-side. */
export async function CategoryFilters() {
  // Kept out of the build-time shell: regenerating a stale shell hangs on workerd (see README).
  await connection();
  const categories = await getCategories();
  return (
    <nav aria-label="Categories" className="flex flex-wrap gap-2 lg:flex-col">
      <CategoryFilterLink category={null}>All</CategoryFilterLink>
      {categories.map(category => (
        <CategoryFilterLink key={category.id} category={category.slug}>
          {category.name}
        </CategoryFilterLink>
      ))}
    </nav>
  );
}
