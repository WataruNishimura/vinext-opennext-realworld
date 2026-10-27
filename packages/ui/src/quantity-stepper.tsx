'use client';

import { useOptimistic, useTransition } from 'react';
import { cn } from './cn.ts';

/**
 * Action-prop stepper: the parent passes the Server Function call as `action`, and the stepper
 * shows the new quantity optimistically while the transition runs.
 */
export function QuantityStepper({
  label,
  quantity,
  min = 1,
  max,
  action,
  className,
}: {
  /** Product name, used in the buttons' accessible names. */
  label: string;
  quantity: number;
  min?: number;
  max: number;
  action: (quantity: number) => Promise<void>;
  className?: string;
}) {
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(quantity);
  const [isPending, startTransition] = useTransition();

  function change(next: number) {
    startTransition(async () => {
      setOptimisticQuantity(next);
      await action(next);
    });
  }

  const buttonClasses =
    'grid size-8 place-items-center rounded-md text-lg hover:bg-line/50 disabled:opacity-40 disabled:hover:bg-transparent';

  return (
    <div
      className={cn(
        'border-line inline-flex items-center gap-1 rounded-lg border p-0.5',
        className,
      )}
      aria-busy={isPending}
    >
      <button
        type="button"
        className={buttonClasses}
        aria-label={`Decrease quantity of ${label}`}
        disabled={optimisticQuantity <= min}
        onClick={() => {
          change(optimisticQuantity - 1);
        }}
      >
        −
      </button>
      <span role="status" className="min-w-6 text-center text-sm tabular-nums">
        {optimisticQuantity}
      </span>
      <button
        type="button"
        className={buttonClasses}
        aria-label={`Increase quantity of ${label}`}
        disabled={optimisticQuantity >= max}
        onClick={() => {
          change(optimisticQuantity + 1);
        }}
      >
        +
      </button>
    </div>
  );
}
