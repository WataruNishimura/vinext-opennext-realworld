import { buttonClasses } from '@realworld/ui/button';
import { Link } from '@realworld/ui/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-24">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <Link href="/" className={buttonClasses()}>
        Go home
      </Link>
    </main>
  );
}
