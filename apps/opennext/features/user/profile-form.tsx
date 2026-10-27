'use client';

import { updateProfile, type ProfileState } from '@realworld/core/user/user-actions';
import { Button } from '@realworld/ui/button';
import { Card } from '@realworld/ui/card';
import { useActionState } from 'react';

const FIELDS = [
  { name: 'name', label: 'Display name', autoComplete: 'nickname', required: true },
  { name: 'firstName', label: 'First name', autoComplete: 'given-name' },
  { name: 'lastName', label: 'Last name', autoComplete: 'family-name' },
  { name: 'phone', label: 'Phone', autoComplete: 'tel', type: 'tel' },
  { name: 'address', label: 'Address', autoComplete: 'street-address' },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'country', label: 'Country', autoComplete: 'country-name' },
  { name: 'zipCode', label: 'ZIP code', autoComplete: 'postal-code' },
] as const;

type FieldName = (typeof FIELDS)[number]['name'];

export function ProfileForm({ values }: { values: Record<FieldName, string> }) {
  const [state, action, isPending] = useActionState<ProfileState, FormData>(updateProfile, null);
  const current = state && !state.ok ? { ...values, ...state.values } : values;

  return (
    <Card>
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(field => (
          <label key={field.name} className="flex flex-col gap-1 text-sm">
            <span className="text-muted">{field.label}</span>
            <input
              name={field.name}
              type={'type' in field ? field.type : 'text'}
              defaultValue={current[field.name]}
              autoComplete={field.autoComplete}
              required={'required' in field}
              className="border-line bg-surface user-invalid:border-danger h-10 rounded-lg border px-3"
            />
          </label>
        ))}
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save profile'}
          </Button>
          <p role="status" className="text-sm">
            {state?.ok ? 'Profile saved.' : null}
            {state && !state.ok ? <span className="text-danger">{state.error}</span> : null}
          </p>
        </div>
      </form>
    </Card>
  );
}
