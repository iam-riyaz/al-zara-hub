import { prisma } from "@/lib/db/prisma";
import { DiscountType } from "@prisma/client";
import { ValidationError, NotFoundError } from "@/lib/errors/AppError";

export interface CouponValidationResult {
  valid: boolean;
  couponId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  calculatedDiscount: number;
  message?: string;
}

export class CouponService {
  /**
   * Validate coupon code against subtotal and user history
   */
  static async validate(code: string, subtotal: number, userId?: string): Promise<CouponValidationResult> {
    const cleanCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon) {
      throw new NotFoundError(`Coupon code "${cleanCode}" does not exist`);
    }

    if (!coupon.isActive) {
      throw new ValidationError(`Coupon code "${cleanCode}" is no longer active`);
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      throw new ValidationError(`Coupon "${cleanCode}" is not yet active`);
    }

    if (coupon.endDate && coupon.endDate < now) {
      throw new ValidationError(`Coupon "${cleanCode}" has expired`);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new ValidationError(`Coupon "${cleanCode}" has reached its maximum redemption limit`);
    }

    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (subtotal < minAmount) {
      throw new ValidationError(
        `Order subtotal must be at least $${minAmount.toFixed(2)} to use coupon "${cleanCode}"`
      );
    }

    if (userId) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId,
        },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        throw new ValidationError(
          `You have already used coupon "${cleanCode}" the maximum number of times (${coupon.perUserLimit})`
        );
      }
    }

    // Calculate discount
    const discountVal = Number(coupon.discountValue);
    let calculated = 0;

    if (coupon.discountType === DiscountType.PERCENTAGE) {
      calculated = (subtotal * discountVal) / 100;
      if (coupon.maxDiscountAmount) {
        calculated = Math.min(calculated, Number(coupon.maxDiscountAmount));
      }
    } else {
      // FIXED
      calculated = Math.min(subtotal, discountVal);
    }

    calculated = Math.round(calculated * 100) / 100;

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: discountVal,
      calculatedDiscount: calculated,
      message: `Coupon "${coupon.code}" applied: -$${calculated.toFixed(2)}`,
    };
  }
}
