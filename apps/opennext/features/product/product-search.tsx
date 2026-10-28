'use client';

import {
  normalizeProductSearch,
  PRODUCT_SORTS,
  productSearchParams,
  type ProductSort,
} from '@realworld/core';
import Form from 'next/form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

const SORT_LABELS: Record<ProductSort, string> = {
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
};

/** Search-as-you-type and sort. Works without JavaScript through `next/form`. */
export function ProductSearch() {
  const search = normalizeProductSearch(Object.fromEntries(useSearchParams()));
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(overrides: Parameters<typeof productSearchParams>[1]) {
    const query = productSearchParams(search, { ...overrides, page: 1 });
    startTransition(() => {
      router.replace(query ? `/all?${query}` : '/all', { scroll: false });
    });
  }

  return (
    <Form action="/all" className="flex flex-wrap items-center gap-3" aria-busy={isPending}>
      {search.category ? <input type="hidden" name="category" value={search.category} /> : null}
      <label className="flex min-w-60 flex-1 flex-col gap-1 text-sm">
        <span className="sr-only">Search products</span>
        <input
          type="search"
          name="q"
          defaultValue={search.query}
          placeholder="Search products…"
          autoComplete="off"
          onChange={event => {
            navigate({ query: event.currentTarget.value.trim().toLowerCase() });
          }}
          className="border-line bg-surface-raised h-10 rounded-lg border px-3"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">Sort</span>
        <select
          name="sort"
          value={search.sort}
          onChange={event => {
            const sort = PRODUCT_SORTS.find(value => value === event.currentTarget.value);
            if (sort) navigate({ sort });
          }}
          className="border-line bg-surface-raised h-10 rounded-lg border px-2"
        >
          {PRODUCT_SORTS.map(sort => (
            <option key={sort} value={sort}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </select>
      </label>
      <span role="status" className="text-muted w-20 text-sm">
        {isPending ? 'Searching…' : ''}
      </span>
    </Form>
  );
}

export function ProductSearchSkeleton() {
  return <div aria-hidden className="bg-line h-10 w-full animate-pulse rounded-lg" />;
}
