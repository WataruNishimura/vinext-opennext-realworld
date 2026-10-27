import type { z } from 'zod';
import type { ActionError } from './action-result.ts';

/** Validate Server Function input, returning the first issue as an action error. */
export function parseInput<T>(
  schema: z.ZodType<T>,
  value: unknown,
): { ok: true; data: T } | ActionError {
  const result = schema.safeParse(value);
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, error: result.error.issues[0]?.message ?? 'Invalid input.' };
}
