import { NextRequest } from "next/server";
import { z } from "zod";
import { ReviewService } from "@/features/reviews/review.service";
import { requireAdmin } from "@/lib/auth/rbac";
import { ReviewStatus } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const moderateReviewSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { status } = moderateReviewSchema.parse(body);

    const updated = await ReviewService.moderateReview(id, status);
    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
