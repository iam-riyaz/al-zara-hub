import { NextRequest } from "next/server";
import { z } from "zod";
import { ReviewService } from "@/features/reviews/review.service";
import { requireAuth } from "@/lib/auth/rbac";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(100),
  comment: z.string().min(5).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { productId, rating, title, comment } = createReviewSchema.parse(body);

    const review = await ReviewService.createReview(user.id, productId, rating, title, comment);
    return successResponse(review, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
