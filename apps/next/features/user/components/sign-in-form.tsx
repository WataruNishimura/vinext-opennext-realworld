'use client';

import { signIn } from '@realworld/core/user/user-actions';
import { Button } from '@realworld/ui/button';
import { useActionState } from 'react';

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(signIn, null);
  return (
    <form action={formAction} className="flex flex-col gap-4" aria-describedby="sign-in-hint">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          required
          defaultValue={state?.email ?? ''}
          aria-invalid={state ? true : undefined}
          aria-describedby={state ? 'sign-in-error' : undefined}
          className="border-line bg-surface-raised h-10 rounded-lg border px-3"
        />
      </div>
      <p id="sign-in-hint" className="text-muted text-sm">
        Demo accounts sign in without a password, for example jane.smith@example.com.
      </p>
      <p id="sign-in-error" role="alert" className="text-danger min-h-5 text-sm">
        {state?.error}
      </p>
      <Button type="submit" aria-busy={isPending}>
        {isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
