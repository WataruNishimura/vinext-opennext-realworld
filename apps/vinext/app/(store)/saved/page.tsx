import { ProductGridSkeleton } from '@realworld/ui/product-card';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SavedProducts } from '../../../features/user/components/saved-products.tsx';

export const metadata: Metadata = { title: 'Saved products' };

export default function SavedPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Saved products</h1>
      <Suspense fallback={<ProductGridSkeleton count={3} withSlot />}>
        <SavedProducts />
      </Suspense>
    </>
  );
}
