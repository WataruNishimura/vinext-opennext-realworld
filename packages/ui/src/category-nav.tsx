import { cn } from './cn.ts';
import { Link } from './link.tsx';

/** Catalog category links, "All" first, with the active one marked as the current page. */
export function CategoryNav({
  categories,
  active,
  hrefFor,
}: {
  categories: { slug: string; name: string }[];
  active: string | null;
  hrefFor: (slug: string | null) => string;
}) {
  const items = [{ slug: null, name: 'All' }, ...categories];
  return (
    <nav aria-label="Categories">
      <ul className="flex flex-wrap gap-2 lg:flex-col">
        {items.map(category => {
          const current = category.slug === active;
          return (
            <li key={category.slug ?? 'all'}>
              <Link
                href={hrefFor(category.slug)}
                prefetch
                scroll={false}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                  current
                    ? 'bg-accent text-on-accent'
                    : 'text-muted hover:bg-line/50 hover:text-ink',
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
