import { MarketingShell } from '@realworld/ui/store-shell';
import type { ReactNode } from 'react';

/** Marketing pages read no session: a static header with plain account and cart links. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <MarketingShell runtime="vinext">{children}</MarketingShell>;
}
