import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test Vendor",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("vendor portal routers", () => {
  describe("auth.me", () => {
    it("returns the current user", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      expect(result).toBeDefined();
      expect(result?.email).toBe("test@example.com");
      expect(result?.name).toBe("Test Vendor");
    });
  });

  describe("auth.logout", () => {
    it("returns success", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();
      expect(result).toEqual({ success: true });
    });
  });

  describe("products", () => {
    it("has list procedure", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      // List should return an array (empty if no products for this user)
      const result = await caller.products.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("validates create input", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      // Should reject empty name
      await expect(
        caller.products.create({ name: "", price: 0 })
      ).rejects.toThrow();
    });
  });

  describe("orders", () => {
    it("has list procedure with status filter", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.orders.list({ status: "all" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("validates updateStatus input", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      // Should reject invalid status
      await expect(
        caller.orders.updateStatus({ id: 1, status: "invalid" as any })
      ).rejects.toThrow();
    });
  });

  describe("inventory", () => {
    it("has list procedure", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.inventory.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("validates updateStock input", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      // Should reject negative stock
      await expect(
        caller.inventory.updateStock({ productId: 1, stockQuantity: -1 })
      ).rejects.toThrow();
    });
  });

  describe("earnings", () => {
    it("has summary procedure", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.earnings.summary();
      expect(result).toHaveProperty("totalRevenue");
      expect(result).toHaveProperty("totalEarnings");
      expect(result).toHaveProperty("pendingPayout");
    });

    it("has list procedure", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.earnings.list();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("settings", () => {
    it("has get procedure", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.settings.get();
      expect(result).toBeDefined();
    });

    it("validates update input", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      // Should reject empty store name
      await expect(
        caller.settings.update({ storeName: "" })
      ).rejects.toThrow();
    });
  });

  describe("dashboard", () => {
    it("has stats procedure", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.dashboard.stats();
      expect(result).toHaveProperty("totalRevenue");
      expect(result).toHaveProperty("activeOrders");
      expect(result).toHaveProperty("totalProducts");
      expect(result).toHaveProperty("totalOrders");
    });
  });

  describe("order status values", () => {
    it("accepts all valid status values", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
      for (const status of validStatuses) {
        // Just verify the procedure accepts these values (will fail on not-found, not validation)
        try {
          await caller.orders.updateStatus({ id: 999999, status: status as any });
        } catch (e: any) {
          // Should be NOT_FOUND, not validation error
          expect(e.message).not.toContain("validation");
        }
      }
    });
  });
});
