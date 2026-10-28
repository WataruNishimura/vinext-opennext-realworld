import { AnimatedSuspense } from '@realworld/ui/animated-suspense';
import { Card } from '@realworld/ui/card';
import { Link } from '@realworld/ui/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AddToCart, AddToCartSkeleton } from '../../../../features/cart/add-to-cart.tsx';
import { FeatureProduct } from '../../../../features/product/feature-product.tsx';
import { LiveStock, LiveStockSkeleton } from '../../../../features/product/live-stock.tsx';
import {
  ProductHeader,
  ProductHeaderSkeleton,
} from '../../../../features/product/product-header.tsx';
import { Reviews, ReviewsSkeleton } from '../../../../features/product/reviews.tsx';
import { SaveProduct, SaveProductSkeleton } from '../../../../features/user/save-product.tsx';

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: 'Product' };
export const instant = true;

export default function ProductPage({ params }: { params: Params }) {
  const productId = params.then(({ id }) => Number(id));
  return (
    <>
      <Link href="/all" prefetch className="text-muted hover:text-ink text-sm">
        ← All products
      </Link>
      <Card className="flex flex-col gap-6">
        <AnimatedSuspense fallback={<ProductHeaderSkeleton />}>
          {productId.then(id => (
            <ProductHeader productId={id} />
          ))}
        </AnimatedSuspense>
        <div className="flex flex-wrap items-start gap-4">
          <Suspense fallback={<LiveStockSkeleton />}>
            {productId.then(id => (
              <LiveStock productId={id} />
            ))}
          </Suspense>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <Suspense fallback={<AddToCartSkeleton />}>
            {productId.then(id => (
              <AddToCart productId={id} />
            ))}
          </Suspense>
          <Suspense fallback={<SaveProductSkeleton />}>
            {productId.then(id => (
              <SaveProduct productId={id} />
            ))}
          </Suspense>
          <Suspense fallback={null}>
            {productId.then(id => (
              <FeatureProduct productId={id} />
            ))}
          </Suspense>
        </div>
      </Card>
      <section aria-labelledby="reviews" className="flex flex-col gap-4">
        <h2 id="reviews" className="text-xl font-semibold">
          Customer reviews
        </h2>
        <AnimatedSuspense fallback={<ReviewsSkeleton />}>
          {productId.then(id => (
            <Reviews productId={id} />
          ))}
        </AnimatedSuspense>
      </section>
    </>
  );
}
