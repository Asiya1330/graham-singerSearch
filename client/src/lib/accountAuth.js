import { apiFetch, API_ERRORS } from "./api";
import {
  signInWithPassword,
  signUpWithPassword,
  signOutEverywhere,
  setAccountType,
} from "./supabase";
import {
  isCredentialRejection,
  messageFromAuthProviderError,
} from "@shared/auth-error-map";

function mismatchMessage(expectedType) {
  if (expectedType === "singer") {
    return "No singer account is linked to this email. Sign in as an organization, or register as a singer.";
  }
  return "No organization account is linked to this email. Sign in as a singer, or register as an organization.";
}

/**
 * Build app session state from `/api/auth/me` (or equivalent) payload.
 * Always trusts server `userType` — never invent singer/organization client-side.
 */
export function userFromProfile(profile) {
  const type = profile?.userType;
  if (type !== "singer" && type !== "organization") {
    throw new Error(API_ERRORS.INVALID_SESSION.message);
  }
  setAccountType(type);
  return { type, data: profile };
}

/**
 * Ensure the resolved profile matches the portal the user signed into.
 * On mismatch, clear the Supabase session so we do not leave a half-logged-in UI.
 */
async function requireMatchingAccountType(profile, expectedType) {
  if (profile?.userType !== expectedType) {
    await signOutEverywhere();
    const err = new Error(mismatchMessage(expectedType));
    err.code = "ACCOUNT_TYPE_MISMATCH";
    throw err;
  }
  setAccountType(profile.userType);
  return profile;
}

function rethrowIfNotCredentials(err) {
  const code = err?.code;
  if (
    code === "RATE_LIMITED" ||
    code === "NETWORK_ERROR" ||
    code === "SERVICE_UNAVAILABLE" ||
    code === "DATABASE_UNAVAILABLE"
  ) {
    throw err;
  }
}

/**
 * Sign in a singer or organization.
 *
 * Accounts created before the Supabase cutover have no Auth user yet, so a
 * failed sign-in falls through to /api/auth/legacy-login, which verifies the
 * old scrypt hash and mints the Auth user with the same password. The retry
 * then succeeds and the user never notices the difference.
 */
export async function loginAccount(email, password, userType) {
  if (userType !== "singer" && userType !== "organization") {
    throw new Error(API_ERRORS.INVALID_USER_TYPE.message);
  }

  let { error } = await signInWithPassword(email, password);

  if (error && isCredentialRejection(error)) {
    let migrated = false;
    try {
      const { data } = await apiFetch(
        "/api/auth/legacy-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, userType }),
        },
        "INVALID_PASSWORD",
      );
      migrated = !!data?.migrated;
    } catch (legacyErr) {
      rethrowIfNotCredentials(legacyErr);
    }
    if (migrated) {
      ({ error } = await signInWithPassword(email, password));
    }
  }

  if (error) {
    throw new Error(messageFromAuthProviderError(error, "login"));
  }

  // Hint the preferred profile before /api/auth/me; the response userType is authoritative.
  setAccountType(userType);

  try {
    await apiFetch(
      "/api/auth/session",
      { method: "POST" },
      "LOGIN_FAILED",
    );
  } catch {
    /* login_count bump is best-effort */
  }

  let profile;
  try {
    ({ data: profile } = await apiFetch(
      "/api/auth/me",
      {},
      "PROFILE_LOAD_FAILED",
    ));
  } catch (err) {
    // Supabase accepted the password, but this Auth user has no singer/org
    // profile. Drop the session so the UI does not look half-logged-in.
    await signOutEverywhere();
    throw err;
  }
  return requireMatchingAccountType(profile, userType);
}

/**
 * Register a singer or organization.
 *
 * signUp() first so Supabase sends the real confirmation email, then the
 * profile row. Returns { confirmationRequired: true } when the account is
 * waiting on that email — there is no session to load a profile with yet.
 */
export async function registerAccount(userType, { email, password, ...profile }) {
  if (userType !== "singer" && userType !== "organization") {
    throw new Error(API_ERRORS.INVALID_USER_TYPE.message);
  }

  const { data, error } = await signUpWithPassword(email, password);
  if (error) {
    throw new Error(messageFromAuthProviderError(error, "register"));
  }

  setAccountType(userType);

  const endpoint =
    userType === "singer"
      ? "/api/auth/register/singer"
      : "/api/auth/register/organization";

  let created;
  try {
    const res = await apiFetch(
      endpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...profile }),
      },
      "REGISTRATION_FAILED",
    );
    created = res.data;
  } catch (err) {
    // The Auth user exists but the profile does not — leaving the browser
    // signed in would strand them in a half-registered state.
    await signOutEverywhere();
    throw err;
  }

  // No session means Supabase is holding the account for email confirmation.
  const confirmationRequired =
    created?.confirmationRequired || !data?.session;
  if (confirmationRequired) {
    return { confirmationRequired: true, email };
  }

  const { data: prof } = await apiFetch("/api/auth/me", {}, "PROFILE_LOAD_FAILED");
  const matched = await requireMatchingAccountType(prof, userType);
  return { confirmationRequired: false, profile: matched };
}

export async function requestPasswordReset(email, userType) {
  await apiFetch(
    "/api/auth/forgot-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userType }),
    },
    "FORGOT_PASSWORD_FAILED",
  );
}

export async function logoutAccount() {
  await signOutEverywhere();
  try {
    await apiFetch("/api/auth/logout", { method: "POST" }, "LOGOUT_FAILED");
  } catch {
    /* the client session is already gone; the cookie teardown is best-effort */
  }
}
