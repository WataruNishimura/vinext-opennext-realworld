import { catalogHref, normalizeProductSearch, type ProductSearchInput } from '@realworld/core';
import { AnimatedSuspense } from '@realworld/ui/animated-suspense';
import { CatalogLayout, CatalogLayoutSkeleton } from '@realworld/ui/catalog-layout';
import { ProductSearchForm } from '@realworld/ui/product-search-form';
import { SortLinks } from '@realworld/ui/sort-links';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryFilters } from '../../../features/category/category-filters.tsx';
import { ProductList, ProductListSkeleton } from '../../../features/product/product-list.tsx';

export const metadata: Metadata = { title: 'All products' };
export const instant = true;

export default function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductSearchInput>;
}) {
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
              <AnimatedSuspense key={catalogHref(search)} fallback={<ProductListSkeleton />}>
                <ProductList search={search} />
              </AnimatedSuspense>
            </CatalogLayout>
          );
        })}
      </Suspense>
    </>
  );
}
