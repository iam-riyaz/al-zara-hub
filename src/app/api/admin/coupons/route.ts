import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/rbac";
import { AuditService } from "@/features/audit/audit.service";
import { DiscountType } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const createCouponSchema = z.object({
  code: z.string().min(3),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().min(0.01),
  minOrderAmount: z.number().optional(),
  maxDiscountAmount: z.number().optional(),
  usageLimit: z.number().int().optional(),
  perUserLimit: z.number().int().default(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { usages: true } },
      },
    });
    return successResponse(coupons);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await request.json();
    const input = createCouponSchema.parse(body);

    const coupon = await prisma.coupon.create({
      data: {
        code: input.code.toUpperCase().trim(),
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue,
        minOrderAmount: input.minOrderAmount,
        maxDiscountAmount: input.maxDiscountAmount,
        usageLimit: input.usageLimit,
        perUserLimit: input.perUserLimit,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        endDate: input.endDate ? new Date(input.endDate) : null,
        isActive: true,
      },
    });

    await AuditService.log({
      actorId: adminUser.id,
      action: "COUPON_CREATED",
      entityType: "COUPON",
      entityId: coupon.id,
      newValue: { code: coupon.code, discountValue: input.discountValue },
    });

    return successResponse(coupon, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
