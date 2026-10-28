'use client';

import type { ReactNode } from 'react';
import { Link } from './link.tsx';

/**
 * Returns to the previous page of this app. A plain link to `fallbackHref` without JavaScript, or
 * when there is no earlier in-app entry (the page was opened directly): the Navigation API's
 * `canGoBack` only counts same-origin entries, so Back never leaves the site. Going back through
 * the History API lets the app router restore the previous route.
 */
export function BackLink({
  fallbackHref,
  className,
  children,
}: {
  fallbackHref: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={fallbackHref}
      {...(className && { className })}
      onClick={event => {
        if (!('navigation' in window) || !window.navigation.canGoBack) return;
        event.preventDefault();
        window.history.back();
      }}
    >
      {children}
    </Link>
  );
}
