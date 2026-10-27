import { relations, sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

/**
 * Timestamps are stored as integer milliseconds so seeded rows stay deterministic
 * and D1/SQLite comparisons stay numeric.
 */
const timestamp = (name: string) => integer(name, { mode: 'timestamp_ms' });

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').notNull(),
});

export const products = sqliteTable(
  'products',
  {
    id: integer('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    /** Price in the smallest currency unit (cents) to avoid floating point drift. */
    priceCents: integer('price_cents').notNull(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id),
    brand: text('brand').notNull(),
    sku: text('sku').notNull().unique(),
    materials: text('materials'),
    origin: text('origin'),
    warranty: text('warranty'),
    /** Featured flag shown on the home page hero and featured grid. */
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    featuredAt: timestamp('featured_at'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  table => [
    index('products_category_idx').on(table.categoryId),
    index('products_name_idx').on(table.name),
    index('products_featured_idx').on(table.featured, table.featuredAt),
    index('products_created_at_idx').on(table.createdAt),
    check('products_price_positive', sql`${table.priceCents} > 0`),
  ],
);

/** Live stock per product. Kept in its own table so writes never touch catalog rows. */
export const inventory = sqliteTable(
  'inventory',
  {
    productId: integer('product_id')
      .primaryKey()
      .references(() => products.id, { onDelete: 'cascade' }),
    stock: integer('stock').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
  },
  table => [check('inventory_stock_non_negative', sql`${table.stock} >= 0`)],
);

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  zipCode: text('zip_code'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const reviews = sqliteTable(
  'reviews',
  {
    id: integer('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    accountId: text('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    authorName: text('author_name').notNull(),
    rating: integer('rating').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at').notNull(),
  },
  table => [
    index('reviews_product_created_idx').on(table.productId, table.createdAt),
    check('reviews_rating_range', sql`${table.rating} BETWEEN 1 AND 5`),
  ],
);

/**
 * Cart lines keyed by an opaque cart id stored in an http-only cookie, so anonymous
 * visitors can shop before signing in.
 */
export const cartItems = sqliteTable(
  'cart_items',
  {
    cartId: text('cart_id').notNull(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    addedAt: timestamp('added_at').notNull(),
  },
  table => [
    primaryKey({ columns: [table.cartId, table.productId] }),
    check('cart_items_quantity_range', sql`${table.quantity} BETWEEN 1 AND 10`),
  ],
);

export const savedProducts = sqliteTable(
  'saved_products',
  {
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    savedAt: timestamp('saved_at').notNull(),
  },
  table => [
    primaryKey({ columns: [table.accountId, table.productId] }),
    uniqueIndex('saved_products_product_account_idx').on(table.productId, table.accountId),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  inventory: one(inventory, { fields: [products.id], references: [inventory.productId] }),
  reviews: many(reviews),
  savedBy: many(savedProducts),
  cartItems: many(cartItems),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, { fields: [inventory.productId], references: [products.id] }),
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
  reviews: many(reviews),
  savedProducts: many(savedProducts),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  account: one(accounts, { fields: [reviews.accountId], references: [accounts.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const savedProductsRelations = relations(savedProducts, ({ one }) => ({
  account: one(accounts, { fields: [savedProducts.accountId], references: [accounts.id] }),
  product: one(products, { fields: [savedProducts.productId], references: [products.id] }),
}));

export type CategoryRow = typeof categories.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type InventoryRow = typeof inventory.$inferSelect;
export type AccountRow = typeof accounts.$inferSelect;
export type ReviewRow = typeof reviews.$inferSelect;
export type CartItemRow = typeof cartItems.$inferSelect;
export type SavedProductRow = typeof savedProducts.$inferSelect;

export type NewCategory = typeof categories.$inferInsert;
export type NewProduct = typeof products.$inferInsert;
export type NewInventory = typeof inventory.$inferInsert;
export type NewAccount = typeof accounts.$inferInsert;
export type NewReview = typeof reviews.$inferInsert;
export type NewCartItem = typeof cartItems.$inferInsert;
export type NewSavedProduct = typeof savedProducts.$inferInsert;
