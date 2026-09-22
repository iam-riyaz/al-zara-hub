import { prisma } from "@/lib/db/prisma";
import { Prisma, InventoryTransactionType } from "@prisma/client";
import { InventoryError, NotFoundError } from "@/lib/errors/AppError";

export class InventoryService {
  /**
   * Concurrency-safe atomic stock reservation using PostgreSQL row conditions.
   * If two users attempt to reserve the last item simultaneously, only one succeeds.
   */
  static async reserveStock(
    items: { variantId: string; quantity: number }[],
    orderId: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;

    for (const item of items) {
      // Atomic conditional update in raw SQL to prevent race conditions
      const updatedCount = await client.$executeRaw`
        UPDATE "Inventory"
        SET "availableQuantity" = "availableQuantity" - ${item.quantity},
            "reservedQuantity"  = "reservedQuantity" + ${item.quantity},
            "updatedAt"         = NOW()
        WHERE "variantId" = ${item.variantId}
          AND "availableQuantity" >= ${item.quantity}
      `;

      if (updatedCount === 0) {
        throw new InventoryError(
          `Insufficient stock available for variant ${item.variantId}. Concurrency conflict resolved: item is out of stock.`
        );
      }

      // Record transaction audit
      const inv = await client.inventory.findUnique({
        where: { variantId: item.variantId },
      });

      if (inv) {
        await client.inventoryTransaction.create({
          data: {
            inventoryId: inv.id,
            type: InventoryTransactionType.RESERVATION,
            quantity: item.quantity,
            referenceType: "ORDER",
            referenceId: orderId,
            notes: `Reserved for pending order ${orderId}`,
          },
        });
      }
    }
  }

  /**
   * Release reserved stock back to available pool on cancellation or payment timeout
   */
  static async releaseStock(
    items: { variantId: string; quantity: number }[],
    orderId: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;

    for (const item of items) {
      await client.$executeRaw`
        UPDATE "Inventory"
        SET "availableQuantity" = "availableQuantity" + ${item.quantity},
            "reservedQuantity"  = "reservedQuantity" - ${item.quantity},
            "updatedAt"         = NOW()
        WHERE "variantId" = ${item.variantId}
          AND "reservedQuantity" >= ${item.quantity}
      `;

      const inv = await client.inventory.findUnique({
        where: { variantId: item.variantId },
      });

      if (inv) {
        await client.inventoryTransaction.create({
          data: {
            inventoryId: inv.id,
            type: InventoryTransactionType.RELEASE,
            quantity: item.quantity,
            referenceType: "ORDER_CANCELLED",
            referenceId: orderId,
            notes: `Released reservation back to inventory for order ${orderId}`,
          },
        });
      }
    }
  }

  /**
   * Commit reservation to permanent sale upon verified payment confirmation
   */
  static async commitSale(
    items: { variantId: string; quantity: number }[],
    orderId: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;

    for (const item of items) {
      await client.$executeRaw`
        UPDATE "Inventory"
        SET "reservedQuantity" = "reservedQuantity" - ${item.quantity},
            "soldQuantity"      = "soldQuantity" + ${item.quantity},
            "updatedAt"         = NOW()
        WHERE "variantId" = ${item.variantId}
          AND "reservedQuantity" >= ${item.quantity}
      `;

      const inv = await client.inventory.findUnique({
        where: { variantId: item.variantId },
      });

      if (inv) {
        await client.inventoryTransaction.create({
          data: {
            inventoryId: inv.id,
            type: InventoryTransactionType.SALE,
            quantity: item.quantity,
            referenceType: "ORDER_PAID",
            referenceId: orderId,
            notes: `Committed sale for confirmed order ${orderId}`,
          },
        });
      }
    }
  }

  /**
   * Admin manual stock adjustment
   */
  static async adjustStock(
    variantId: string,
    newAvailableQuantity: number,
    notes: string,
    actorId?: string
  ) {
    const inv = await prisma.inventory.findUnique({
      where: { variantId },
    });

    if (!inv) throw new NotFoundError("Inventory record not found");

    const diff = newAvailableQuantity - inv.availableQuantity;

    const updated = await prisma.inventory.update({
      where: { variantId },
      data: {
        availableQuantity: newAvailableQuantity,
        transactions: {
          create: {
            type: InventoryTransactionType.ADJUSTMENT,
            quantity: diff,
            referenceType: "MANUAL_ADJUSTMENT",
            referenceId: actorId,
            notes,
          },
        },
      },
    });

    return updated;
  }
}
