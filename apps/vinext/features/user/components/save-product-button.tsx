'use client';

import { toggleSaveProduct } from '@realworld/core/user/user-actions';
import { Button } from '@realworld/ui/button';
import { useOptimistic, useState, useTransition } from 'react';

export function SaveProductButton({
  productId,
  saved,
  label,
}: {
  productId: number;
  saved: boolean;
  /** Product name, for buttons rendered in a list. */
  label?: string;
}) {
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="secondary"
        aria-pressed={optimisticSaved}
        aria-busy={isPending}
        {...(label && { 'aria-label': `Save ${label}` })}
        onClick={() => {
          startTransition(async () => {
            setError(null);
            setOptimisticSaved(!optimisticSaved);
            const result = await toggleSaveProduct(productId);
            if (!result.ok) setError(result.error);
          });
        }}
      >
        {optimisticSaved ? '♥ Saved' : '♡ Save'}
      </Button>
      <p role="status" aria-live="polite" className="text-danger text-sm">
        {error}
      </p>
    </div>
  );
}
