import type { ComponentProps } from 'react';
import { cn } from './cn.ts';

/** Stable chrome around a section. Keep it outside `<Suspense>` so only the body swaps. */
export function Card({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={cn('border-line bg-surface-raised rounded-2xl border p-5', className)}
      {...props}
    />
  );
}
