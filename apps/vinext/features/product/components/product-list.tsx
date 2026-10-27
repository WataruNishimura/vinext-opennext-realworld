import type { ProductSearch } from '@realworld/core';
import { getProductsPage } from '@realworld/core/product/product-queries';
import { Pagination } from '@realworld/ui/pagination';
import { ProductCard, ProductGrid } from '@realworld/ui/product-card';
import { StockBadgeSkeleton } from '@realworld/ui/stock-badge';
import { Suspense } from 'react';
import { catalogHref } from '../../../lib/routing.ts';
import { StockStatus } from './stock-status.tsx';

export async function ProductList({ search }: { search: ProductSearch }) {
  const { products, page, total, totalPages } = await getProductsPage(search);

  if (products.length === 0) {
    return <p className="text-muted py-12 text-center">No products match your search.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-muted text-sm" aria-live="polite">
        {total} {total === 1 ? 'product' : 'products'}
      </p>
      <ProductGrid>
        {products.map(product => (
          <ProductCard key={product.id} product={product} href={`/product/${product.id}`} prefetch>
            <Suspense fallback={<StockBadgeSkeleton />}>
              <StockStatus productId={product.id} />
            </Suspense>
          </ProductCard>
        ))}
      </ProductGrid>
      <Pagination
        page={page}
        totalPages={totalPages}
        hrefForPage={next => catalogHref(search, { page: next })}
      />
    </div>
  );
}
