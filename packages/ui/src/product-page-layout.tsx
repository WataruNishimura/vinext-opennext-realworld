import type { ReactNode } from 'react';
import { Card } from './card.tsx';

/**
 * The product page. Every slot is filled by the app, which owns the `<Suspense>` boundary
 * around each one (the boundaries differ by framework, the layout does not).
 */
export function ProductPageLayout({
  back,
  header,
  stock,
  actions,
  details,
  reviews,
}: {
  back: ReactNode;
  header: ReactNode;
  stock: ReactNode;
  actions: ReactNode;
  details: ReactNode;
  reviews: ReactNode;
}) {
  return (
    <>
      <div className="self-start">{back}</div>
      <Card className="flex flex-col gap-6">
        {header}
        <div className="flex flex-wrap items-center gap-4">{stock}</div>
        <div className="flex flex-wrap items-start gap-3">{actions}</div>
        {details}
      </Card>
      <section aria-labelledby="reviews" className="flex flex-col gap-4">
        <h2 id="reviews" className="text-xl font-semibold">
          Customer reviews
        </h2>
        {reviews}
      </section>
    </>
  );
}
