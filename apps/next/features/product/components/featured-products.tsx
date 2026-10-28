import { getFeaturedProducts } from '@realworld/core/product/product-queries';
import { ProductCard, ProductGrid } from '@realworld/ui/product-card';
import { StockBadgeSkeleton } from '@realworld/ui/stock-badge';
import { Suspense } from 'react';
import { StockStatus } from './stock-status.tsx';

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  return (
    <ProductGrid className="md:grid-cols-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} href={`/product/${product.id}`} prefetch>
          <Suspense fallback={<StockBadgeSkeleton />}>
            <StockStatus productId={product.id} />
          </Suspense>
        </ProductCard>
      ))}
    </ProductGrid>
  );
}
