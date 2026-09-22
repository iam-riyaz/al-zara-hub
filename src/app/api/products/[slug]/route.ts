import { NextRequest } from "next/server";
import { ProductService } from "@/features/products/product.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await ProductService.getBySlug(slug);
    return successResponse(product);
  } catch (error) {
    return errorResponse(error);
  }
}
