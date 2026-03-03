import type { UserRole } from "@/api/endpoints";
import { isDemoMode } from "@/demo/mode";

type UserLike = {
  role?: string | null;
} | null | undefined;

function normalizeRole(role?: string | null): UserRole {
  const normalized = role?.trim().toLowerCase();
  if (normalized === "owner" || normalized === "director" || normalized === "руководитель") {
    return "owner";
  }
  if (normalized === "admin") {
    return "admin";
  }
  return "manager";
}

export function resolveUserRole(user: UserLike): UserRole {
  if (isDemoMode()) {
    return "owner";
  }
  return normalizeRole(user?.role);
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
