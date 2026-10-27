'use client';

import { signOut } from '@realworld/core/user/user-actions';
import { DropdownMenu } from '@realworld/ui/dropdown-menu';
import { useTransition } from 'react';

export function AccountMenu({ name }: { name: string }) {
  const [, startTransition] = useTransition();
  return (
    <DropdownMenu
      label={name}
      items={[
        { label: 'Account', href: '/account' },
        { label: 'Saved products', href: '/saved' },
        {
          label: 'Sign out',
          onSelect: () => {
            // The Server Function's response re-renders the current route signed out. Do not
            // router.push() the current URL here: on vinext that replays the stale cached route.
            startTransition(async () => {
              await signOut();
            });
          },
        },
      ]}
    />
  );
}
