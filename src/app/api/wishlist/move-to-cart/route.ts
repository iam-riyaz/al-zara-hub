import { NextRequest } from "next/server";
import { z } from "zod";
import { WishlistService } from "@/features/wishlist/wishlist.service";
import { requireAuth } from "@/lib/auth/rbac";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const moveToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { productId, variantId } = moveToCartSchema.parse(body);
    const result = await WishlistService.moveToCart(user.id, productId, variantId);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
