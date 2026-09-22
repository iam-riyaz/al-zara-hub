import { CategoryService } from "@/features/categories/category.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export async function GET() {
  try {
    const tree = await CategoryService.getTree();
    return successResponse(tree);
  } catch (error) {
    return errorResponse(error);
  }
}
