import { and, asc, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  InsertEarning,
  InsertOrder,
  InsertOrderItem,
  InsertProduct,
  InsertStoreSettings,
  earnings,
  orderItems,
  orders,
  products,
  storeSettings,
  users,
  dailyRevenue,
} from "../drizzle/schema";
import type { InsertUser } from "../drizzle/schema";
import { ENV } from "./_core/env";

const { Pool } = pg;

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect PostgreSQL:", error);
      _db = null;
    }
  }
  return _db;
}

// ---- User helpers ----

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    
    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ---- Store Settings ----

export async function getStoreSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(storeSettings).where(eq(storeSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertStoreSettings(userId: number, data: Partial<InsertStoreSettings>) {
  const db = await getDb();
  if (!db) return undefined;
  const values = { ...data, userId } as any;
  const updateSet: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(values)) {
    if (key !== "userId" && key !== "id" && key !== "createdAt") {
      updateSet[key] = val;
    }
  }
  await db
    .insert(storeSettings)
    .values(values)
    .onConflictDoUpdate({ target: storeSettings.id, set: updateSet });
  return getStoreSettings(userId);
}

// ---- Products ----

export async function getProducts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
}

export async function getProductById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(and(eq(products.id, id), eq(products.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(userId: number, data: Omit<InsertProduct, "userId">) {
  const db = await getDb();
  if (!db) return undefined;
  const [newProd] = await db.insert(products).values({ ...data, userId } as any).returning();
  return newProd;
}

export async function updateProduct(id: number, userId: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(products).set(data as any).where(and(eq(products.id, id), eq(products.userId, userId)));
  return getProductById(id, userId);
}

export async function deleteProduct(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(products).where(and(eq(products.id, id), eq(products.userId, userId)));
}

// ---- Orders ----

export async function getOrders(userId: number, statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(orders.userId, userId)];
  if (statusFilter && statusFilter !== "all") {
    conditions.push(eq(orders.status, statusFilter as any));
  }
  return db.select().from(orders).where(and(...conditions)).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(and(eq(orders.id, id), eq(orders.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrder(userId: number, orderData: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) return undefined;
  const [newOrder] = await db.insert(orders).values({ ...orderData, userId }).returning();
  if (items.length > 0 && newOrder) {
    await db.insert(orderItems).values(items.map(item => ({ ...item, orderId: newOrder.id })));
  }
  return getOrderById(newOrder.id, userId);
}

export async function updateOrderStatus(id: number, userId: number, status: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(orders).set({ status: status as any }).where(and(eq(orders.id, id), eq(orders.userId, userId)));
  return getOrderById(id, userId);
}

// ---- Inventory ----

export async function getInventory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(and(eq(products.userId, userId), eq(products.status, "active"))).orderBy(asc(products.name));
}

export async function updateStock(productId: number, userId: number, stockQuantity: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(products).set({ stockQuantity }).where(and(eq(products.id, productId), eq(products.userId, userId)));
  return getProductById(productId, userId);
}

export async function bulkUpdateStock(productId: number, userId: number, adjustment: number) {
  const db = await getDb();
  if (!db) return undefined;
  const product = await getProductById(productId, userId);
  if (!product) return undefined;
  const newStock = Math.max(0, product.stockQuantity + adjustment);
  return updateStock(productId, userId, newStock);
}

// ---- Earnings ----

export async function getEarnings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(earnings).where(eq(earnings.userId, userId)).orderBy(desc(earnings.createdAt));
}

export async function getEarningsSummary(userId: number) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalEarnings: 0, pendingPayout: 0 };
  const result = await db
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(amount), 0)`,
      totalEarnings: sql<number>`COALESCE(SUM("netAmount"), 0)`,
      pendingPayout: sql<number>`COALESCE(SUM(CASE WHEN status = 'pending' THEN "netAmount" ELSE 0 END), 0)`,
    })
    .from(earnings)
    .where(eq(earnings.userId, userId));
  return result[0] || { totalRevenue: 0, totalEarnings: 0, pendingPayout: 0 };
}

export async function getDailyRevenue(userId: number, startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dailyRevenue)
    .where(and(eq(dailyRevenue.userId, userId), gte(dailyRevenue.date, startDate), lte(dailyRevenue.date, endDate)))
    .orderBy(asc(dailyRevenue.date));
}

export async function getEarningsByPeriod(userId: number, startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(earnings)
    .where(and(eq(earnings.userId, userId), gte(earnings.createdAt as any, startDate as any), lte(earnings.createdAt as any, endDate as any)))
    .orderBy(asc(earnings.createdAt));
}

// ---- Dashboard ----

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, activeOrders: 0, totalProducts: 0, totalOrders: 0 };

  const [productResult] = await db
    .select({ totalProducts: count() })
    .from(products)
    .where(and(eq(products.userId, userId), eq(products.status, "active")));

  const [orderResult] = await db
    .select({ totalOrders: count() })
    .from(orders)
    .where(eq(orders.userId, userId));

  const [activeOrderResult] = await db
    .select({ activeOrders: count() })
    .from(orders)
    .where(and(
      eq(orders.userId, userId),
      sql`${orders.status} IN ('pending', 'processing', 'shipped')`
    ));

  const [revenueResult] = await db
    .select({ totalRevenue: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(earnings)
    .where(eq(earnings.userId, userId));

  return {
    totalRevenue: Number(revenueResult?.totalRevenue || 0),
    activeOrders: Number(activeOrderResult?.activeOrders || 0),
    totalProducts: Number(productResult?.totalProducts || 0),
    totalOrders: Number(orderResult?.totalOrders || 0),
  };
}

// ---- Seed demo data (Disabled for production safety) ----

export async function seedDemoData(_userId: number) {
  console.log("[Database] Seed demo data called — skipped for production stage safety.");
  return;
}
