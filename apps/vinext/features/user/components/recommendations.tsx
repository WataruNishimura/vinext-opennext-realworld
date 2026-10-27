import { getRecommendations } from '@realworld/core/user/user-queries';
import { navigation } from '@realworld/core/render-stages';
import { ProductCard, ProductGrid } from '@realworld/ui/product-card';

/** Below the fold and personal: deferred to the navigation itself. Renders nothing signed out. */
export async function Recommendations() {
  await navigation();
  const products = await getRecommendations();
  if (products.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold tracking-tight">Recommended for you</h2>
      <ProductGrid className="md:grid-cols-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} href={`/product/${product.id}`} />
        ))}
      </ProductGrid>
    </section>
  );
}
