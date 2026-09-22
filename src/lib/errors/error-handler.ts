import { AppError } from "./AppError";
import { ZodError } from "zod";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
}

export function successResponse<T>(data: T, status = 200) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    error: null,
  };
  return Response.json(body, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    const body: ApiResponse = {
      success: false,
      data: null,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    return Response.json(body, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    const body: ApiResponse = {
      success: false,
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input provided",
        details: error.flatten().fieldErrors,
      },
    };
    return Response.json(body, { status: 400 });
  }

  console.error("Unhandled Server Error:", error);

  const body: ApiResponse = {
    success: false,
    data: null,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected internal server error occurred",
    },
  };
  return Response.json(body, { status: 500 });
}
