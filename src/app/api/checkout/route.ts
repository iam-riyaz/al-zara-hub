import { NextRequest } from "next/server";
import { z } from "zod";
import { OrderService } from "@/features/orders/order.service";
import { requireAuth } from "@/lib/auth/rbac";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("US"),
});

const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  couponCode: z.string().optional(),
  idempotencyKey: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    const idempotencyKey =
      request.headers.get("Idempotency-Key") ||
      validated.idempotencyKey ||
      `idem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const result = await OrderService.checkout({
      userId: user.id,
      ...validated,
      idempotencyKey,
    });

    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
