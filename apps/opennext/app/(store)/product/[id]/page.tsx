import { AnimatedSuspense } from '@realworld/ui/animated-suspense';
import { BackLink } from '@realworld/ui/back-link';
import { ProductPageLayout } from '@realworld/ui/product-page-layout';
import { StockBadgeSkeleton } from '@realworld/ui/stock-badge';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AddToCart, AddToCartSkeleton } from '../../../../features/cart/add-to-cart.tsx';
import { FeatureProduct } from '../../../../features/product/feature-product.tsx';
import { LiveStock, LiveStockSkeleton } from '../../../../features/product/live-stock.tsx';
import {
  ProductDetails,
  ProductDetailsSkeleton,
} from '../../../../features/product/product-details.tsx';
import {
  ProductHeader,
  ProductHeaderSkeleton,
} from '../../../../features/product/product-header.tsx';
import { ProductStockBadge } from '../../../../features/product/product-stock-badge.tsx';
import { Reviews, ReviewsSkeleton } from '../../../../features/product/reviews.tsx';
import { SaveProduct, SaveProductSkeleton } from '../../../../features/user/save-product.tsx';

type Params = Promise<{ id: string }>;

export const metadata: Metadata = { title: 'Product' };
export const instant = true;

export default function ProductPage({ params }: { params: Params }) {
  const productId = params.then(({ id }) => Number(id));
  return (
    <ProductPageLayout
      back={
        <BackLink fallbackHref="/all" className="text-muted hover:text-ink text-sm">
          ← Back
        </BackLink>
      }
      header={
        <AnimatedSuspense fallback={<ProductHeaderSkeleton />}>
          {productId.then(id => (
            <ProductHeader productId={id} />
          ))}
        </AnimatedSuspense>
      }
      stock={
        <>
          <Suspense fallback={<StockBadgeSkeleton />}>
            {productId.then(id => (
              <ProductStockBadge productId={id} />
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
          <Suspense fallback={null}>
            {productId.then(id => (
              <FeatureProduct productId={id} />
            ))}
          </Suspense>
        </>
      }
      details={
        <AnimatedSuspense fallback={<ProductDetailsSkeleton />}>
          {productId.then(id => (
            <ProductDetails productId={id} />
          ))}
        </AnimatedSuspense>
      }
      reviews={
        <AnimatedSuspense fallback={<ReviewsSkeleton />}>
          {productId.then(id => (
            <Reviews productId={id} />
          ))}
        </AnimatedSuspense>
      }
    />
  );
}
