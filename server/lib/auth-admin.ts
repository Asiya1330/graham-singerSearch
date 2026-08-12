import type { Request, Response, NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import { admins, type Admin } from "@shared/schema";
import { db } from "../storage";
import { sendApiError } from "./api-response";
import { hasAppRole } from "./auth-roles";
import {
  extractBearerToken,
  verifySupabaseAccessToken,
  type VerifiedClaims,
} from "./auth-token";

// Re-exported so existing admin imports keep working unchanged.
export { extractBearerToken, verifySupabaseAccessToken };

export type AdminAuthContext = {
  admin: Admin;
  authUserId: string;
  email: string;
  aal: string;
};

declare global {
  namespace Express {
    interface Request {
      adminAuth?: AdminAuthContext;
    }
  }
}

export async function resolveActiveAdminFromToken(
  token: string,
): Promise<
  | { ok: true; ctx: AdminAuthContext }
  | { ok: false; code: "ADMIN_AUTH_REQUIRED" | "ADMIN_MFA_REQUIRED" | "ADMIN_FORBIDDEN" }
> {
  let claims: VerifiedClaims;
  try {
    claims = await verifySupabaseAccessToken(token);
  } catch {
    return { ok: false, code: "ADMIN_AUTH_REQUIRED" };
  }

  const sub = typeof claims.sub === "string" ? claims.sub : null;
  if (!sub) return { ok: false, code: "ADMIN_AUTH_REQUIRED" };

  if (!hasAppRole(claims.app_metadata, "admin")) {
    return { ok: false, code: "ADMIN_FORBIDDEN" };
  }

  const aal = claims.aal === "aal2" ? "aal2" : "aal1";
  if (aal !== "aal2") return { ok: false, code: "ADMIN_MFA_REQUIRED" };

  const [admin] = await db
    .select()
    .from(admins)
    .where(and(eq(admins.auth_user_id, sub), eq(admins.status, "active")))
    .limit(1);

  if (!admin) return { ok: false, code: "ADMIN_FORBIDDEN" };

  return {
    ok: true,
    ctx: {
      admin,
      authUserId: sub,
      email: admin.email,
      aal,
    },
  };
}

/** Soft check for /auth/check — does not require aal2. */
export async function peekAdminSession(token: string | null): Promise<{
  authenticated: boolean;
  mfaRequired: boolean;
  email?: string;
  is_super?: boolean;
  adminId?: number;
}> {
  if (!token) {
    return { authenticated: false, mfaRequired: false };
  }

  let claims: VerifiedClaims;
  try {
    claims = await verifySupabaseAccessToken(token);
  } catch {
    return { authenticated: false, mfaRequired: false };
  }

  const sub = typeof claims.sub === "string" ? claims.sub : null;
  if (!sub || !hasAppRole(claims.app_metadata, "admin")) {
    return { authenticated: false, mfaRequired: false };
  }

  const [admin] = await db
    .select()
    .from(admins)
    .where(and(eq(admins.auth_user_id, sub), eq(admins.status, "active")))
    .limit(1);

  if (!admin) {
    return { authenticated: false, mfaRequired: false };
  }

  const aal = claims.aal === "aal2" ? "aal2" : "aal1";
  return {
    authenticated: aal === "aal2",
    mfaRequired: aal !== "aal2",
    email: admin.email,
    is_super: admin.is_super,
    adminId: admin.id,
  };
}

export async function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = extractBearerToken(req);
  if (!token) {
    return sendApiError(res, "ADMIN_AUTH_REQUIRED");
  }

  const result = await resolveActiveAdminFromToken(token);
  if (!result.ok) {
    return sendApiError(res, result.code);
  }

  req.adminAuth = result.ctx;
  next();
}

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.adminAuth?.admin.is_super) {
    return sendApiError(res, "ADMIN_SUPER_REQUIRED");
  }
  next();
}

export function normalizeAdminEmail(email: string): string {
  return String(email || "").trim().toLowerCase();
}
