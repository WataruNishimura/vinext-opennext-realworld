'use client';

import { Link } from '@realworld/ui/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Returns to the previous page of this app. A plain link to `fallbackHref` without JavaScript, or
 * when there is no earlier in-app entry (the page was opened directly): the Navigation API's
 * `canGoBack` only counts same-origin entries, so Back never leaves the site.
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
  const router = useRouter();
  return (
    <Link
      href={fallbackHref}
      {...(className && { className })}
      onClick={event => {
        if (!('navigation' in window) || !window.navigation.canGoBack) return;
        event.preventDefault();
        router.back();
      }}
    >
      {children}
    </Link>
  );
}
