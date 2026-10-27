import { getProduct } from '@realworld/core/product/product-queries';
import { Skeleton } from '@realworld/ui/skeleton';

export async function ProductDetails({ productId }: { productId: number }) {
  const product = await getProduct(productId);
  const rows = [
    ['SKU', product.sku],
    ['Materials', product.materials],
    ['Origin', product.origin],
    ['Warranty', product.warranty],
  ] as const;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Product Details</h2>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
        {rows.map(([label, value]) =>
          value ? (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ) : null,
        )}
      </dl>
    </section>
  );
}

export function ProductDetailsSkeleton() {
  return <Skeleton className="h-32 rounded-lg" />;
}
