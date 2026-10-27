import { getCurrentAccount, getSavedProducts } from '@realworld/core/user/user-queries';
import { prefetch } from '@realworld/core/render-stages';
import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';
import { ProductCard, ProductGrid } from '@realworld/ui/product-card';
import { SaveProductButton } from './save-product-button.tsx';

export async function SavedProducts() {
  await prefetch();
  const [account, products] = await Promise.all([getCurrentAccount(), getSavedProducts()]);

  if (!account) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p>Sign in to see the products you saved.</p>
        <Link href="/sign-in?redirectTo=%2Fsaved" className={buttonClasses()}>
          Sign in
        </Link>
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p>You have no saved products yet.</p>
        <Link href="/all" prefetch className={buttonClasses()}>
          Browse products
        </Link>
      </div>
    );
  }
  return (
    <ProductGrid>
      {products.map(product => (
        <ProductCard key={product.id} product={product} href={`/product/${product.id}`} prefetch>
          <SaveProductButton productId={product.id} saved label={product.name} />
        </ProductCard>
      ))}
    </ProductGrid>
  );
}
