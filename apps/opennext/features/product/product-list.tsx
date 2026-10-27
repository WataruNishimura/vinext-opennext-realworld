import {
  normalizeProductSearch,
  productSearchParams,
  type ProductSearchInput,
} from '@realworld/core';
import { getProductsPage } from '@realworld/core/product/product-queries';
import { Pagination } from '@realworld/ui/pagination';
import { ProductCard, ProductGrid, ProductGridSkeleton } from '@realworld/ui/product-card';
import { StockBadgeSkeleton } from '@realworld/ui/stock-badge';
import { Suspense } from 'react';
import { ProductStockBadge } from './product-stock-badge.tsx';

/**
 * One page of the catalog: `'use cache: remote'`, keyed on the normalized search, so every
 * equivalent URL shares one entry. Resolved with each `<Link prefetch>` into `/all`.
 */
export async function ProductList({ searchParams }: { searchParams: Promise<ProductSearchInput> }) {
  const search = normalizeProductSearch(await searchParams);
  const page = await getProductsPage(search);

  if (page.products.length === 0) {
    return <p className="text-muted py-12 text-center">No products match your search.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-muted text-sm" aria-live="polite">
        {page.total} {page.total === 1 ? 'product' : 'products'}
      </p>
      <ProductGrid>
        {page.products.map(product => (
          <ProductCard key={product.id} product={product} href={`/product/${product.id}`} prefetch>
            <Suspense fallback={<StockBadgeSkeleton />}>
              <ProductStockBadge productId={product.id} />
            </Suspense>
          </ProductCard>
        ))}
      </ProductGrid>
      <Pagination
        page={page.page}
        totalPages={page.totalPages}
        hrefForPage={pageNumber => catalogHref(productSearchParams(search, { page: pageNumber }))}
      />
    </div>
  );
}

export function ProductListSkeleton() {
  return <ProductGridSkeleton withSlot />;
}

export function catalogHref(query: string): string {
  return query ? `/all?${query}` : '/all';
}
