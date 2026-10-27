import { cn } from './cn.ts';

/** A deterministic hue per product, so placeholders are stable across renders and servers. */
export function productHue(productId: number): number {
  return (productId * 137.508) % 360;
}

/**
 * Generated artwork standing in for product photos. A fixed aspect ratio reserves the space,
 * so nothing shifts when the card streams in.
 */
export function ProductImage({
  productId,
  name,
  className,
}: {
  productId: number;
  name: string;
  className?: string;
}) {
  const hue = productHue(productId);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0] ?? '')
    .join('');
  return (
    <div
      aria-hidden
      className={cn(
        'grid aspect-square place-items-center rounded-xl text-3xl font-semibold text-white/90',
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, oklch(70% 0.12 ${hue}), oklch(45% 0.12 ${(hue + 40) % 360}))`,
      }}
    >
      {initials}
    </div>
  );
}
