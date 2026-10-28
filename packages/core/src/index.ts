/**
 * Client-safe surface of @realworld/core: cache tags, domain types and pure helpers.
 * Queries and Server Functions live behind subpath exports, e.g.
 * `@realworld/core/product/product-queries` and `@realworld/core/cart/cart-actions`.
 */
export type { ActionError } from './action-result.ts';
export { cartTags } from './cart/cart-cache.ts';
export type { CartLine } from './cart/cart-data.ts';
export { MAX_CART_QUANTITY, summarizeCart, type CartSummary } from './cart/cart-math.ts';
export { categoryTags } from './category/category-cache.ts';
export type { Category, CategoryWithCount } from './category/types/category.ts';
export { formatPrice } from './money.ts';
export { productTags } from './product/product-cache.ts';
export {
  catalogHref,
  normalizeProductSearch,
  PRODUCT_PAGE_SIZE,
  PRODUCT_SORTS,
  productSearchParams,
  type ProductSearch,
  type ProductSearchInput,
  type ProductSort,
} from './product/product-search.ts';
export { LOW_STOCK_THRESHOLD, stockStatus, type StockStatus } from './product/product-stock.ts';
export type {
  Product,
  ProductCategory,
  ProductDetails,
  ProductPage,
  Review,
  ReviewSummary,
} from './product/types/product.ts';
export type { Account, AccountProfile, SessionAccount } from './user/types/account.ts';
export { userTags } from './user/user-cache.ts';
