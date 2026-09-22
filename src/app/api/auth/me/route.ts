import { requireAuth } from "@/lib/auth/rbac";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export async function GET() {
  try {
    const user = await requireAuth();
    return successResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}
