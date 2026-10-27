import type { ProductSearchInput } from '@realworld/core';
import { AnimatedSuspense } from '@realworld/ui/animated-suspense';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryFilters } from '../../../features/category/category-filters.tsx';
import { ProductList, ProductListSkeleton } from '../../../features/product/product-list.tsx';
import { ProductSearch, ProductSearchSkeleton } from '../../../features/product/product-search.tsx';

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
      <Suspense fallback={<ProductSearchSkeleton />}>
        <ProductSearch />
      </Suspense>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-52 lg:shrink-0">
          <Suspense fallback={null}>
            <CategoryFilters />
          </Suspense>
        </aside>
        <div className="min-w-0 flex-1">
          <AnimatedSuspense fallback={<ProductListSkeleton />}>
            <ProductList searchParams={searchParams} />
          </AnimatedSuspense>
        </div>
      </div>
    </>
  );
}
