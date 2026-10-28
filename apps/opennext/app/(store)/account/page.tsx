import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountDetails, AccountDetailsSkeleton } from '../../../features/user/account-details.tsx';

export const metadata: Metadata = { title: 'Account' };
export const instant = true;

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Your account</h1>
      <Suspense fallback={<AccountDetailsSkeleton />}>
        <AccountDetails />
      </Suspense>
    </div>
  );
}
