import { CartService } from "@/features/cart/cart.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export async function GET() {
  try {
    const cart = await CartService.getCart();
    return successResponse(cart);
  } catch (error) {
    return errorResponse(error);
  }
}
