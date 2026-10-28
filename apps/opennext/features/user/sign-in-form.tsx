'use client';

import { signIn, type SignInState } from '@realworld/core/user/user-actions';
import { Button } from '@realworld/ui/button';
import { Card } from '@realworld/ui/card';
import { useActionState } from 'react';

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, isPending] = useActionState<SignInState, FormData>(signIn, null);
  return (
    <Card className="mx-auto w-full max-w-sm">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            defaultValue={state?.email ?? 'jane.smith@example.com'}
            className="border-line bg-surface user-invalid:border-danger h-10 rounded-lg border px-3"
          />
        </label>
        {state ? (
          <p role="alert" className="text-danger text-sm">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="text-muted text-xs">
          Demo sign-in: any seeded email works without a password.
        </p>
      </form>
    </Card>
  );
}
