/**
 * Central API error catalog — single source of truth for server responses and client display.
 * Responses use shape: { code: ApiErrorCode, message: string }
 */

export type ApiErrorCode =
  | "ADMIN_AUTH_REQUIRED"
  | "ADMIN_PASSWORD_NOT_CONFIGURED"
  | "ADMIN_INVALID_PASSWORD"
  | "NOT_AUTHENTICATED"
  | "SINGER_ACCESS_REQUIRED"
  | "ORG_ACCESS_REQUIRED"
  | "EMAIL_PASSWORD_REQUIRED"
  | "EMAIL_USER_TYPE_REQUIRED"
  | "EMAIL_ALREADY_REGISTERED"
  | "USER_NOT_FOUND"
  | "INVALID_PASSWORD"
  | "CURRENT_PASSWORD_INCORRECT"
  | "INVALID_USER_TYPE"
  | "LOGIN_FAILED"
  | "REGISTRATION_FAILED"
  | "LOGOUT_FAILED"
  | "INVALID_SESSION"
  | "SINGER_NOT_FOUND"
  | "ORG_NOT_FOUND"
  | "ACCOUNT_NOT_FOUND"
  | "UPGRADE_REQUIRED"
  | "FORBIDDEN"
  | "VALIDATION_FAILED"
  | "RESET_LINK_INVALID"
  | "PASSWORD_TOO_SHORT"
  | "RESET_TOKEN_REQUIRED"
  | "PASSWORD_RESET_FAILED"
  | "FORGOT_PASSWORD_FAILED"
  | "SERVICE_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR"
  | "SEARCH_FAILED"
  | "CONTACT_REVEAL_FAILED"
  | "PROFILE_UPDATE_FAILED"
  | "PROFILE_LOAD_FAILED"
  | "OPERATION_FAILED";

export type ApiErrorDefinition = {
  status: number;
  message: string;
};

export const API_ERRORS: Record<ApiErrorCode, ApiErrorDefinition> = {
  ADMIN_AUTH_REQUIRED: {
    status: 401,
    message: "Admin authentication required.",
  },
  ADMIN_PASSWORD_NOT_CONFIGURED: {
    status: 500,
    message: "Admin access is not configured. Contact support.",
  },
  ADMIN_INVALID_PASSWORD: {
    status: 401,
    message: "Incorrect admin password. Please try again.",
  },
  NOT_AUTHENTICATED: {
    status: 401,
    message: "Please sign in to continue.",
  },
  SINGER_ACCESS_REQUIRED: {
    status: 403,
    message: "This action requires a singer account.",
  },
  ORG_ACCESS_REQUIRED: {
    status: 403,
    message: "This action requires an organization account.",
  },
  EMAIL_PASSWORD_REQUIRED: {
    status: 400,
    message: "Email and password are required.",
  },
  EMAIL_USER_TYPE_REQUIRED: {
    status: 400,
    message: "Email and account type are required.",
  },
  EMAIL_ALREADY_REGISTERED: {
    status: 409,
    message: "An account with this email already exists. Try signing in instead.",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "No account found with that email. Please register first.",
  },
  INVALID_PASSWORD: {
    status: 400,
    message: "Incorrect password. Please try again.",
  },
  CURRENT_PASSWORD_INCORRECT: {
    status: 400,
    message: "Your current password is incorrect.",
  },
  INVALID_USER_TYPE: {
    status: 400,
    message: "Invalid account type.",
  },
  LOGIN_FAILED: {
    status: 500,
    message: "Sign in failed. Please try again.",
  },
  REGISTRATION_FAILED: {
    status: 500,
    message: "Registration failed. Please try again.",
  },
  LOGOUT_FAILED: {
    status: 500,
    message: "Sign out failed. Please try again.",
  },
  INVALID_SESSION: {
    status: 400,
    message: "Your session is invalid. Please sign in again.",
  },
  SINGER_NOT_FOUND: {
    status: 404,
    message: "Singer profile not found.",
  },
  ORG_NOT_FOUND: {
    status: 404,
    message: "Organization profile not found.",
  },
  ACCOUNT_NOT_FOUND: {
    status: 404,
    message: "Account not found.",
  },
  UPGRADE_REQUIRED: {
    status: 403,
    message: "A Pro subscription is required for this feature.",
  },
  FORBIDDEN: {
    status: 403,
    message: "You do not have permission to perform this action.",
  },
  VALIDATION_FAILED: {
    status: 400,
    message: "Please check your input and try again.",
  },
  RESET_LINK_INVALID: {
    status: 400,
    message: "This password reset link is invalid or has expired.",
  },
  PASSWORD_TOO_SHORT: {
    status: 400,
    message: "Password must be at least 8 characters.",
  },
  RESET_TOKEN_REQUIRED: {
    status: 400,
    message: "Reset token, password, and account type are required.",
  },
  PASSWORD_RESET_FAILED: {
    status: 500,
    message: "Could not reset your password. Please try again.",
  },
  FORGOT_PASSWORD_FAILED: {
    status: 500,
    message: "Could not process your password reset request. Please try again.",
  },
  SERVICE_UNAVAILABLE: {
    status: 503,
    message: "The service is temporarily unavailable. Please try again in a moment.",
  },
  NETWORK_ERROR: {
    status: 0,
    message: "Network error. Please check your connection and try again.",
  },
  INTERNAL_ERROR: {
    status: 500,
    message: "Something went wrong. Please try again.",
  },
  SEARCH_FAILED: {
    status: 500,
    message: "Search failed. Please try again.",
  },
  CONTACT_REVEAL_FAILED: {
    status: 500,
    message: "Could not reveal contact information. Please try again.",
  },
  PROFILE_UPDATE_FAILED: {
    status: 500,
    message: "Could not save your profile. Please try again.",
  },
  PROFILE_LOAD_FAILED: {
    status: 500,
    message: "Could not load your profile. Please try again.",
  },
  OPERATION_FAILED: {
    status: 500,
    message: "The operation failed. Please try again.",
  },
};

/** Legacy or infrastructure messages mapped to user-friendly catalog entries. */
export const LEGACY_MESSAGE_ALIASES: Record<string, ApiErrorCode> = {
  "Failed to reach Railway API": "SERVICE_UNAVAILABLE",
  "Invalid credentials": "INVALID_PASSWORD",
  "Not authenticated": "NOT_AUTHENTICATED",
  "Admin authentication required": "ADMIN_AUTH_REQUIRED",
  "Singer access required": "SINGER_ACCESS_REQUIRED",
  "Organization access required": "ORG_ACCESS_REQUIRED",
  "Singer not found": "SINGER_NOT_FOUND",
  "Organization not found": "ORG_NOT_FOUND",
  "Account not found": "ACCOUNT_NOT_FOUND",
  "Login failed": "LOGIN_FAILED",
  "Registration failed": "REGISTRATION_FAILED",
  "Search failed": "SEARCH_FAILED",
};

export type ApiErrorBody = {
  code: ApiErrorCode;
  message: string;
};

export function getApiError(code: ApiErrorCode, overrideMessage?: string): ApiErrorBody {
  const def = API_ERRORS[code];
  return {
    code,
    message: overrideMessage ?? def.message,
  };
}

export function resolveApiErrorMessage(
  payload: unknown,
  fallbackCode: ApiErrorCode = "OPERATION_FAILED",
): string {
  if (!payload || typeof payload !== "object") {
    return API_ERRORS[fallbackCode].message;
  }

  const body = payload as Record<string, unknown>;
  const code = typeof body.code === "string" ? (body.code as ApiErrorCode) : undefined;
  if (code && API_ERRORS[code]) {
    return typeof body.message === "string" ? body.message : API_ERRORS[code].message;
  }

  const rawMessage =
    (typeof body.message === "string" && body.message) ||
    (typeof body.error === "string" && body.error) ||
    "";

  if (rawMessage && LEGACY_MESSAGE_ALIASES[rawMessage]) {
    return API_ERRORS[LEGACY_MESSAGE_ALIASES[rawMessage]].message;
  }

  if (rawMessage) return rawMessage;
  return API_ERRORS[fallbackCode].message;
}
