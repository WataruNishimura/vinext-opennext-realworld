import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-accent text-6xl font-bold">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-muted max-w-md">That page does not exist or has moved.</p>
      <Link href="/" className={buttonClasses()}>
        Back to the store
      </Link>
    </main>
  );
}
