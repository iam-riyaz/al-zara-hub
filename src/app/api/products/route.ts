import { NextRequest } from "next/server";
import { ProductService } from "@/features/products/product.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const categorySlug = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;
    const inStockOnly = searchParams.get("inStock") === "true";
    const sortBy = (searchParams.get("sortBy") as any) || "newest";
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 12;

    const result = await ProductService.list({
      search,
      categorySlug,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      sortBy,
      page,
      limit,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
