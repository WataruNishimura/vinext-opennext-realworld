import { PRODUCT_SORTS, type ProductSearch, type ProductSort } from '@realworld/core';
import { cn } from './cn.ts';
import { Link } from './link.tsx';

const LABELS: Record<ProductSort, string> = {
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
};

/** Every sort order as a link, so each one is a cacheable, prefetchable URL. */
export function SortLinks({
  search,
  hrefFor,
}: {
  search: ProductSearch;
  hrefFor: (sort: ProductSort) => string;
}) {
  return (
    <nav aria-label="Sort products" className="flex flex-wrap gap-2 text-sm">
      {PRODUCT_SORTS.map(sort => (
        <Link
          key={sort}
          href={hrefFor(sort)}
          prefetch
          scroll={false}
          aria-current={sort === search.sort ? 'true' : undefined}
          className={cn(
            'border-line rounded-full border px-3 py-1 transition-colors',
            sort === search.sort ? 'bg-ink text-surface' : 'hover:bg-line/50',
          )}
        >
          {LABELS[sort]}
        </Link>
      ))}
    </nav>
  );
}
