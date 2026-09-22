import { prisma } from "@/lib/db/prisma";
import { ReviewStatus, OrderStatus } from "@prisma/client";
import { ConflictError, ValidationError, NotFoundError } from "@/lib/errors/AppError";

export class ReviewService {
  static async createReview(
    userId: string,
    productId: string,
    rating: number,
    title: string,
    comment: string
  ) {
    if (rating < 1 || rating > 5) {
      throw new ValidationError("Rating must be an integer between 1 and 5");
    }

    const existing = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("You have already reviewed this product");
    }

    // Check verified purchase: user has completed order with this product
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.DELIVERED,
        items: {
          some: { productId },
        },
      },
    });

    const isVerifiedPurchase = Boolean(deliveredOrder);

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        orderId: deliveredOrder?.id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        isVerifiedPurchase,
        status: ReviewStatus.APPROVED,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    // Recompute product ratings aggregate
    await this.updateProductRatingAggregate(productId);

    return review;
  }

  static async moderateReview(reviewId: string, status: ReviewStatus) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundError("Review not found");

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });

    await this.updateProductRatingAggregate(review.productId);

    return updated;
  }

  static async updateProductRatingAggregate(productId: string) {
    const approvedReviews = await prisma.review.findMany({
      where: { productId, status: ReviewStatus.APPROVED },
      select: { rating: true },
    });

    const count = approvedReviews.length;
    const avg = count > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAverage: Math.round(avg * 100) / 100,
        ratingCount: count,
      },
    });
  }
}
