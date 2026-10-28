import { Link } from '@realworld/ui/link';

export function SiteFooter() {
  return (
    <footer className="border-line text-muted border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm">
        <p>RealWorld Commerce on Cloudflare Workers (OpenNext).</p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/about" className="hover:text-ink">
            About
          </Link>
          <Link href="/all" className="hover:text-ink">
            All products
          </Link>
        </nav>
      </div>
    </footer>
  );
}
