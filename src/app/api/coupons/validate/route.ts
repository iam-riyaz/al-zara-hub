import { NextRequest } from "next/server";
import { z } from "zod";
import { CouponService } from "@/features/coupons/coupon.service";
import { getSession } from "@/lib/auth/session";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { code, subtotal } = validateCouponSchema.parse(body);

    const result = await CouponService.validate(code, subtotal, session?.userId);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
