import { catalogHref, type ProductSearch } from '@realworld/core';
import { getCategories } from '@realworld/core/category/category-queries';
import { CategoryNav } from '@realworld/ui/category-nav';

/** The category list is `'use cache'` (`days`); the active one comes from the search. */
export async function CategoryFilters({ search }: { search: ProductSearch }) {
  const categories = await getCategories();
  return (
    <CategoryNav
      categories={categories}
      active={search.category}
      hrefFor={category => catalogHref(search, { category, page: 1 })}
    />
  );
}
