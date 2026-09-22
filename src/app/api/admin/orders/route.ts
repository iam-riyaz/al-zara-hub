import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/rbac";
import { OrderService } from "@/features/orders/order.service";
import { OrderStatus } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const status =
      statusParam && statusParam !== "ALL" && Object.values(OrderStatus).includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : undefined;

    const orders = await OrderService.getAdminOrders({
      status,
      search,
      take: limit,
      skip: (page - 1) * limit,
    });

    return successResponse(orders);
  } catch (error) {
    return errorResponse(error);
  }
}
