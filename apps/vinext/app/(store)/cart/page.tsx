import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CartView, CartViewSkeleton } from '../../../features/cart/components/cart-view.tsx';

export const metadata: Metadata = { title: 'Cart' };
export const instant = true;

export default function CartPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
      <Suspense fallback={<CartViewSkeleton />}>
        <CartView />
      </Suspense>
    </div>
  );
}
