'use client';

import { addToCart, removeFromCart } from '@realworld/core/cart/cart-actions';
import { Button } from '@realworld/ui/button';
import { useOptimistic, useState, useTransition } from 'react';

export function AddToCartButton({
  productId,
  inCart,
  soldOut,
}: {
  productId: number;
  inCart: boolean;
  soldOut: boolean;
}) {
  const [optimisticInCart, setOptimisticInCart] = useOptimistic(inCart);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    startTransition(async () => {
      setError(null);
      setOptimisticInCart(!optimisticInCart);
      const result = optimisticInCart
        ? await removeFromCart(productId)
        : await addToCart(productId);
      if (!result.ok) setError(result.error);
    });
  }

  if (soldOut && !optimisticInCart) {
    return (
      <Button disabled variant="secondary">
        Sold out
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={optimisticInCart ? 'secondary' : 'primary'}
        aria-busy={isPending}
        onClick={toggle}
      >
        {optimisticInCart ? 'Remove from cart' : 'Add to cart'}
      </Button>
      <p role="status" aria-live="polite" className="text-danger min-h-5 text-sm">
        {error}
      </p>
    </div>
  );
}
