export type Route = {
  /** Path and query to visit, e.g. `/product/7`. */
  path: string;
  /**
   * CSS selectors of request-time values (live stock counts, timestamps). Each match is painted
   * over with a solid box in both screenshots, so only its position and size are compared.
   */
  mask?: string[];
};

export type Viewport = { name: string; width: number; height: number };

export type Target = { id: string; route: Route; viewport: Viewport };

/** A file-name-safe name for a path: `/product/7` → `product-7`, `/` → `home`. */
export function slugForPath(path: string): string {
  const slug = path
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return slug === '' ? 'home' : slug;
}

/** Every route at every viewport, optionally only the ids containing `filter`. */
export function buildTargets(routes: Route[], viewports: Viewport[], filter?: string): Target[] {
  return routes
    .flatMap(route =>
      viewports.map(viewport => ({
        id: `${slugForPath(route.path)}--${viewport.name}`,
        route,
        viewport,
      })),
    )
    .filter(target => filter === undefined || target.id.includes(filter));
}
