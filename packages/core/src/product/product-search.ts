export const PRODUCT_SORTS = ['name-asc', 'name-desc', 'price-asc', 'price-desc'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const PRODUCT_PAGE_SIZE = 9;
const MAX_PAGE = 1000;
const MAX_QUERY_LENGTH = 64;
const CATEGORY_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Normalized catalog search. Equivalent URLs normalize to the same value, so they share a cache entry. */
export type ProductSearch = {
  query: string;
  sort: ProductSort;
  page: number;
  category: string | null;
};

type SearchParamValue = string | string[] | undefined;

export type ProductSearchInput = {
  q?: SearchParamValue;
  sort?: SearchParamValue;
  page?: SearchParamValue;
  category?: SearchParamValue;
};

const first = (value: SearchParamValue) => (Array.isArray(value) ? value[0] : value);

const isSort = (value: string | undefined): value is ProductSort =>
  PRODUCT_SORTS.some(sort => sort === value);

/** Turn raw `searchParams` into the primitive arguments the cached catalog query is keyed on. */
export function normalizeProductSearch(input: ProductSearchInput): ProductSearch {
  const query = (first(input.q) ?? '').trim().toLowerCase().slice(0, MAX_QUERY_LENGTH);
  const sort = first(input.sort);
  const page = Math.floor(Number(first(input.page)));
  const category = first(input.category)?.trim().toLowerCase();

  return {
    query,
    sort: isSort(sort) ? sort : 'name-asc',
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1,
    category: category && CATEGORY_SLUG.test(category) ? category : null,
  };
}

/** Serialize a search back to a query string, leaving out defaults. */
export function productSearchParams(
  search: ProductSearch,
  overrides: Partial<ProductSearch> = {},
): string {
  const next = { ...search, ...overrides };
  const params = new URLSearchParams();
  if (next.query) params.set('q', next.query);
  if (next.sort !== 'name-asc') params.set('sort', next.sort);
  if (next.category) params.set('category', next.category);
  if (next.page > 1) params.set('page', String(next.page));
  return params.toString();
}

/** The catalog URL for a search, leaving out defaults so equal searches share one URL. */
export function catalogHref(search: ProductSearch, overrides: Partial<ProductSearch> = {}): string {
  const query = productSearchParams(search, overrides);
  return query ? `/all?${query}` : '/all';
}
