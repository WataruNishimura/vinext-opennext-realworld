'use client';

import { addToCart } from '@realworld/core/cart/cart-actions';
import { Button } from '@realworld/ui/button';
import { useActionState, useOptimistic } from 'react';

type State = { quantity: number; error: string | null };

export function AddToCartButton({ productId, quantity }: { productId: number; quantity: number }) {
  const [state, add, isPending] = useActionState<State>(
    async previous => {
      const result = await addToCart(productId);
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
