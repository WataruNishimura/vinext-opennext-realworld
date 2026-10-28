import { AnimatedSuspense } from '@realworld/ui/animated-suspense';
import { Card } from '@realworld/ui/card';
import { StockBadgeSkeleton } from '@realworld/ui/stock-badge';
import { notFound } from 'next/navigation';
import { BackLink } from '../../../../features/layout/components/back-link.tsx';
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

// Assert everything above the per-request stock is in the link prefetch, and validate that
// navigations here are instant.
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
      <BackLink fallbackHref="/all" className="text-muted self-start text-sm hover:underline">
        ← Back
      </BackLink>
      <Card className="flex flex-col gap-6 p-6">
        <AnimatedSuspense fallback={<ProductOverviewSkeleton />}>
          {productId.then(id => (
            <>
              <ProductOverview productId={id} />
              <div className="flex flex-wrap items-center gap-4">
                <AnimatedSuspense fallback={<StockBadgeSkeleton />}>
                  <StockStatus productId={id} />
                </AnimatedSuspense>
                <AnimatedSuspense fallback={<LiveStockSkeleton />}>
                  <LiveStock productId={id} />
                </AnimatedSuspense>
              </div>
              <div className="flex flex-wrap items-start gap-4">
                <AnimatedSuspense fallback={<AddToCartSkeleton />}>
                  <AddToCart productId={id} />
                </AnimatedSuspense>
                <AnimatedSuspense fallback={<SaveProductSkeleton />}>
                  <SaveProduct productId={id} />
                </AnimatedSuspense>
              </div>
              <AnimatedSuspense fallback={<ProductDetailsSkeleton />}>
                <ProductDetails productId={id} />
              </AnimatedSuspense>
            </>
          ))}
        </AnimatedSuspense>
      </Card>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Customer reviews</h2>
        <AnimatedSuspense fallback={<ReviewsSkeleton />}>
          {productId.then(id => (
            <Reviews productId={id} />
          ))}
        </AnimatedSuspense>
      </section>
    </div>
  );
}
