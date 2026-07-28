import { integer, pgEnum, pgTable, text, timestamp, varchar, doublePrecision, serial } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const notificationStatusEnum = pgEnum("notification_status", ["on", "off"]);
export const productStatusEnum = pgEnum("product_status", ["active", "draft", "archived"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "shipped", "delivered", "cancelled"]);
export const earningStatusEnum = pgEnum("earning_status", ["pending", "paid", "refunded"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Store settings per vendor (linked to user).
 */
export const storeSettings = pgTable("storeSettings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  storeName: varchar("storeName", { length: 255 }).notNull(),
  storeDescription: text("storeDescription"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 32 }),
  emailNotifications: notificationStatusEnum("emailNotifications").default("on").notNull(),
  orderNotifications: notificationStatusEnum("orderNotifications").default("on").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type InsertStoreSettings = typeof storeSettings.$inferInsert;

/**
 * Products managed by vendors.
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  category: varchar("category", { length: 128 }),
  imageUrl: text("imageUrl"),
  stockQuantity: integer("stockQuantity").default(0).notNull(),
  sku: varchar("sku", { length: 64 }),
  status: productStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Customer orders.
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 64 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: doublePrecision("totalAmount").notNull(),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  shippingAddress: text("shippingAddress"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Items within an order.
 */
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unitPrice").notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Earnings / transactions per order.
 */
export const earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  orderId: integer("orderId").notNull(),
  amount: doublePrecision("amount").notNull(),
  fee: doublePrecision("fee").default(0).notNull(),
  netAmount: doublePrecision("netAmount").notNull(),
  status: earningStatusEnum("status").default("pending").notNull(),
  payoutDate: timestamp("payoutDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Earning = typeof earnings.$inferSelect;
export type InsertEarning = typeof earnings.$inferInsert;

/**
 * Daily revenue aggregation for quick dashboard queries.
 */
export const dailyRevenue = pgTable("dailyRevenue", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  totalRevenue: doublePrecision("totalRevenue").default(0).notNull(),
  orderCount: integer("orderCount").default(0).notNull(),
});

export type DailyRevenue = typeof dailyRevenue.$inferSelect;
export type InsertDailyRevenue = typeof dailyRevenue.$inferInsert;
