import { getFeaturedProducts } from '@realworld/core/product/product-queries';
import { ProductCard, ProductGrid, ProductGridSkeleton } from '@realworld/ui/product-card';
import { connection } from 'next/server';

/** Home page offers: `'use cache: remote'`, tagged `featured-products` (updated by featuring). */
export async function FeaturedProducts() {
  // Kept out of the build-time shell: regenerating a stale shell hangs on workerd (see README).
  await connection();
  const products = await getFeaturedProducts();
  return (
    <ProductGrid className="md:grid-cols-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} href={`/product/${product.id}`} prefetch />
      ))}
    </ProductGrid>
  );
}

export function FeaturedProductsSkeleton() {
  return <ProductGridSkeleton count={4} className="md:grid-cols-4" />;
}
