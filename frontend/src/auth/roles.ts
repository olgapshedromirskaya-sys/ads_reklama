import type { UserRole } from "@/api/endpoints";

type UserLike = {
  role?: UserRole | null;
  owner_id?: number | null;
} | null | undefined;

export function resolveUserRole(user: UserLike): UserRole {
  if (user?.role === "admin" || user?.role === "manager" || user?.role === "director") {
    return user.role;
  }
  return "director";
}

export function canAccessExtendedFeatures(user: UserLike): boolean {
  return resolveUserRole(user) !== "manager";
}

export function canManageTeam(user: UserLike): boolean {
  return resolveUserRole(user) === "director" && !user?.owner_id;
}

export function canViewTeam(user: UserLike): boolean {
  const role = resolveUserRole(user);
  return role === "director" || role === "admin";
}
