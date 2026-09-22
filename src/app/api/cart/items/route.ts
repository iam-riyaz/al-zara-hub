import { NextRequest } from "next/server";
import { z } from "zod";
import { CartService } from "@/features/cart/cart.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const addItemSchema = z.object({
  variantId: z.string().min(1, "variantId is required"),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, quantity } = addItemSchema.parse(body);
    const updatedCart = await CartService.addItem(variantId, quantity);
    return successResponse(updatedCart, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
