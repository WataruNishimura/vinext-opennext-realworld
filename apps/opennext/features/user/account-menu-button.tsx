'use client';

import { signOut } from '@realworld/core/user/user-actions';
import { DropdownMenu } from '@realworld/ui/dropdown-menu';
import { useTransition } from 'react';

export function AccountMenuButton({ name }: { name: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenu
      label={isPending ? 'Signing out…' : name}
      items={[
        { label: 'Account', href: '/account' },
        { label: 'Saved products', href: '/saved' },
        {
          label: 'Sign out',
          onSelect: () => {
            startTransition(async () => {
              await signOut();
            });
          },
        },
      ]}
    />
  );
}
