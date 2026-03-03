import type { UserRole } from "@/api/endpoints";

type UserLike = {
  role?: UserRole | null;
} | null | undefined;

export function resolveUserRole(user: UserLike): UserRole {
  if (user?.role === "owner" || user?.role === "admin" || user?.role === "manager") {
    return user.role;
  }
  return "manager";
}

export function canAccessExtendedFeatures(user: UserLike): boolean {
  return Boolean(resolveUserRole(user));
}

export function canManageTeam(user: UserLike): boolean {
  return resolveUserRole(user) === "owner";
}

export function canViewTeam(user: UserLike): boolean {
  return resolveUserRole(user) === "owner";
}

export function canManageApiKeys(user: UserLike): boolean {
  const role = resolveUserRole(user);
  return role === "owner" || role === "admin";
}

export function canSeePlanFact(user: UserLike): boolean {
  return resolveUserRole(user) !== "manager";
}
