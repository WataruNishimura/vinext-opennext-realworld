import { getProduct, getReviewSummary } from '@realworld/core/product/product-queries';
import { Price } from '@realworld/ui/price';
import { ProductImage } from '@realworld/ui/product-image';
import { Skeleton } from '@realworld/ui/skeleton';
import { StarRating } from '@realworld/ui/star-rating';
import { ViewTransition } from 'react';

/** `'use cache'` per product (`product:<id>`, `reviews:<id>`): resolved by a per-link prefetch. */
export async function ProductHeader({ productId }: { productId: number }) {
  const [product, summary] = await Promise.all([
    getProduct(productId),
    getReviewSummary(productId),
  ]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ViewTransition name={`product-image-${product.id}`} share="product-card">
        <ProductImage productId={product.id} name={product.name} />
      </ViewTransition>
      <div className="flex flex-col gap-4">
        <p className="text-muted text-sm">
          {product.category.name} · {product.brand}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <div className="flex items-center gap-2 text-sm">
          <StarRating rating={summary.average} count={summary.count} />
          <span className="text-muted">
            {summary.count === 0
              ? 'No reviews yet'
              : `${summary.average.toFixed(1)} (${summary.count})`}
          </span>
        </div>
        <Price cents={product.priceCents} className="text-2xl" />
        <p className="text-muted leading-relaxed">{product.description}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted">SKU</dt>
          <dd>{product.sku}</dd>
          {product.materials ? (
            <>
              <dt className="text-muted">Materials</dt>
              <dd>{product.materials}</dd>
            </>
          ) : null}
          {product.origin ? (
            <>
              <dt className="text-muted">Origin</dt>
              <dd>{product.origin}</dd>
            </>
          ) : null}
          {product.warranty ? (
            <>
              <dt className="text-muted">Warranty</dt>
              <dd>{product.warranty}</dd>
            </>
          ) : null}
        </dl>
      </div>
    </div>
  );
}

export function ProductHeaderSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
