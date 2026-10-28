import { catalogHref, type ProductSearch } from '@realworld/core';
import { getProductsPage } from '@realworld/core/product/product-queries';
import { ProductResults } from '@realworld/ui/product-results';
import { StockBadgeSkeleton } from '@realworld/ui/stock-badge';
import { Suspense } from 'react';
import { StockStatus } from './stock-status.tsx';

export async function ProductList({ search }: { search: ProductSearch }) {
  const page = await getProductsPage(search);
  return (
    <ProductResults
      page={page}
      hrefForPage={next => catalogHref(search, { page: next })}
      slot={product => (
        <Suspense fallback={<StockBadgeSkeleton />}>
          <StockStatus productId={product.id} />
        </Suspense>
      )}
    />
  );
}
