import { API_ERRORS, type ApiErrorCode } from "./api-errors";

/**
 * Where the Auth provider error happened. Same GoTrue payload means different
 * catalog codes (wrong password on login vs a stale recovery session).
 */
export type AuthErrorContext =
  | "login"
  | "register"
  | "reset"
  | "admin"
  | "password";

const FALLBACK: Record<AuthErrorContext, ApiErrorCode> = {
  login: "LOGIN_FAILED",
  register: "REGISTRATION_FAILED",
  reset: "PASSWORD_RESET_FAILED",
  admin: "LOGIN_FAILED",
  password: "OPERATION_FAILED",
};

function textOf(error: unknown): { code: string; message: string; status: number } {
  if (!error || typeof error !== "object") {
    return { code: "", message: String(error || ""), status: 0 };
  }
  const err = error as { code?: unknown; message?: unknown; status?: unknown };
  return {
    code: String(err.code || "").toLowerCase(),
    message: String(err.message || "").toLowerCase(),
    status: typeof err.status === "number" ? err.status : 0,
  };
}

function isNetwork(message: string, status: number): boolean {
  if (status === 0 && /failed to fetch|networkerror|load failed|offline/.test(message)) {
    return true;
  }
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed")
  );
}

/**
 * Map a Supabase / GoTrue error onto a catalog code.
 *
 * Never return the provider's raw string — those are written for developers
 * ("Invalid login credentials") and the toast was showing LOGIN_FAILED (a 500
 * outage message) for ordinary typos.
 */
export function mapAuthProviderError(
  error: unknown,
  context: AuthErrorContext,
): ApiErrorCode {
  const { code, message, status } = textOf(error);

  if (isNetwork(message, status)) return "NETWORK_ERROR";

  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit" ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("for security purposes") ||
    status === 429
  ) {
    return "RATE_LIMITED";
  }

  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "EMAIL_NOT_CONFIRMED";
  }

  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("user already registered")
  ) {
    return "EMAIL_ALREADY_REGISTERED";
  }

  if (
    code === "weak_password" ||
    message.includes("password should be at least") ||
    message.includes("password is too short") ||
    message.includes("at least 6 characters") ||
    message.includes("at least 8 characters")
  ) {
    return "PASSWORD_TOO_SHORT";
  }

  if (
    code === "same_password" ||
    message.includes("should be different from the old password") ||
    message.includes("different from the old password")
  ) {
    return "PASSWORD_UNCHANGED";
  }

  if (
    code === "invalid_email" ||
    message.includes("unable to validate email") ||
    (code === "validation_failed" && message.includes("email")) ||
    (message.includes("invalid email") && !message.includes("password"))
  ) {
    return "INVALID_EMAIL";
  }

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return context === "admin" ? "ADMIN_INVALID_PASSWORD" : "INVALID_PASSWORD";
  }

  if (
    code === "session_not_found" ||
    code === "bad_jwt" ||
    code === "user_not_found" ||
    message.includes("session") && (message.includes("expired") || message.includes("missing")) ||
    message.includes("auth session missing")
  ) {
    if (context === "reset") return "RESET_LINK_INVALID";
    return "INVALID_SESSION";
  }

  if (
    code === "mfa_verification_failed" ||
    message.includes("invalid totp") ||
    message.includes("invalid code") ||
    (context === "admin" && message.includes("expired"))
  ) {
    return "MFA_CODE_INVALID";
  }

  return FALLBACK[context];
}

export function messageFromAuthProviderError(
  error: unknown,
  context: AuthErrorContext,
): string {
  return API_ERRORS[mapAuthProviderError(error, context)].message;
}

export function isCredentialRejection(error: unknown): boolean {
  const code = mapAuthProviderError(error, "login");
  return code === "INVALID_PASSWORD";
}
