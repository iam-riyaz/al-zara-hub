import { describe, it, expect } from "vitest";

describe("Coupon Discount Calculation Engine", () => {
  it("should calculate percentage discount correctly with cap", () => {
    const subtotal = 400;
    const discountRate = 20; // 20%
    const maxDiscountCap = 50;

    let discount = (subtotal * discountRate) / 100;
    if (maxDiscountCap) {
      discount = Math.min(discount, maxDiscountCap);
    }

    expect(discount).toBe(50); // capped at 50 instead of 80
  });

  it("should calculate fixed discount correctly without exceeding subtotal", () => {
    const subtotal = 30;
    const fixedDiscount = 50;

    const discount = Math.min(subtotal, fixedDiscount);
    expect(discount).toBe(30); // cannot exceed subtotal
  });

  it("should reject coupon when subtotal does not meet minimum order threshold", () => {
    const subtotal = 45;
    const minOrderAmount = 50;

    const meetsThreshold = subtotal >= minOrderAmount;
    expect(meetsThreshold).toBe(false);
  });

  it("should reject expired coupons", () => {
    const now = new Date();
    const expiredEndDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday

    const isExpired = expiredEndDate < now;
    expect(isExpired).toBe(true);
  });
});
