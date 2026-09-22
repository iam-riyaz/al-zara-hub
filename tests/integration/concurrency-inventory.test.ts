import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { InventoryService } from "@/features/inventory/inventory.service";
import { ProductStatus, VariantStatus, CategoryStatus } from "@prisma/client";

describe("Concurrency & Atomic Inventory Reservation Protection", () => {
  let testVariantId: string;
  let testCategoryId: string;
  let testProductId: string;

  beforeAll(async () => {
    // Setup isolated test product with only 1 item in stock
    const category = await prisma.category.create({
      data: {
        name: "Concurrency Test Category",
        slug: `concurrency-test-${Date.now()}`,
        status: CategoryStatus.ACTIVE,
      },
    });
    testCategoryId = category.id;

    const product = await prisma.product.create({
      data: {
        name: "Limited Edition Concurrency Item",
        slug: `limited-concurrency-item-${Date.now()}`,
        sku: `CONC-${Date.now()}`,
        categoryId: category.id,
        basePrice: 100.0,
        description: "Test product for simultaneous checkout race conditions",
        status: ProductStatus.ACTIVE,
      },
    });
    testProductId = product.id;

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `CONC-VAR-${Date.now()}`,
        title: "Rare Last Unit",
        price: 100.0,
        status: VariantStatus.ACTIVE,
        inventory: {
          create: {
            availableQuantity: 1, // Exactly 1 item in stock
            reservedQuantity: 0,
            soldQuantity: 0,
          },
        },
      },
      include: { inventory: true },
    });
    testVariantId = variant.id;
  });

  afterAll(async () => {
    // Clean up test records
    await prisma.inventoryTransaction.deleteMany({
      where: { inventory: { variantId: testVariantId } },
    });
    await prisma.inventory.deleteMany({ where: { variantId: testVariantId } });
    await prisma.productVariant.deleteMany({ where: { id: testVariantId } });
    await prisma.product.deleteMany({ where: { id: testProductId } });
    await prisma.category.deleteMany({ where: { id: testCategoryId } });
  });

  it("should permit only 1 buyer when 2 concurrent requests attempt to reserve the last available item", async () => {
    const buyer1Promise = InventoryService.reserveStock(
      [{ variantId: testVariantId, quantity: 1 }],
      "order_test_buyer_1"
    );

    const buyer2Promise = InventoryService.reserveStock(
      [{ variantId: testVariantId, quantity: 1 }],
      "order_test_buyer_2"
    );

    const results = await Promise.allSettled([buyer1Promise, buyer2Promise]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // Exactly one reservation must succeed, and the other must be rejected
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // Verify database stock consistency
    const inv = await prisma.inventory.findUnique({
      where: { variantId: testVariantId },
    });

    expect(inv?.availableQuantity).toBe(0);
    expect(inv?.reservedQuantity).toBe(1);
    expect(inv?.soldQuantity).toBe(0);
  });
});
