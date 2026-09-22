import { NextRequest } from "next/server";
import { z } from "zod";
import { WishlistService } from "@/features/wishlist/wishlist.service";
import { requireAuth } from "@/lib/auth/rbac";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const wishlistMutationSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const wishlist = await WishlistService.getWishlist(user.id);
    return successResponse(wishlist);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { productId, variantId } = wishlistMutationSchema.parse(body);
    const updated = await WishlistService.addItem(user.id, productId, variantId);
    return successResponse(updated, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { productId } = wishlistMutationSchema.parse(body);
    const updated = await WishlistService.removeItem(user.id, productId);
    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
