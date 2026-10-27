import { prefetch } from '@realworld/core/render-stages';
import { getCurrentAccount } from '@realworld/core/user/user-queries';
import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';
import { Skeleton } from '@realworld/ui/skeleton';
import { AccountMenuButton } from './account-menu-button.tsx';

/** The session menu. Reads the private session, so it renders after `prefetch()`. */
export async function AccountMenu() {
  await prefetch();
  const account = await getCurrentAccount();
  if (!account) {
    return (
      <Link href="/sign-in" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
        Sign in
      </Link>
    );
  }
  return <AccountMenuButton name={account.name} />;
}

export function AccountMenuSkeleton() {
  return <Skeleton className="h-8 w-20" />;
}
