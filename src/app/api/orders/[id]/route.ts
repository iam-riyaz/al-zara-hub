import { NextRequest } from "next/server";
import { OrderService } from "@/features/orders/order.service";
import { requireAuth } from "@/lib/auth/rbac";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";
import { Role } from "@prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Admins can view any order; regular users can only view their own
    const userIdFilter = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN ? undefined : user.id;

    const order = await OrderService.getOrderById(id, userIdFilter);
    return successResponse(order);
  } catch (error) {
    return errorResponse(error);
  }
}
