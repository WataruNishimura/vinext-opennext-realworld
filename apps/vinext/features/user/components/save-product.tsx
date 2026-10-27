import { getCurrentAccount, isProductSaved } from '@realworld/core/user/user-queries';
import { prefetch } from '@realworld/core/render-stages';
import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';
import { Skeleton } from '@realworld/ui/skeleton';
import { SaveProductButton } from './save-product-button.tsx';

export async function SaveProduct({ productId }: { productId: number }) {
  await prefetch();
  const [account, saved] = await Promise.all([getCurrentAccount(), isProductSaved(productId)]);
  if (!account) {
    return (
      <Link
        href={`/sign-in?redirectTo=${encodeURIComponent(`/product/${productId}`)}`}
        className={buttonClasses({ variant: 'ghost' })}
      >
        Sign in to save
      </Link>
    );
  }
  return <SaveProductButton productId={productId} saved={saved} />;
}

export function SaveProductSkeleton() {
  return <Skeleton className="h-10 w-28 rounded-lg" />;
}
