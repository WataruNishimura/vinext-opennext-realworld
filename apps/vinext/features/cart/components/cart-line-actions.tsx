'use client';

import { MAX_CART_QUANTITY } from '@realworld/core';
import { removeFromCart, updateCartQuantity } from '@realworld/core/cart/cart-actions';
import { Button } from '@realworld/ui/button';
import { QuantityStepper } from '@realworld/ui/quantity-stepper';
import { useState, useTransition } from 'react';

export function CartLineActions({
  productId,
  name,
  quantity,
}: {
  productId: number;
  name: string;
  quantity: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, startRemove] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <QuantityStepper
          label={name}
          quantity={quantity}
          max={MAX_CART_QUANTITY}
          action={async next => {
            const result = await updateCartQuantity(productId, next);
            setError(result.ok ? null : result.error);
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Remove ${name} from cart`}
          aria-busy={isRemoving}
          onClick={() => {
            startRemove(async () => {
              const result = await removeFromCart(productId);
              if (!result.ok) setError(result.error);
            });
          }}
        >
          Remove
        </Button>
      </div>
      <p role="status" aria-live="polite" className="text-danger text-sm">
        {error}
      </p>
    </div>
  );
}
