export type ProductCategory = { slug: string; name: string };

/** A product as listings and cards show it. */
export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  brand: string;
  featured: boolean;
  category: ProductCategory;
};

/** Everything the product page shows above the fold. */
export type ProductDetails = Product & {
  sku: string;
  materials: string | null;
  origin: string | null;
  warranty: string | null;
};

export type ProductPage = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type Review = {
  id: number;
  productId: number;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
};

export type ReviewSummary = { count: number; average: number };
