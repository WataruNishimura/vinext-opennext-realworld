import type { Product, ProductPage } from '@realworld/core';
import type { ReactNode } from 'react';
import { Pagination } from './pagination.tsx';
import { ProductCard, ProductGrid } from './product-card.tsx';

/** One page of catalog results: the count, the cards (each with an optional slot) and paging. */
export function ProductResults({
  page,
  hrefForPage,
  slot,
}: {
  page: ProductPage;
  hrefForPage: (page: number) => string;
  slot?: (product: Product) => ReactNode;
}) {
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
            {slot?.(product)}
          </ProductCard>
        ))}
      </ProductGrid>
      <Pagination page={page.page} totalPages={page.totalPages} hrefForPage={hrefForPage} />
    </div>
  );
}
