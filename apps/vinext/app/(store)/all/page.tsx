import { catalogHref, normalizeProductSearch, type ProductSearchInput } from '@realworld/core';
import { CatalogLayout, CatalogLayoutSkeleton } from '@realworld/ui/catalog-layout';
import { ProductGridSkeleton } from '@realworld/ui/product-card';
import { ProductSearchForm } from '@realworld/ui/product-search-form';
import { SortLinks } from '@realworld/ui/sort-links';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryFilters } from '../../../features/category/components/category-filters.tsx';
import { ProductList } from '../../../features/product/components/product-list.tsx';

export const metadata: Metadata = { title: 'All products' };

type Props = { searchParams: Promise<ProductSearchInput> };

// The results boundary is a plain Suspense: on vinext a ViewTransition around streamed content
// (the shared AnimatedSuspense) fails SSR (see README).
export default function CatalogPage({ searchParams }: Props) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">All products</h1>
      <Suspense fallback={<CatalogLayoutSkeleton />}>
        {searchParams.then(params => {
          const search = normalizeProductSearch(params);
          return (
            <CatalogLayout
              filters={<CategoryFilters search={search} />}
              toolbar={
                <>
                  <ProductSearchForm search={search} />
                  <SortLinks
                    search={search}
                    hrefFor={sort => catalogHref(search, { sort, page: 1 })}
                  />
                </>
              }
            >
              <Suspense key={catalogHref(search)} fallback={<ProductGridSkeleton withSlot />}>
                <ProductList search={search} />
              </Suspense>
            </CatalogLayout>
          );
        })}
      </Suspense>
    </>
  );
}
