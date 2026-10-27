'use client';

import { Menu, MenuButton, MenuItem, MenuProvider } from '@ariakit/react';
import type { ReactNode } from 'react';
import { buttonClasses } from './button.tsx';
import { Link } from './link.tsx';

export type DropdownMenuItem =
  { label: string; href: string } | { label: string; onSelect: () => void };

/**
 * A menu button (e.g. the account menu). Ariakit supplies the WAI-ARIA menu pattern: arrow-key
 * roving focus, typeahead and focus return, which a plain popover does not.
 */
export function DropdownMenu({ label, items }: { label: ReactNode; items: DropdownMenuItem[] }) {
  return (
    <MenuProvider>
      <MenuButton className={buttonClasses({ variant: 'ghost', size: 'sm' })}>{label}</MenuButton>
      <Menu
        gutter={6}
        className="border-line bg-surface-raised z-50 min-w-44 rounded-xl border p-1 shadow-lg"
      >
        {items.map(item =>
          'href' in item ? (
            <MenuItem
              key={item.label}
              className="data-active-item:bg-line/60 block rounded-lg px-3 py-2 text-sm"
              render={<Link href={item.href} />}
            >
              {item.label}
            </MenuItem>
          ) : (
            <MenuItem
              key={item.label}
              className="data-active-item:bg-line/60 block w-full rounded-lg px-3 py-2 text-left text-sm"
              onClick={item.onSelect}
            >
              {item.label}
            </MenuItem>
          ),
        )}
      </Menu>
    </MenuProvider>
  );
}
