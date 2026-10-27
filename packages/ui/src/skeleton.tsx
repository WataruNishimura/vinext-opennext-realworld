import type { ComponentProps } from 'react';
import { cn } from './cn.ts';

/** A placeholder block. Size it to match the content it stands in for. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      className={cn('bg-line animate-pulse rounded-md motion-reduce:animate-none', className)}
      {...props}
    />
  );
}
