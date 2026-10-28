import { MarketingShell } from '@realworld/ui/store-shell';
import type { ReactNode } from 'react';

/** Marketing pages are fully static: no session reads anywhere in the route. */
export const ensureStatic = 'navigation';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <MarketingShell runtime="OpenNext">{children}</MarketingShell>;
}
