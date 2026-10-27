'use client';

import { toggleSaveProduct } from '@realworld/core/user/user-actions';
import { Button, type ButtonVariant } from '@realworld/ui/button';
import { useOptimistic, useState, useTransition } from 'react';

export function SaveProductButton({
  productId,
  saved,
  variant = 'secondary',
}: {
  productId: number;
  saved: boolean;
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
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            setOptimisticSaved(!optimisticSaved);
            const result = await toggleSaveProduct(productId);
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
