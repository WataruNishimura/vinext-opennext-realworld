import { requireAccount } from '@realworld/core/user/user-queries';
import { Skeleton } from '@realworld/ui/skeleton';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfileForm } from '../../../features/user/components/profile-form.tsx';

export const metadata: Metadata = { title: 'Account' };

async function Account() {
  const account = await requireAccount('/account');
  return (
    <>
      <p className="text-muted">Signed in as {account.email}</p>
      <ProfileForm account={account} />
    </>
  );
}

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Account</h1>
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        <Account />
      </Suspense>
    </div>
  );
}
