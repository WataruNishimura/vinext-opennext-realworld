'use server';

import { z } from 'zod';
import type { ActionError } from '../action-result.ts';
import { getDb } from '../database.ts';
import { cookies, redirect, updateTag } from '../framework/next.ts';
import { findProductsByIds } from '../product/product-data.ts';
import { parseInput } from '../validation.ts';
import { userTags } from './user-cache.ts';
import { findAccountByEmail, toggleSavedProduct, updateAccountProfile } from './user-data.ts';
import { verifyAccount } from './user-queries.ts';
import { ACCOUNT_COOKIE, sessionCookieOptions } from './user-session.ts';

export type SignInState = (ActionError & { email: string }) | null;

const signInSchema = z.object({
  email: z.email({ error: 'Enter a valid email address.' }).max(254),
});

/** Only same-origin paths: `/cart` is fine, `//evil.example` and `https://…` are not. */
function safeRedirectPath(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.includes('\\')) return '/';
  return value;
}

/** Demo sign-in by email (no password). Use with `useActionState`. */
export async function signIn(_state: SignInState, formData: FormData): Promise<SignInState> {
  const rawEmail = formData.get('email');
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
  const input = parseInput(signInSchema, { email });
  if (!input.ok) return { ...input, email };

  const account = await findAccountByEmail(await getDb(), input.data.email);
  if (!account) return { ok: false, error: 'No account found for that email.', email };

  (await cookies()).set(ACCOUNT_COOKIE, account.id, sessionCookieOptions());
  updateTag(userTags.session);
  redirect(safeRedirectPath(formData.get('redirectTo')));
}

export async function signOut(): Promise<{ ok: true }> {
  (await cookies()).delete(ACCOUNT_COOKIE);
  updateTag(userTags.session);
  return { ok: true };
}

const productIdSchema = z.int().positive({ error: 'Invalid product.' });

export async function toggleSaveProduct(
  productId: number,
): Promise<{ ok: true; saved: boolean } | ActionError> {
  const account = await verifyAccount();
  if (!account) return { ok: false, error: 'Sign in to save products.' };
  const id = parseInput(productIdSchema, productId);
  if (!id.ok) return id;

  const db = await getDb();
  if ((await findProductsByIds(db, [id.data])).length === 0) {
    return { ok: false, error: 'Product not found.' };
  }

  const { saved } = await toggleSavedProduct(db, account.id, id.data, new Date());
  // Saved products, the saved flag and recommendations all hang off this one tag.
  updateTag(userTags.saved(account.id));
  return { ok: true, saved };
}

const optionalText = z
  .string()
  .trim()
  .max(120)
  .transform(value => (value === '' ? null : value));

const profileSchema = z.object({
  name: z.string().trim().min(1, { error: 'Enter your name.' }).max(80),
  firstName: optionalText.optional(),
  lastName: optionalText.optional(),
  phone: optionalText.optional(),
  address: optionalText.optional(),
  city: optionalText.optional(),
  country: optionalText.optional(),
  zipCode: optionalText.optional(),
});

const PROFILE_FIELDS = [
  'name',
  'firstName',
  'lastName',
  'phone',
  'address',
  'city',
  'country',
  'zipCode',
] as const;

export type ProfileState =
  | { ok: true }
  | (ActionError & { values: Partial<Record<(typeof PROFILE_FIELDS)[number], string>> })
  | null;

/** Update the signed-in account's profile. Use with `useActionState`. */
export async function updateProfile(
  _state: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const values: Partial<Record<(typeof PROFILE_FIELDS)[number], string>> = {};
  for (const field of PROFILE_FIELDS) {
    const value = formData.get(field);
    if (typeof value === 'string') values[field] = value;
  }

  const account = await verifyAccount();
  if (!account) return { ok: false, error: 'Sign in to update your profile.', values };
  const input = parseInput(profileSchema, values);
  if (!input.ok) return { ...input, values };

  const profile = Object.fromEntries(
    Object.entries(input.data).filter(([, value]) => value !== undefined),
  );
  await updateAccountProfile(await getDb(), account.id, profile, new Date());
  updateTag(userTags.account(account.id));
  return { ok: true };
}
