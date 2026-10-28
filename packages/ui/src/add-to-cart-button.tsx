'use client';

import type { ActionError } from '@realworld/core';
import { useActionState, useOptimistic } from 'react';
import { Button } from './button.tsx';
import { Skeleton } from './skeleton.tsx';

type State = { quantity: number; error: string | null };

/**
 * Action-prop add-to-cart: the parent passes the Server Function (`addToCart`). The quantity in
 * the cart goes up optimistically; a sold-out product that is not in the cart cannot be added.
 */
export function AddToCartButton({
  productId,
  quantity,
  soldOut,
  action,
}: {
  productId: number;
  /** Quantity already in the visitor's cart. */
  quantity: number;
  soldOut: boolean;
  action: (productId: number) => Promise<{ ok: true; quantity: number } | ActionError>;
}) {
  const [state, add, isPending] = useActionState<State>(
    async previous => {
      const result = await action(productId);
      return result.ok
        ? { quantity: result.quantity, error: null }
        : { quantity: previous.quantity, error: result.error };
    },
    { quantity, error: null },
  );
  const [optimisticQuantity, addOptimistic] = useOptimistic(
    Math.max(state.quantity, quantity),
    (current: number) => current + 1,
  );

  if (soldOut && optimisticQuantity === 0) {
    return (
      <Button variant="secondary" disabled>
        Sold out
      </Button>
    );
  }

  return (
    <form
      action={() => {
        addOptimistic(undefined);
        add();
      }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          Add to cart
        </Button>
        {optimisticQuantity > 0 ? (
          <span role="status" className="text-muted text-sm">
            {optimisticQuantity} in your cart
          </span>
        ) : null}
      </div>
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

export function AddToCartSkeleton() {
  return <Skeleton className="h-10 w-40" />;
}
