import { Link } from '@realworld/ui/link';

export function SiteFooter() {
  return (
    <footer className="border-line text-muted border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4 py-8 text-sm sm:px-6">
        <p>RealWorld Commerce, rendered by Next.js on Vercel.</p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/about">About</Link>
          <Link href="/saved">Saved</Link>
          <Link href="/account">Account</Link>
        </nav>
      </div>
    </footer>
  );
}
