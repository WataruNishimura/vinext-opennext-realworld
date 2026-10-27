import type { Product } from '@realworld/core';
import { ViewTransition, type ReactNode } from 'react';
import { cn } from './cn.ts';
import { Link } from './link.tsx';
import { Price } from './price.tsx';
import { ProductImage } from './product-image.tsx';
import { Skeleton } from './skeleton.tsx';

/**
 * A product in a grid. The image carries a per-product view-transition name, so it morphs into
 * the product page's image on navigation. `children` is a slot for badges or actions, such as a
 * stock badge inside its own `<Suspense>`.
 */
export function ProductCard({
  product,
  href,
  prefetch,
  children,
}: {
  product: Product;
  href: string;
  prefetch?: boolean;
  children?: ReactNode;
}) {
  return (
    <article className="group relative flex flex-col gap-3">
      <ViewTransition name={`product-image-${product.id}`} share="product-card">
        <ProductImage productId={product.id} name={product.name} />
      </ViewTransition>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted text-xs">{product.category.name}</p>
          <h3 className="truncate font-medium">
            <Link
              href={href}
              {...(prefetch !== undefined && { prefetch })}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </h3>
        </div>
        <Price cents={product.priceCents} />
      </div>
      {children ? <div className="relative flex items-center gap-2">{children}</div> : null}
    </article>
  );
}

export function ProductGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3', className)}>
      {children}
    </div>
  );
}

export function ProductCardSkeleton({ withSlot = false }: { withSlot?: boolean }) {
  return (
    <div data-skeleton="product-card" className="flex flex-col gap-3">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-6 w-14" />
      </div>
      {withSlot ? <Skeleton className="h-6 w-20 rounded-full" /> : null}
    </div>
  );
}

export function ProductGridSkeleton({
  count = 9,
  withSlot = false,
  className,
}: {
  count?: number;
  withSlot?: boolean;
  className?: string;
}) {
  return (
    <ProductGrid {...(className && { className })}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} withSlot={withSlot} />
      ))}
    </ProductGrid>
  );
}
