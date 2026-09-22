import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { OrderService } from "@/features/orders/order.service";
import { OrderStatus } from "@prisma/client";

describe("Admin Orders Query Service", () => {
  it("should return all orders across all users for admin view", async () => {
    const totalOrdersCount = await prisma.order.count();
    const adminOrders = await OrderService.getAdminOrders();

    expect(adminOrders.length).toBe(totalOrdersCount);
    expect(adminOrders.length).toBeGreaterThan(0);

    // Verify relations are included
    const firstOrder = adminOrders[0];
    expect(firstOrder).toHaveProperty("orderNumber");
    expect(firstOrder).toHaveProperty("totalAmount");
    expect(firstOrder).toHaveProperty("items");
    expect(firstOrder).toHaveProperty("user");
  });

  it("should filter orders by status correctly", async () => {
    const confirmedOrders = await OrderService.getAdminOrders({
      status: OrderStatus.CONFIRMED,
    });

    for (const order of confirmedOrders) {
      expect(order.status).toBe(OrderStatus.CONFIRMED);
    }
  });

  it("should filter orders by search term matching orderNumber or customer email", async () => {
    const allOrders = await OrderService.getAdminOrders();
    const sample = allOrders[0];

    const searchResults = await OrderService.getAdminOrders({
      search: sample.orderNumber,
    });

    expect(searchResults.length).toBeGreaterThanOrEqual(1);
    expect(searchResults.some((o) => o.id === sample.id)).toBe(true);
  });
});
