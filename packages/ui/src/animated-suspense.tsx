import { Suspense, ViewTransition, type ReactNode } from 'react';

/**
 * `<Suspense>` whose fallback fades out and whose content slides in when it streams. Pages own
 * the boundary (features never wrap themselves), so pages use this in place of `<Suspense>`.
 */
export function AnimatedSuspense({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<ViewTransition exit="slide-down">{fallback}</ViewTransition>}>
      <ViewTransition enter="slide-up" default="none">
        {children}
      </ViewTransition>
    </Suspense>
  );
}
