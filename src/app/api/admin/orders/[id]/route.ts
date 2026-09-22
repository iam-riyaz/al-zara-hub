import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/rbac";
import { OrderStateMachine } from "@/features/orders/order-state-machine";
import { AuditService } from "@/features/audit/audit.service";
import { OrderStatus } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";
import { NotFoundError } from "@/lib/errors/AppError";

const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { status: nextStatus, notes } = updateOrderStatusSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) throw new NotFoundError("Order not found");

    // Validate state transition through centralized state machine
    OrderStateMachine.validateTransition(order.status, nextStatus);

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: nextStatus,
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: nextStatus,
            notes: notes || `Admin updated order status to ${nextStatus}`,
            actorId: adminUser.id,
          },
        },
      },
    });

    await AuditService.log({
      actorId: adminUser.id,
      action: "ORDER_STATUS_UPDATED",
      entityType: "ORDER",
      entityId: order.id,
      oldValue: { status: order.status },
      newValue: { status: nextStatus, notes },
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
