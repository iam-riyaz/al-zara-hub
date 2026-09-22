import { NextRequest } from "next/server";
import { z } from "zod";
import { OrderService } from "@/features/orders/order.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const confirmPaymentSchema = z.object({
  orderId: z.string().min(1),
  transactionId: z.string().min(1),
  simulateFailure: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, transactionId, simulateFailure } = confirmPaymentSchema.parse(body);

    const result = await OrderService.confirmOrderPayment(orderId, transactionId, simulateFailure);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
