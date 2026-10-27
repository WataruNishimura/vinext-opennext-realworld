import { prefetch } from '@realworld/core/render-stages';
import { requireAccount } from '@realworld/core/user/user-queries';
import { Skeleton } from '@realworld/ui/skeleton';
import { ProfileForm } from './profile-form.tsx';

/** The full profile: `'use cache'` per account (`account:<id>`), or a redirect to sign in. */
export async function AccountDetails() {
  await prefetch();
  const account = await requireAccount('/account');
  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted">
        Signed in as <span className="text-ink font-medium">{account.email}</span>
      </p>
      <ProfileForm
        values={{
          name: account.name,
          firstName: account.firstName ?? '',
          lastName: account.lastName ?? '',
          phone: account.phone ?? '',
          address: account.address ?? '',
          city: account.city ?? '',
          country: account.country ?? '',
          zipCode: account.zipCode ?? '',
        }}
      />
    </div>
  );
}

export function AccountDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}
