'use client';

import { removeFromCart, updateCartQuantity } from '@realworld/core/cart/cart-actions';
import { Button } from '@realworld/ui/button';
import { QuantityStepper } from '@realworld/ui/quantity-stepper';
import { useState, useTransition } from 'react';

export function CartLineActions({
  productId,
  name,
  quantity,
  max,
}: {
  productId: number;
  name: string;
  quantity: number;
  max: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, startRemoving] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <QuantityStepper
          label={name}
          quantity={quantity}
          max={max}
          action={async next => {
            const result = await updateCartQuantity(productId, next);
            setError(result.ok ? null : result.error);
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={isRemoving}
          aria-label={`Remove ${name} from cart`}
          onClick={() => {
            startRemoving(async () => {
              await removeFromCart(productId);
            });
          }}
        >
          Remove
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
