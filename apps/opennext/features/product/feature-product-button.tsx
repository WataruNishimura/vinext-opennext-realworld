'use client';

import { setFeaturedProduct } from '@realworld/core/product/product-actions';
import { Button } from '@realworld/ui/button';
import { useOptimistic, useTransition } from 'react';

export function FeatureProductButton({
  productId,
  featured,
}: {
  productId: number;
  featured: boolean;
}) {
  const [optimisticFeatured, setOptimisticFeatured] = useOptimistic(featured);
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={optimisticFeatured}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          setOptimisticFeatured(!optimisticFeatured);
          await setFeaturedProduct(productId, !optimisticFeatured);
        });
      }}
    >
      {optimisticFeatured ? 'Remove from featured' : 'Feature on home page'}
    </Button>
  );
}
