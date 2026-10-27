'use client';

import type { Account } from '@realworld/core';
import { updateProfile } from '@realworld/core/user/user-actions';
import { Button } from '@realworld/ui/button';
import { useActionState } from 'react';

type Field = {
  name: 'name' | 'firstName' | 'lastName' | 'phone' | 'address' | 'city' | 'country' | 'zipCode';
  label: string;
  autoComplete: string;
  type?: 'tel';
  inputMode?: 'numeric';
  required?: boolean;
};

const FIELDS: Field[] = [
  { name: 'name', label: 'Display name', autoComplete: 'nickname', required: true },
  { name: 'firstName', label: 'First name', autoComplete: 'given-name' },
  { name: 'lastName', label: 'Last name', autoComplete: 'family-name' },
  { name: 'phone', label: 'Phone', autoComplete: 'tel', type: 'tel' },
  { name: 'address', label: 'Street address', autoComplete: 'street-address' },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'country', label: 'Country', autoComplete: 'country-name' },
  { name: 'zipCode', label: 'Postal code', autoComplete: 'postal-code' },
];

export function ProfileForm({ account }: { account: Account }) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  const values = state && !state.ok ? state.values : null;
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-lg font-semibold">Profile</legend>
        {FIELDS.map(field => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label htmlFor={`profile-${field.name}`} className="text-sm font-medium">
              {field.label}
              {field.required ? <span aria-hidden> *</span> : null}
            </label>
            <input
              id={`profile-${field.name}`}
              name={field.name}
              type={field.type ?? 'text'}
              autoComplete={field.autoComplete}
              required={field.required}
              defaultValue={values?.[field.name] ?? account[field.name] ?? ''}
              className="border-line bg-surface-raised h-10 rounded-lg border px-3"
            />
          </div>
        ))}
      </fieldset>
      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {state?.ok ? 'Profile saved.' : <span className="text-danger">{state?.error}</span>}
      </p>
      <Button type="submit" aria-busy={isPending} className="self-start">
        {isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
