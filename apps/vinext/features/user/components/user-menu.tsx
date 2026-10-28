import { getCurrentAccount } from '@realworld/core/user/user-queries';
import { prefetch } from '@realworld/core/render-stages';
import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';
import { Skeleton } from '@realworld/ui/skeleton';
import { AccountMenu } from './account-menu.tsx';

export async function UserMenu() {
  await prefetch();
  const account = await getCurrentAccount();
  if (!account) {
    return (
      <Link href="/sign-in" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
        Sign in
      </Link>
    );
  }
  return <AccountMenu name={account.name} />;
}

export function UserMenuSkeleton() {
  return <Skeleton className="h-8 w-20" />;
}
