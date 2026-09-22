import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/rbac";
import { AuditService } from "@/features/audit/audit.service";
import { UserStatus, Role } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/errors/error-handler";

const updateUserSchema = z.object({
  status: z.nativeEnum(UserStatus).optional(),
  role: z.nativeEnum(Role).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { status, role } = updateUserSchema.parse(body);

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return errorResponse(new Error("User not found"));
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(role ? { role } : {}),
      },
    });

    await AuditService.log({
      actorId: adminUser.id,
      action: "USER_UPDATED",
      entityType: "USER",
      entityId: id,
      oldValue: { status: targetUser.status, role: targetUser.role },
      newValue: { status: updated.status, role: updated.role },
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
