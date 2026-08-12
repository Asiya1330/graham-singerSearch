import type { Singer, Organization } from "@shared/schema";
import { storage } from "../storage";
import { getSupabaseAdmin } from "./supabase";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  getSupabaseAnonKey,
  getSiteUrl,
} from "./env";
import { grantAuthRole } from "./auth-roles";
import { HttpApiError } from "./api-response";
import type { AccountType } from "./auth-user";

export function normalizeEmail(email: unknown): string {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type AuthUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  app_metadata?: Record<string, unknown>;
};

/**
 * Look up an Auth user by email through the GoTrue admin REST API.
 *
 * The JS SDK's listUsers() only pages, which stops working once singers and
 * organizations share the Auth pool with admins — this filters server-side and
 * stays correct at any user count.
 */
export async function findAuthUserByEmail(
  email: string,
): Promise<AuthUser | null> {
  const key = getSupabaseServiceRoleKey();
  const url = new URL(`${getSupabaseUrl()}/auth/v1/admin/users`);
  url.searchParams.set("filter", email);
  url.searchParams.set("per_page", "50");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}`, apikey: key },
  });
  if (!res.ok) return null;

  const body = await res.json().catch(() => null);
  const users: AuthUser[] = Array.isArray(body) ? body : body?.users || [];
  return (
    users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) ||
    null
  );
}

/** True when Supabase is holding the account until the address is confirmed. */
export function needsEmailConfirmation(user: AuthUser | null): boolean {
  return !!user && !user.email_confirmed_at;
}

/**
 * Attach the Auth user the client just created via signUp() to a new profile
 * row, and grant the matching role. Returns null if no such Auth user exists,
 * which means the client skipped signUp and the request should be rejected.
 */
export async function linkNewAuthUser(
  email: string,
  type: AccountType,
): Promise<{ authUserId: string; confirmationRequired: boolean }> {
  const user = await findAuthUserByEmail(email);
  if (!user) {
    throw new HttpApiError(
      "REGISTRATION_FAILED",
      "We could not find the sign-up for that email. Please try registering again.",
    );
  }

  const existing =
    type === "singer"
      ? await storage.getSingerByAuthUserId(user.id)
      : await storage.getOrganizationByAuthUserId(user.id);
  if (existing) {
    throw new HttpApiError("EMAIL_ALREADY_REGISTERED");
  }

  await grantAuthRole(user.id, type);
  return {
    authUserId: user.id,
    confirmationRequired: needsEmailConfirmation(user),
  };
}

/**
 * Cutover path for accounts that predate Supabase Auth.
 *
 * Their scrypt hashes cannot be imported into Supabase, so instead: once the
 * legacy password has been verified locally, mint the Auth user with that same
 * password, link it, and drop the local hash. The user never notices, and the
 * account is fully on Supabase from the next request onward.
 */
export async function linkLegacyAccount(
  type: AccountType,
  profile: Singer | Organization,
  plaintextPassword: string,
): Promise<string> {
  const email = normalizeEmail(profile.email);
  const supabase = getSupabaseAdmin();

  let authUserId: string;
  const existing = await findAuthUserByEmail(email);

  if (existing) {
    // Auth user already there (e.g. they are also an admin, or a retried
    // migration) — reuse it and reset the password to the verified one.
    authUserId = existing.id;
    await supabase.auth.admin.updateUserById(authUserId, {
      password: plaintextPassword,
    });
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: plaintextPassword,
      // They proved ownership by knowing the existing password, and the address
      // already received mail from us — don't force a re-confirmation.
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new HttpApiError(
        "LOGIN_FAILED",
        error?.message || "Could not migrate this account to the new login system.",
      );
    }
    authUserId = data.user.id;
  }

  await grantAuthRole(authUserId, type);

  // Clear the legacy hash so this path runs exactly once per account.
  if (type === "singer") {
    await storage.updateSinger(profile.id, {
      auth_user_id: authUserId,
      password: null,
    });
  } else {
    await storage.updateOrganization(profile.id, {
      auth_user_id: authUserId,
      password: null,
    });
  }

  return authUserId;
}

/**
 * Confirm a password without minting a usable session.
 *
 * Supabase's admin update APIs don't re-check the old password, so the
 * "change password / change email" screens verify it here first by exchanging
 * the credentials at the token endpoint and discarding the result.
 */
export async function verifyAccountPassword(
  email: string,
  password: string,
): Promise<boolean> {
  const anonKey = getSupabaseAnonKey();
  if (!anonKey) {
    throw new HttpApiError(
      "OPERATION_FAILED",
      "SUPABASE_ANON_KEY is required to verify passwords.",
    );
  }

  const res = await fetch(
    `${getSupabaseUrl()}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: anonKey },
      body: JSON.stringify({ email, password }),
    },
  );
  return res.ok;
}

export async function changeAccountPassword(
  authUserId: string,
  newPassword: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(
    authUserId,
    { password: newPassword },
  );
  if (error) {
    throw new HttpApiError("OPERATION_FAILED", error.message);
  }
}

export async function changeAccountEmail(
  authUserId: string,
  newEmail: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(
    authUserId,
    { email: newEmail, email_confirm: true },
  );
  if (error) {
    throw new HttpApiError("OPERATION_FAILED", error.message);
  }
}

/** Supabase password-recovery email. Replaces the custom reset-token flow. */
export async function sendPasswordRecovery(email: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/reset-password`,
  });
}
