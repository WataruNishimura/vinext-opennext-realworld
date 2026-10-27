import { Card } from '@realworld/ui/card';
import { Link } from '@realworld/ui/link';
import { StockBadgeSkeleton } from '@realworld/ui/stock-badge';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AddToCart, AddToCartSkeleton } from '../../../../features/cart/components/add-to-cart.tsx';
import {
  LiveStock,
  LiveStockSkeleton,
} from '../../../../features/product/components/live-stock.tsx';
import {
  ProductDetails,
  ProductDetailsSkeleton,
} from '../../../../features/product/components/product-details.tsx';
import {
  ProductOverview,
  ProductOverviewSkeleton,
} from '../../../../features/product/components/product-overview.tsx';
import { Reviews, ReviewsSkeleton } from '../../../../features/product/components/reviews.tsx';
import { StockStatus } from '../../../../features/product/components/stock-status.tsx';
import {
  SaveProduct,
  SaveProductSkeleton,
} from '../../../../features/user/components/save-product.tsx';
import { parseProductId } from '../../../../lib/routing.ts';

// The boundaries are plain Suspense: on vinext a ViewTransition around streamed content (the shared
// AnimatedSuspense) fails SSR with "Element type is invalid" (see README).
// Next.js: assert everything above the per-request stock is in the link prefetch, and validate
// that navigations here are instant. vinext ignores both exports (see README).
export const ensureStatic = 'prefetch';
export const instant = true;

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
}

type Props = { params: Promise<{ id: string }> };

async function productIdFrom(params: Props['params']): Promise<number> {
  const id = parseProductId((await params).id);
  if (id === null) notFound();
  return id;
}

export default function ProductPage({ params }: Props) {
  const productId = productIdFrom(params);
  return (
    <div className="flex flex-col gap-8">
      <Link href="/all" className="text-muted text-sm hover:underline">
        ← Back
      </Link>
      <Card className="flex flex-col gap-6 p-6">
        <Suspense fallback={<ProductOverviewSkeleton />}>
          {productId.then(id => (
            <>
              <ProductOverview productId={id} />
              <div className="flex flex-wrap items-center gap-4">
                <Suspense fallback={<StockBadgeSkeleton />}>
                  <StockStatus productId={id} />
                </Suspense>
                <Suspense fallback={<LiveStockSkeleton />}>
                  <LiveStock productId={id} />
                </Suspense>
              </div>
              <div className="flex flex-wrap items-start gap-4">
                <Suspense fallback={<AddToCartSkeleton />}>
                  <AddToCart productId={id} />
                </Suspense>
                <Suspense fallback={<SaveProductSkeleton />}>
                  <SaveProduct productId={id} />
                </Suspense>
              </div>
              <Suspense fallback={<ProductDetailsSkeleton />}>
                <ProductDetails productId={id} />
              </Suspense>
            </>
          ))}
        </Suspense>
      </Card>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Customer reviews</h2>
        <Suspense fallback={<ReviewsSkeleton />}>
          {productId.then(id => (
            <Reviews productId={id} />
          ))}
        </Suspense>
      </section>
    </div>
  );
}
