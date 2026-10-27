import { formatPrice } from '@realworld/core';
import { cn } from './cn.ts';

export function Price({ cents, className }: { cents: number; className?: string }) {
  return <span className={cn('font-semibold tabular-nums', className)}>{formatPrice(cents)}</span>;
}
