import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link href="/all" className={buttonClasses()}>
        Browse products
      </Link>
    </div>
  );
}
