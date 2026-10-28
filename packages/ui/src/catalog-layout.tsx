import type { ReactNode } from 'react';
import { ProductGridSkeleton } from './product-card.tsx';
import { Skeleton } from './skeleton.tsx';

/** The catalog below its heading: category filters beside the search toolbar and the results. */
export function CatalogLayout({
  filters,
  toolbar,
  children,
}: {
  filters: ReactNode;
  toolbar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="lg:w-52 lg:shrink-0">{filters}</aside>
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {toolbar}
        {children}
      </div>
    </div>
  );
}

export function CatalogLayoutSkeleton() {
  return (
    <CatalogLayout
      filters={<Skeleton className="h-10 lg:h-80" />}
      toolbar={<Skeleton className="h-20" />}
    >
      <ProductGridSkeleton withSlot />
    </CatalogLayout>
  );
}
