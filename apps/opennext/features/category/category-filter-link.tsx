'use client';

import { normalizeProductSearch, productSearchParams } from '@realworld/core';
import { cn } from '@realworld/ui/cn';
import { Link } from '@realworld/ui/link';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

export function CategoryFilterLink({
  category,
  children,
}: {
  category: string | null;
  children: ReactNode;
}) {
  const search = normalizeProductSearch(Object.fromEntries(useSearchParams()));
  const active = search.category === category;
  const query = productSearchParams(search, { category, page: 1 });
  return (
    <Link
      href={query ? `/all?${query}` : '/all'}
      prefetch
      scroll={false}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-lg px-3 py-1.5 text-sm transition-colors',
        active ? 'bg-accent text-on-accent' : 'hover:bg-line/50 text-muted hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
