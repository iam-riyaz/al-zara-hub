import { prisma } from "@/lib/db/prisma";

export interface LogAuditOptions {
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async log(options: LogAuditOptions) {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: options.actorId,
          action: options.action,
          entityType: options.entityType,
          entityId: options.entityId,
          oldValue: options.oldValue ? JSON.stringify(options.oldValue) : null,
          newValue: options.newValue ? JSON.stringify(options.newValue) : null,
          ipAddress: options.ipAddress || "127.0.0.1",
          userAgent: options.userAgent || "Al-Zara Dashboard",
        },
      });
    } catch (err) {
      console.error("Audit log error:", err);
    }
  }

  static async list(take = 50) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: {
        actor: { select: { email: true, firstName: true, lastName: true, role: true } },
      },
    });
  }
}
