import { normalizeProductSearch, type ProductSearchInput } from '@realworld/core';
import { ProductGridSkeleton } from '@realworld/ui/product-card';
import { Skeleton } from '@realworld/ui/skeleton';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryFilters } from '../../../features/category/components/category-filters.tsx';
import { ProductList } from '../../../features/product/components/product-list.tsx';
import { ProductSearch } from '../../../features/product/components/product-search.tsx';
import { SortLinks } from '../../../features/product/components/sort-links.tsx';

export const metadata: Metadata = { title: 'All products' };

type Props = { searchParams: Promise<ProductSearchInput> };

export default function CatalogPage({ searchParams }: Props) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">All products</h1>
      <Suspense fallback={<CatalogSkeleton />}>
        {searchParams.then(params => {
          const search = normalizeProductSearch(params);
          return (
            <div className="flex flex-col gap-8 lg:flex-row">
              <aside className="lg:w-56 lg:shrink-0">
                <CategoryFilters search={search} />
              </aside>
              <div className="flex flex-1 flex-col gap-6">
                <ProductSearch search={search} />
                <SortLinks search={search} />
                <Suspense key={JSON.stringify(search)} fallback={<ProductGridSkeleton withSlot />}>
                  <ProductList search={search} />
                </Suspense>
              </div>
            </div>
          );
        })}
      </Suspense>
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <Skeleton className="h-64 lg:w-56" />
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-10" />
        <ProductGridSkeleton withSlot />
      </div>
    </div>
  );
}
