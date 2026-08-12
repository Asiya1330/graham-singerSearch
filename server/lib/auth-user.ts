import type { Request, Response, NextFunction } from "express";
import type { Singer, Organization } from "@shared/schema";
import { storage } from "../storage";
import { sendApiError } from "./api-response";
import { hasAppRole, rolesFromAppMetadata } from "./auth-roles";
import {
  extractBearerToken,
  verifySupabaseAccessToken,
  type VerifiedClaims,
} from "./auth-token";

export type AccountType = "singer" | "organization";

export type UserAuthContext = {
  id: number;
  type: AccountType;
  authUserId: string;
  email: string;
  roles: string[];
  profile: Singer | Organization;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: UserAuthContext;
    }
  }
}

/**
 * Resolve the singer/organization profile a Bearer token belongs to.
 *
 * A single Auth user can legitimately hold both roles (and `admin` on top), so
 * when the token carries both we disambiguate with the `X-Account-Type` header
 * the client sends, falling back to whichever profile exists.
 */
export async function resolveUserFromToken(
  token: string,
  preferred?: AccountType | null,
): Promise<UserAuthContext | null> {
  let claims: VerifiedClaims;
  try {
    claims = await verifySupabaseAccessToken(token);
  } catch {
    return null;
  }

  const sub = typeof claims.sub === "string" ? claims.sub : null;
  if (!sub) return null;

  const roles = rolesFromAppMetadata(claims.app_metadata);
  const canSing = hasAppRole(claims.app_metadata, "singer");
  const canOrg = hasAppRole(claims.app_metadata, "organization");
  if (!canSing && !canOrg) return null;

  // Try the preferred type first so a dual-role user lands where they asked.
  const order: AccountType[] =
    preferred === "organization"
      ? ["organization", "singer"]
      : preferred === "singer"
        ? ["singer", "organization"]
        : ["singer", "organization"];

  for (const type of order) {
    if (type === "singer" && !canSing) continue;
    if (type === "organization" && !canOrg) continue;

    const profile =
      type === "singer"
        ? await storage.getSingerByAuthUserId(sub)
        : await storage.getOrganizationByAuthUserId(sub);

    if (profile) {
      return {
        id: profile.id,
        type,
        authUserId: sub,
        email: profile.email,
        roles,
        profile,
      };
    }
  }

  // Token says they have a role but no profile row is linked yet — treat as
  // unauthenticated so /api/auth/finalize is the only way forward.
  return null;
}

function preferredTypeFrom(req: Request): AccountType | null {
  const header = String(req.headers["x-account-type"] || "").toLowerCase();
  if (header === "singer" || header === "organization") return header;
  return null;
}

/**
 * Populate req.authUser from a Bearer token. Falls back to the legacy
 * express-session cookie so in-flight sessions survive the cutover deploy.
 * Remove the fallback (and the `session` block in routes.ts) once traffic is
 * fully on Supabase tokens.
 */
export async function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.authUser) return next();

  const token = extractBearerToken(req);
  if (token) {
    const ctx = await resolveUserFromToken(token, preferredTypeFrom(req));
    if (ctx) {
      req.authUser = ctx;
      return next();
    }
  }

  // --- legacy session fallback (temporary) ---
  const sessionUserId = req.session?.userId;
  const sessionUserType = req.session?.userType;
  if (sessionUserId && (sessionUserType === "singer" || sessionUserType === "organization")) {
    const profile =
      sessionUserType === "singer"
        ? await storage.getSinger(sessionUserId)
        : await storage.getOrganization(sessionUserId);
    if (profile) {
      req.authUser = {
        id: profile.id,
        type: sessionUserType,
        authUserId: profile.auth_user_id || "",
        email: profile.email,
        roles: [sessionUserType],
        profile,
      };
    }
  }

  next();
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await attachUser(req, res, () => {});
  if (!req.authUser) {
    return sendApiError(res, "NOT_AUTHENTICATED");
  }
  next();
}

export function requireSinger(req: Request, res: Response, next: NextFunction) {
  if (req.authUser?.type !== "singer") {
    return sendApiError(res, "SINGER_ACCESS_REQUIRED");
  }
  next();
}

export function requireOrg(req: Request, res: Response, next: NextFunction) {
  if (req.authUser?.type !== "organization") {
    return sendApiError(res, "ORG_ACCESS_REQUIRED");
  }
  next();
}

/**
 * Id of the authenticated account. Only valid after requireAuth — every call
 * site is downstream of it, and throwing beats silently reading `undefined`
 * into a query that would then touch the wrong row.
 */
export function currentUserId(req: Request): number {
  const id = req.authUser?.id;
  if (id == null) {
    throw new Error("currentUserId() called without requireAuth");
  }
  return id;
}

export function currentUserType(req: Request): AccountType | undefined {
  return req.authUser?.type;
}
