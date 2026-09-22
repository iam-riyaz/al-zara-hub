import { NextRequest } from "next/server";
import { loginSchema } from "@/features/auth/auth.validation";
import { AuthService } from "@/features/auth/auth.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validated = loginSchema.parse(json);
    const user = await AuthService.login(validated);
    return successResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}
