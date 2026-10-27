import { getProduct, getReviewSummary } from '@realworld/core/product/product-queries';
import { Price } from '@realworld/ui/price';
import { ProductImage } from '@realworld/ui/product-image';
import { Skeleton } from '@realworld/ui/skeleton';
import { StarRating } from '@realworld/ui/star-rating';
import { ViewTransition } from 'react';

/** Product header: cached per product, so a `<Link prefetch>` carries it. */
export async function ProductOverview({ productId }: { productId: number }) {
  const [product, summary] = await Promise.all([
    getProduct(productId),
    getReviewSummary(productId),
  ]);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ViewTransition name={`product-image-${product.id}`} share="product-card">
        <ProductImage productId={product.id} name={product.name} />
      </ViewTransition>
      <div className="flex flex-col gap-3">
        <p className="text-muted text-sm">
          {product.brand} · {product.category.name}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <StarRating rating={summary.average} count={summary.count} />
        <Price cents={product.priceCents} className="text-2xl" />
        <p className="text-muted">{product.description}</p>
      </div>
    </div>
  );
}

export function ProductOverviewSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
