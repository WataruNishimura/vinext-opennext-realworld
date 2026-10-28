import { Link } from './link.tsx';

/** The store footer. `runtime` names the app that rendered the page (OpenNext or vinext). */
export function SiteFooter({ runtime }: { runtime: string }) {
  return (
    <footer className="border-line text-muted border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm">
        {/* The runtime name has its own line, so its length never changes how the footer wraps. */}
        <div className="flex flex-col gap-1">
          <p>RealWorld Commerce on Cloudflare Workers.</p>
          <p>
            Rendered by <span data-testid="runtime-name">{runtime}</span>.
          </p>
        </div>
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
