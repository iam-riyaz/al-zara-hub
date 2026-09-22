import { OrderService } from "@/features/orders/order.service";
import { requireAuth } from "@/lib/auth/rbac";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export async function GET() {
  try {
    const user = await requireAuth();
    const orders = await OrderService.getUserOrders(user.id);
    return successResponse(orders);
  } catch (error) {
    return errorResponse(error);
  }
}
