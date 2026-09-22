import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/rbac";
import { InventoryService } from "@/features/inventory/inventory.service";
import { AuditService } from "@/features/audit/audit.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const adjustStockSchema = z.object({
  newQuantity: z.number().int().min(0),
  reason: z.string().min(3, "Adjustment reason is required"),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    const { id } = await params; // variantId
    const body = await request.json();
    const { newQuantity, reason } = adjustStockSchema.parse(body);

    const updated = await InventoryService.adjustStock(id, newQuantity, reason, adminUser.id);

    await AuditService.log({
      actorId: adminUser.id,
      action: "INVENTORY_MANUAL_ADJUSTMENT",
      entityType: "INVENTORY",
      entityId: updated.id,
      newValue: { variantId: id, newQuantity, reason },
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
