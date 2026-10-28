import { buttonClasses } from './button.tsx';
import { Link } from './link.tsx';
import { Skeleton } from './skeleton.tsx';

/** Shown in place of the save button when signed out; returns to the product after sign-in. */
export function SignInToSaveLink({ productId }: { productId: number }) {
  return (
    <Link
      href={`/sign-in?redirectTo=${encodeURIComponent(`/product/${productId}`)}`}
      className={buttonClasses({ variant: 'secondary' })}
    >
      Sign in to save
    </Link>
  );
}

export function SaveProductSkeleton() {
  return <Skeleton className="h-10 w-28 rounded-lg" />;
}
