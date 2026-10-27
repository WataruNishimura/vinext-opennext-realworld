import { PRODUCT_SORTS, type ProductSearch, type ProductSort } from '@realworld/core';
import { cn } from '@realworld/ui/cn';
import { Link } from '@realworld/ui/link';
import { catalogHref } from '../../../lib/routing.ts';

const LABELS: Record<ProductSort, string> = {
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
};

export function SortLinks({ search }: { search: ProductSearch }) {
  return (
    <nav aria-label="Sort products" className="flex flex-wrap gap-2 text-sm">
      {PRODUCT_SORTS.map(sort => (
        <Link
          key={sort}
          href={catalogHref(search, { sort, page: 1 })}
          aria-current={sort === search.sort ? 'true' : undefined}
          className={cn(
            'border-line rounded-full border px-3 py-1',
            sort === search.sort ? 'bg-ink text-surface' : 'hover:bg-line/50',
          )}
        >
          {LABELS[sort]}
        </Link>
      ))}
    </nav>
  );
}
