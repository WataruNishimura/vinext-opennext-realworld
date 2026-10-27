export const productTags = {
  /** Every catalog listing (search, category pages, products by id). */
  all: 'products',
  /** The featured selection on the home page. */
  featured: 'featured-products',
  detail: (productId: number) => `product:${productId}`,
  reviews: (productId: number) => `reviews:${productId}`,
  stock: (productId: number) => `stock:${productId}`,
};
