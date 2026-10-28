import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  Recommendations,
  RecommendationsSkeleton,
} from '../../../features/user/recommendations.tsx';
import { SavedProducts, SavedProductsSkeleton } from '../../../features/user/saved-products.tsx';

export const metadata: Metadata = { title: 'Saved products' };
export const instant = true;

export default function SavedPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Saved products</h1>
      <Suspense fallback={<SavedProductsSkeleton />}>
        <SavedProducts />
      </Suspense>
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />
      </Suspense>
    </>
  );
}
