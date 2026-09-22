import { NextRequest } from "next/server";
import { registerSchema } from "@/features/auth/auth.validation";
import { AuthService } from "@/features/auth/auth.service";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validated = registerSchema.parse(json);
    const user = await AuthService.register(validated);
    return successResponse(user, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
