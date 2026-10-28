import { prefetch } from '@realworld/core/render-stages';
import { toggleSaveProduct } from '@realworld/core/user/user-actions';
import { getCurrentAccount, isProductSaved } from '@realworld/core/user/user-queries';
import { SaveProductSkeleton, SignInToSaveLink } from '@realworld/ui/save-product';
import { SaveProductButton } from '@realworld/ui/save-product-button';

export { SaveProductSkeleton };

export async function SaveProduct({ productId }: { productId: number }) {
  await prefetch();
  const [account, saved] = await Promise.all([getCurrentAccount(), isProductSaved(productId)]);
  if (!account) return <SignInToSaveLink productId={productId} />;
  return <SaveProductButton productId={productId} saved={saved} action={toggleSaveProduct} />;
}
