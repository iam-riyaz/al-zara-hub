import { AuthService } from "@/features/auth/auth.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export async function POST() {
  try {
    const result = await AuthService.logout();
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
