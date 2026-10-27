'use server';

import { z } from 'zod';
import type { ActionError } from '../action-result.ts';
import { getDb } from '../database.ts';
import { updateTag } from '../framework/next.ts';
import { verifyAccount } from '../user/user-queries.ts';
import { parseInput } from '../validation.ts';
import { productTags } from './product-cache.ts';
import { setProductFeatured } from './product-data.ts';

const featureSchema = z.object({
  productId: z.int().positive({ error: 'Invalid product.' }),
  featured: z.boolean(),
});

/** Feature or unfeature a product on the home page (any signed-in demo account may curate). */
export async function setFeaturedProduct(
  productId: number,
  featured: boolean,
): Promise<{ ok: true; featured: boolean } | ActionError> {
  if (!(await verifyAccount())) {
    return { ok: false, error: 'Sign in to change featured products.' };
  }
  const input = parseInput(featureSchema, { productId, featured });
  if (!input.ok) return input;

  const found = await setProductFeatured(
    await getDb(),
    input.data.productId,
    input.data.featured,
    new Date(),
  );
  if (!found) return { ok: false, error: 'Product not found.' };

  // The featured selection and this product's header change; catalog pages do not.
  updateTag(productTags.featured);
  updateTag(productTags.detail(input.data.productId));
  return { ok: true, featured: input.data.featured };
}
