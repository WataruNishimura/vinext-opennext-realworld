import { navigation } from '@realworld/core/render-stages';
import { getRecommendations } from '@realworld/core/user/user-queries';
import { ProductCard, ProductGrid, ProductGridSkeleton } from '@realworld/ui/product-card';

/** Below the fold and per account: kept out of every prefetch with `navigation()`. */
export async function Recommendations() {
  await navigation();
  const products = await getRecommendations();
  if (products.length === 0) return null;
  return (
    <section aria-labelledby="recommendations" className="flex flex-col gap-4">
      <h2 id="recommendations" className="text-xl font-semibold">
        Picked for you
      </h2>
      <ProductGrid className="md:grid-cols-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} href={`/product/${product.id}`} />
        ))}
      </ProductGrid>
    </section>
  );
}

export function RecommendationsSkeleton() {
  return <ProductGridSkeleton count={4} className="md:grid-cols-4" />;
}
