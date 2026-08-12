import { apiFetch, API_ERRORS } from "./api";
import {
  signInWithPassword,
  signUpWithPassword,
  signOutEverywhere,
  setAccountType,
} from "./supabase";

/** Supabase returns this for both "no such user" and "wrong password". */
function isBadCredentials(error) {
  const msg = String(error?.message || "").toLowerCase();
  return (
    msg.includes("invalid login credentials") ||
    msg.includes("invalid credentials") ||
    error?.status === 400
  );
}

function isUnconfirmed(error) {
  return String(error?.message || "").toLowerCase().includes("email not confirmed");
}

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

  if (error && isBadCredentials(error)) {
    let migrated = false;
    try {
      const { data } = await apiFetch(
        "/api/auth/legacy-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, userType }),
        },
        "LOGIN_FAILED",
      );
      migrated = !!data?.migrated;
    } catch {
      // Fall through to the original error — never reveal which step failed.
    }
    if (migrated) {
      ({ error } = await signInWithPassword(email, password));
    }
  }

  if (error) {
    if (isUnconfirmed(error)) {
      throw new Error(
        "Please confirm your email address first — check your inbox for the link we sent.",
      );
    }
    throw new Error(API_ERRORS.LOGIN_FAILED.message);
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

  const { data: profile } = await apiFetch(
    "/api/auth/me",
    {},
    "PROFILE_LOAD_FAILED",
  );
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
    if (String(error.message || "").toLowerCase().includes("already registered")) {
      throw new Error(API_ERRORS.EMAIL_ALREADY_REGISTERED.message);
    }
    throw new Error(error.message || API_ERRORS.REGISTRATION_FAILED.message);
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
