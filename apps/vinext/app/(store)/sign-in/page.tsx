import { Skeleton } from '@realworld/ui/skeleton';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInForm } from '../../../features/user/components/sign-in-form.tsx';

export const metadata: Metadata = { title: 'Sign in' };

type Props = { searchParams: Promise<{ redirectTo?: string | string[] }> };

export default function SignInPage({ searchParams }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
      <Suspense fallback={<Skeleton className="h-56 rounded-xl" />}>
        {searchParams.then(({ redirectTo }) => (
          <SignInForm redirectTo={typeof redirectTo === 'string' ? redirectTo : '/'} />
        ))}
      </Suspense>
    </div>
  );
}
