import { getSupabaseAdmin } from "./supabase";

export type AppRole = "admin" | "singer" | "organization" | string;

type AppMetadata = {
  role?: string;
  roles?: string[];
  [key: string]: unknown;
};

/** Read roles from JWT/app_metadata. Accepts legacy single `role` during transition. */
export function rolesFromAppMetadata(meta: AppMetadata | null | undefined): string[] {
  if (!meta) return [];
  if (Array.isArray(meta.roles)) {
    return meta.roles.map(String).filter(Boolean);
  }
  if (typeof meta.role === "string" && meta.role) {
    return [meta.role];
  }
  return [];
}

export function hasAppRole(
  meta: AppMetadata | null | undefined,
  role: AppRole,
): boolean {
  return rolesFromAppMetadata(meta).includes(role);
}

export function withRoleAdded(roles: string[], role: AppRole): string[] {
  return [...new Set([...roles, role])];
}

export function withRoleRemoved(roles: string[], role: AppRole): string[] {
  return roles.filter((r) => r !== role);
}

/**
 * Merge app_metadata.roles on a Supabase Auth user.
 * Drops legacy single `role` so JWT stays consistent.
 */
export async function updateAuthUserRoles(
  authUserId: string,
  mutate: (roles: string[]) => string[],
): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.getUserById(authUserId);
  if (error || !data.user) {
    throw new Error(error?.message || "Auth user not found");
  }

  const meta = (data.user.app_metadata || {}) as AppMetadata;
  const current = rolesFromAppMetadata(meta);
  const next = mutate(current);
  const { role: _legacy, ...rest } = meta;

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    authUserId,
    {
      app_metadata: {
        ...rest,
        roles: next,
      },
    },
  );
  if (updateError) {
    throw new Error(updateError.message);
  }
  return next;
}

export async function grantAuthRole(
  authUserId: string,
  role: AppRole,
): Promise<string[]> {
  return updateAuthUserRoles(authUserId, (roles) => withRoleAdded(roles, role));
}

export async function revokeAuthRole(
  authUserId: string,
  role: AppRole,
): Promise<string[]> {
  return updateAuthUserRoles(authUserId, (roles) => withRoleRemoved(roles, role));
}
