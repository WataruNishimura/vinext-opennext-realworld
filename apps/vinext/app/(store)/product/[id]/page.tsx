import { BackLink } from '@realworld/ui/back-link';
import { ProductPageLayout } from '@realworld/ui/product-page-layout';
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
  ProductHeader,
  ProductHeaderSkeleton,
} from '../../../../features/product/components/product-header.tsx';
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
    <ProductPageLayout
      back={
        <BackLink fallbackHref="/all" className="text-muted hover:text-ink text-sm">
          ← Back
        </BackLink>
      }
      header={
        <Suspense fallback={<ProductHeaderSkeleton />}>
          {productId.then(id => (
            <ProductHeader productId={id} />
          ))}
        </Suspense>
      }
      stock={
        <>
          <Suspense fallback={<StockBadgeSkeleton />}>
            {productId.then(id => (
              <StockStatus productId={id} />
            ))}
          </Suspense>
          <Suspense fallback={<LiveStockSkeleton />}>
            {productId.then(id => (
              <LiveStock productId={id} />
            ))}
          </Suspense>
        </>
      }
      actions={
        <>
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
        </>
      }
      details={
        <Suspense fallback={<ProductDetailsSkeleton />}>
          {productId.then(id => (
            <ProductDetails productId={id} />
          ))}
        </Suspense>
      }
      reviews={
        <Suspense fallback={<ReviewsSkeleton />}>
          {productId.then(id => (
            <Reviews productId={id} />
          ))}
        </Suspense>
      }
    />
  );
}
