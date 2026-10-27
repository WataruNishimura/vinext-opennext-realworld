import { cn } from './cn.ts';
import { Link } from './link.tsx';

export type PaginationItem = number | 'gap';

/** Pages to show: first, last, and the current page with its neighbours. */
export function paginationRange(page: number, totalPages: number): PaginationItem[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((p, index) => {
    const previous = sorted[index - 1];
    return previous !== undefined && p - previous > 1 ? (['gap', p] as const) : [p];
  });
}

const itemClasses =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm tabular-nums';

export function Pagination({
  page,
  totalPages,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} aria-label="Previous page" className={itemClasses}>
          ‹
        </Link>
      ) : null}
      {paginationRange(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} aria-hidden className={cn(itemClasses, 'text-muted')}>
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefForPage(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              itemClasses,
              item === page ? 'bg-accent text-on-accent' : 'hover:bg-line/50',
            )}
          >
            {item}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefForPage(page + 1)} aria-label="Next page" className={itemClasses}>
          ›
        </Link>
      ) : null}
    </nav>
  );
}
