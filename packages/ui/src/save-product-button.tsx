'use client';

import type { ActionError } from '@realworld/core';
import { useOptimistic, useState, useTransition } from 'react';
import { Button, type ButtonVariant } from './button.tsx';

/**
 * Action-prop save toggle: the parent passes the Server Function (`toggleSaveProduct`), and the
 * pressed state flips optimistically while it runs.
 */
export function SaveProductButton({
  productId,
  saved,
  action,
  label,
  variant = 'secondary',
}: {
  productId: number;
  saved: boolean;
  action: (productId: number) => Promise<{ ok: true; saved: boolean } | ActionError>;
  /** Product name, for buttons rendered in a list. */
  label?: string;
  variant?: ButtonVariant;
}) {
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={variant}
        aria-pressed={optimisticSaved}
        aria-busy={isPending}
        disabled={isPending}
        {...(label && { 'aria-label': `Save ${label}` })}
        onClick={() => {
          startTransition(async () => {
            setOptimisticSaved(!optimisticSaved);
            const result = await action(productId);
            setError(result.ok ? null : result.error);
          });
        }}
      >
        {optimisticSaved ? 'Saved' : 'Save'}
      </Button>
      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
