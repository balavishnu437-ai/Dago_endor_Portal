import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ---- Dashboard ----
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getDashboardStats(ctx.user.id);
    }),
    dailyRevenue: protectedProcedure
      .input(z.object({ days: z.number().min(1).max(90).default(30) }))
      .query(async ({ ctx, input }) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);
        const startStr = startDate.toISOString().split("T")[0];
        const endStr = endDate.toISOString().split("T")[0];
        return db.getDailyRevenue(ctx.user.id, startStr, endStr);
      }),
  }),

  // ---- Products ----
  products: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getProducts(ctx.user.id);
    }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const product = await db.getProductById(input.id, ctx.user.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        return product;
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        price: z.number().min(0),
        category: z.string().max(128).optional(),
        imageUrl: z.string().optional(),
        stockQuantity: z.number().min(0).default(0),
        sku: z.string().max(64).optional(),
        status: z.enum(["active", "draft", "archived"]).default("active"),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createProduct(ctx.user.id, input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        category: z.string().max(128).optional(),
        imageUrl: z.string().optional(),
        stockQuantity: z.number().min(0).optional(),
        sku: z.string().max(64).optional(),
        status: z.enum(["active", "draft", "archived"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteProduct(input.id, ctx.user.id);
        return { success: true };
      }),
    uploadImage: protectedProcedure
      .input(z.object({ fileName: z.string(), base64: z.string(), contentType: z.string() }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `products/${Date.now()}_${input.fileName}`;
        const result = await storagePut(key, buffer, input.contentType);
        return { url: result.url, key: result.key };
      }),
  }),

  // ---- Orders ----
  orders: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().default("all") }))
      .query(async ({ ctx, input }) => {
        return db.getOrders(ctx.user.id, input.status);
      }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id, ctx.user.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        const items = await db.getOrderItems(order.id);
        return { ...order, items };
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateOrderStatus(input.id, ctx.user.id, input.status);
      }),
  }),

  // ---- Inventory ----
  inventory: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getInventory(ctx.user.id);
    }),
    updateStock: protectedProcedure
      .input(z.object({
        productId: z.number(),
        stockQuantity: z.number().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateStock(input.productId, ctx.user.id, input.stockQuantity);
      }),
    bulkUpdate: protectedProcedure
      .input(z.object({
        productId: z.number(),
        adjustment: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.bulkUpdateStock(input.productId, ctx.user.id, input.adjustment);
      }),
  }),

  // ---- Earnings ----
  earnings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getEarnings(ctx.user.id);
    }),
    summary: protectedProcedure.query(async ({ ctx }) => {
      return db.getEarningsSummary(ctx.user.id);
    }),
    byPeriod: protectedProcedure
      .input(z.object({
        period: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
      }))
      .query(async ({ ctx, input }) => {
        const endDate = new Date();
        const startDate = new Date();
        if (input.period === "daily") startDate.setDate(startDate.getDate() - 7);
        else if (input.period === "weekly") startDate.setDate(startDate.getDate() - 30);
        else startDate.setMonth(startDate.getMonth() - 6);
        const startStr = startDate.toISOString().split("T")[0];
        const endStr = endDate.toISOString().split("T")[0];
        return db.getDailyRevenue(ctx.user.id, startStr, endStr);
      }),
  }),

  // ---- Store Settings ----
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const settings = await db.getStoreSettings(ctx.user.id);
      if (!settings) {
        // Auto-create default settings
        const created = await db.upsertStoreSettings(ctx.user.id, {
          storeName: "My Store",
          storeDescription: "",
          contactEmail: ctx.user.email || "",
          contactPhone: "",
          emailNotifications: "on",
          orderNotifications: "on",
        });
        return created || {
          id: 1,
          userId: ctx.user.id,
          storeName: "My Store",
          storeDescription: "Default Store Description",
          contactEmail: ctx.user.email || "vendor@dago.com",
          contactPhone: "+91 9876543210",
          emailNotifications: "on" as const,
          orderNotifications: "on" as const,
        };
      }
      return settings;
    }),
    update: protectedProcedure
      .input(z.object({
        storeName: z.string().min(1).max(255),
        storeDescription: z.string().optional(),
        contactEmail: z.string().max(320).optional(),
        contactPhone: z.string().max(32).optional(),
        emailNotifications: z.enum(["on", "off"]).default("on"),
        orderNotifications: z.enum(["on", "off"]).default("on"),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.upsertStoreSettings(ctx.user.id, input);
      }),
  }),

  // ---- Seed demo data ----
  seed: protectedProcedure.mutation(async ({ ctx }) => {
    await db.seedDemoData(ctx.user.id);
    return { success: true };
  }),
});

export type AppRouter = typeof appRouter;
