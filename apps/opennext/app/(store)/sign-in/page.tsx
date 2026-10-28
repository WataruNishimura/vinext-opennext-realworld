import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInForm } from '../../../features/user/sign-in-form.tsx';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[] }>;
}) {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted mt-2">Sign in to save products and keep your cart.</p>
      </div>
      <Suspense
        fallback={
          <div
            aria-hidden
            className="bg-line mx-auto h-64 w-full max-w-sm animate-pulse rounded-2xl"
          />
        }
      >
        {searchParams.then(({ redirectTo }) => (
          <SignInForm redirectTo={typeof redirectTo === 'string' ? redirectTo : '/'} />
        ))}
      </Suspense>
    </div>
  );
}
