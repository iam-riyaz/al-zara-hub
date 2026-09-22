import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/rbac";
import { AuditService } from "@/features/audit/audit.service";
import { CategoryStatus } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const createCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  parentId: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await request.json();
    const input = createCategorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug.toLowerCase().trim(),
        description: input.description,
        parentId: input.parentId || null,
        sortOrder: input.sortOrder,
        status: CategoryStatus.ACTIVE,
      },
    });

    await AuditService.log({
      actorId: adminUser.id,
      action: "CATEGORY_CREATED",
      entityType: "CATEGORY",
      entityId: category.id,
      newValue: { name: category.name, slug: category.slug },
    });

    return successResponse(category, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
