import { catalogHref, type ProductSearch } from '@realworld/core';
import { getProductsPage } from '@realworld/core/product/product-queries';
import { ProductGridSkeleton } from '@realworld/ui/product-card';
import { ProductResults } from '@realworld/ui/product-results';
import { StockBadgeSkeleton } from '@realworld/ui/stock-badge';
import { Suspense } from 'react';
import { ProductStockBadge } from './product-stock-badge.tsx';

/**
 * One page of the catalog: `'use cache: remote'`, keyed on the normalized search, so every
 * equivalent URL shares one entry. Resolved with each `<Link prefetch>` into `/all`.
 */
export async function ProductList({ search }: { search: ProductSearch }) {
  const page = await getProductsPage(search);
  return (
    <ProductResults
      page={page}
      hrefForPage={pageNumber => catalogHref(search, { page: pageNumber })}
      slot={product => (
        <Suspense fallback={<StockBadgeSkeleton />}>
          <ProductStockBadge productId={product.id} />
        </Suspense>
      )}
    />
  );
}

export function ProductListSkeleton() {
  return <ProductGridSkeleton withSlot />;
}
