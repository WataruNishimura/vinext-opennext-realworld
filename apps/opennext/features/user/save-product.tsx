import { prefetch } from '@realworld/core/render-stages';
import { getCurrentAccount, isProductSaved } from '@realworld/core/user/user-queries';
import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';
import { Skeleton } from '@realworld/ui/skeleton';
import { SaveProductButton } from './save-product-button.tsx';

/** One cached entry per account (`saved:<accountId>`) answers "is saved" for every product. */
export async function SaveProduct({ productId }: { productId: number }) {
  await prefetch();
  const account = await getCurrentAccount();
  if (!account) {
    return (
      <Link
        href={`/sign-in?redirectTo=${encodeURIComponent(`/product/${productId}`)}`}
        className={buttonClasses({ variant: 'secondary' })}
      >
        Sign in to save
      </Link>
    );
  }
  return <SaveProductButton productId={productId} saved={await isProductSaved(productId)} />;
}

export function SaveProductSkeleton() {
  return <Skeleton className="h-10 w-28" />;
}
