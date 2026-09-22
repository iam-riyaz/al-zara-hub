import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { CouponService } from "@/features/coupons/coupon.service";
import { InventoryService } from "@/features/inventory/inventory.service";
import { OrderService } from "@/features/orders/order.service";

describe("E-Commerce Edge Cases & Security Invariants", () => {
  let customerUser: any;

  beforeAll(async () => {
    customerUser = await prisma.user.findFirst({
      where: { role: "USER" },
    });
  });

  it("should reject expired coupons during checkout validation", async () => {
    await expect(
      CouponService.validate("EXPIRED20", 150.0, customerUser.id)
    ).rejects.toThrowError(/expired/i);
  });

  it("should reject coupons when subtotal fails minimum order amount requirement", async () => {
    // FLAT50 requires min $250
    await expect(
      CouponService.validate("FLAT50", 100.0, customerUser.id)
    ).rejects.toThrowError(/at least \$250/i);
  });

  it("should reject stock reservation if requested quantity exceeds available quantity", async () => {
    const outOfStockVariant = await prisma.productVariant.findFirst({
      where: {
        inventory: { availableQuantity: 0 },
      },
    });

    if (outOfStockVariant) {
      await expect(
        InventoryService.reserveStock(
          [{ variantId: outOfStockVariant.id, quantity: 1 }],
          "order_out_of_stock_test"
        )
      ).rejects.toThrowError(/Insufficient stock available/);
    }
  });

  it("should return the identical existing order when an Idempotency-Key is repeated", async () => {
    const idempotencyKey = `idem_test_${Date.now()}`;

    // Create a mock order with this idempotency key
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-IDEM-${Date.now()}`,
        userId: customerUser.id,
        subtotal: 100,
        totalAmount: 100,
        idempotencyKey,
      },
      include: { items: true, payments: true, addresses: true },
    });

    // Attempt checkout with the same idempotency key
    const result = await OrderService.checkout({
      userId: customerUser.id,
      idempotencyKey,
      shippingAddress: {
        firstName: "Test",
        lastName: "User",
        phone: "+1-555-0000",
        addressLine1: "123 Test St",
        city: "Test",
        state: "CA",
        postalCode: "90001",
        country: "US",
      },
    });

    expect(result.alreadyProcessed).toBe(true);
    expect(result.order.id).toBe(createdOrder.id);
    expect(result.order.orderNumber).toBe(createdOrder.orderNumber);

    // Clean up
    await prisma.order.delete({ where: { id: createdOrder.id } });
  });
});
