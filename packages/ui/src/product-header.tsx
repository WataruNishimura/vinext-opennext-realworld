import type { Product, ReviewSummary } from '@realworld/core';
import { ViewTransition } from 'react';
import { Price } from './price.tsx';
import { ProductImage } from './product-image.tsx';
import { Skeleton } from './skeleton.tsx';
import { StarRating } from './star-rating.tsx';

/** The product page header. The image shares its view-transition name with the product card. */
export function ProductHeader({ product, summary }: { product: Product; summary: ReviewSummary }) {
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
