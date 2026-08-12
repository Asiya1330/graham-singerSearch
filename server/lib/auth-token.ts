import type { Request } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { getSupabaseJwtSecret, getSupabaseUrl } from "./env";

/**
 * Shared Supabase access-token plumbing for every audience (admin, singer,
 * organization). Role and profile decisions live in auth-admin.ts / auth-user.ts —
 * this module only answers "is this a valid token from our Auth project, and
 * what does it claim?".
 */

export type VerifiedClaims = JWTPayload & {
  email?: string;
  aal?: string;
  app_metadata?: {
    role?: string;
    roles?: string[];
    [key: string]: unknown;
  };
  role?: string;
};

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwtSecretKey: Uint8Array | null = null;

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`${getSupabaseUrl()}/auth/v1/.well-known/jwks.json`),
    );
  }
  return jwks;
}

function getHsKey(): Uint8Array | null {
  const secret = getSupabaseJwtSecret();
  if (!secret) return null;
  if (!jwtSecretKey) {
    jwtSecretKey = new TextEncoder().encode(secret);
  }
  return jwtSecretKey;
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export async function verifySupabaseAccessToken(
  token: string,
): Promise<VerifiedClaims> {
  const issuer = `${getSupabaseUrl()}/auth/v1`;
  const errors: unknown[] = [];

  const hsKey = getHsKey();
  if (hsKey) {
    try {
      const { payload } = await jwtVerify(token, hsKey, {
        issuer,
        audience: "authenticated",
        algorithms: ["HS256"],
      });
      return payload as VerifiedClaims;
    } catch (err) {
      errors.push(err);
    }
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer,
      audience: "authenticated",
      algorithms: ["RS256", "ES256"],
    });
    return payload as VerifiedClaims;
  } catch (err) {
    errors.push(err);
  }

  throw errors[errors.length - 1] ?? new Error("Invalid access token");
}

/** Verified `sub` (the Supabase Auth user id), or null if the token is not usable. */
export async function authUserIdFromToken(
  token: string | null,
): Promise<string | null> {
  if (!token) return null;
  try {
    const claims = await verifySupabaseAccessToken(token);
    return typeof claims.sub === "string" ? claims.sub : null;
  } catch {
    return null;
  }
}
