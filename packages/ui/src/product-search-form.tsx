import type { ProductSearch } from '@realworld/core';
import { buttonClasses } from './button.tsx';

/**
 * Catalog search as a plain GET form: the URL is the search state, so results are shareable,
 * cacheable and work without JavaScript. Keeps the category and a non-default sort.
 */
export function ProductSearchForm({ search }: { search: ProductSearch }) {
  return (
    <search>
      <form action="/all" method="get" className="flex gap-2">
        <label htmlFor="catalog-search" className="sr-only">
          Search products
        </label>
        <input
          id="catalog-search"
          type="search"
          name="q"
          defaultValue={search.query}
          placeholder="Search products"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="border-line bg-surface-raised h-10 min-w-0 flex-1 rounded-lg border px-3 text-sm"
        />
        {search.category ? <input type="hidden" name="category" value={search.category} /> : null}
        {search.sort !== 'name-asc' ? (
          <input type="hidden" name="sort" value={search.sort} />
        ) : null}
        <button type="submit" className={buttonClasses()}>
          Search
        </button>
      </form>
    </search>
  );
}
