import { NextRequest } from "next/server";
import { z } from "zod";
import { CartService } from "@/features/cart/cart.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const updateItemSchema = z.object({
  quantity: z.number().int().min(0),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity } = updateItemSchema.parse(body);
    const updatedCart = await CartService.updateQuantity(id, quantity);
    return successResponse(updatedCart);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedCart = await CartService.removeItem(id);
    return successResponse(updatedCart);
  } catch (error) {
    return errorResponse(error);
  }
}
