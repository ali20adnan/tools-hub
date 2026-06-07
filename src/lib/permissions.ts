export type AppPermission =
  | "account_requests:review"
  | "users:read"
  | "users:manage"
  | "maintenance:read"
  | "maintenance:manage"
  | "tools:read"
  | "tools:manage"
  | "audit_logs:read"

// Keyed by lowercased role so backend roles (USER/ADMIN) and any legacy
// lowercase roles resolve the same way.
export const rolePermissions: Record<string, AppPermission[]> = {
  admin: [
    "account_requests:review",
    "users:read",
    "users:manage",
    "maintenance:read",
    "maintenance:manage",
    "tools:read",
    "tools:manage",
    "audit_logs:read",
  ],
  user: [],
}

export function hasPermission(
  user: { role?: string } | null | undefined,
  permission: AppPermission
): boolean {
  if (!user?.role) return false
  const permissions = rolePermissions[user.role.toLowerCase()] ?? []
  return permissions.includes(permission)
}
