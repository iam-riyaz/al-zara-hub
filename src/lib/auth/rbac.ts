import { Role, UserStatus } from "@prisma/client";
import { getCurrentUser } from "./session";
import { AuthenticationError, AuthorizationError } from "../errors/AppError";

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError("You must be logged in to access this resource");
  }
  if (user.status !== UserStatus.ACTIVE) {
    throw new AuthorizationError("Your account has been suspended or deactivated");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `Access denied. Requires one of roles: [${allowedRoles.join(", ")}], but user is '${user.role}'`
    );
  }
  return user;
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN, Role.SUPER_ADMIN]);
}

export async function requireSuperAdmin() {
  return requireRole([Role.SUPER_ADMIN]);
}
