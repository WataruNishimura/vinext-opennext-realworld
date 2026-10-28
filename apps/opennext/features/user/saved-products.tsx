import { prefetch } from '@realworld/core/render-stages';
import { toggleSaveProduct } from '@realworld/core/user/user-actions';
import { getCurrentAccount, getSavedProducts } from '@realworld/core/user/user-queries';
import { buttonClasses } from '@realworld/ui/button';
import { Card } from '@realworld/ui/card';
import { Link } from '@realworld/ui/link';
import { ProductCard, ProductGrid, ProductGridSkeleton } from '@realworld/ui/product-card';
import { SaveProductButton } from '@realworld/ui/save-product-button';

/** Saved products: `'use cache'` per account (`saved:<accountId>`), after `prefetch()`. */
export async function SavedProducts() {
  await prefetch();
  const account = await getCurrentAccount();
  if (!account) {
    return (
      <Card className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted">Sign in to see the products you saved.</p>
        <Link href="/sign-in?redirectTo=%2Fsaved" className={buttonClasses()}>
          Sign in
        </Link>
      </Card>
    );
  }
  const products = await getSavedProducts();
  if (products.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted">You haven’t saved any products yet.</p>
        <Link href="/all" prefetch className={buttonClasses()}>
          Browse products
        </Link>
      </Card>
    );
  }
  return (
    <ProductGrid>
      {products.map(product => (
        <ProductCard key={product.id} product={product} href={`/product/${product.id}`} prefetch>
          <SaveProductButton
            productId={product.id}
            saved
            label={product.name}
            variant="ghost"
            action={toggleSaveProduct}
          />
        </ProductCard>
      ))}
    </ProductGrid>
  );
}

export function SavedProductsSkeleton() {
  return <ProductGridSkeleton count={3} withSlot />;
}
