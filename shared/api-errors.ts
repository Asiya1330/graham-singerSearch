/**
 * Central API error catalog — single source of truth for server responses and client display.
 * Responses use shape: { code: ApiErrorCode, message: string, field?: string, details?: string[] }
 *
 * Message style guide (keep new entries consistent):
 *  - Say what failed, in the user's terms — not the server's ("Couldn't save your
 *    profile", not "UPDATE returned 0 rows").
 *  - Say what to do next when there is something to do ("Please try again",
 *    "Pick a date on or after the start date").
 *  - One sentence, two at most. No stack traces, no internal identifiers.
 *  - Never reveal whether an account exists on credential failures.
 */

export type ApiErrorCode =
  // --- Admin access ---
  | "ADMIN_AUTH_REQUIRED"
  | "ADMIN_PASSWORD_NOT_CONFIGURED"
  | "ADMIN_INVALID_PASSWORD"
  | "ADMIN_MFA_REQUIRED"
  | "ADMIN_FORBIDDEN"
  | "ADMIN_SUPER_REQUIRED"
  | "ADMIN_INVITE_INVALID"
  | "ADMIN_APPROVE_FORBIDDEN"
  | "ADMIN_BOOTSTRAP_UNAUTHORIZED"
  // --- Authentication & accounts ---
  | "RATE_LIMITED"
  | "NOT_AUTHENTICATED"
  | "SINGER_ACCESS_REQUIRED"
  | "ORG_ACCESS_REQUIRED"
  | "ACCOUNT_TYPE_MISMATCH"
  | "EMAIL_PASSWORD_REQUIRED"
  | "EMAIL_USER_TYPE_REQUIRED"
  | "EMAIL_ALREADY_REGISTERED"
  | "INVALID_EMAIL"
  | "USER_NOT_FOUND"
  | "INVALID_PASSWORD"
  | "CURRENT_PASSWORD_INCORRECT"
  | "INVALID_USER_TYPE"
  | "LOGIN_FAILED"
  | "REGISTRATION_FAILED"
  | "LOGOUT_FAILED"
  | "INVALID_SESSION"
  | "PASSWORD_FIELDS_REQUIRED"
  // --- Records ---
  | "SINGER_NOT_FOUND"
  | "ORG_NOT_FOUND"
  | "ACCOUNT_NOT_FOUND"
  | "UPGRADE_REQUIRED"
  | "FORBIDDEN"
  | "NOT_RESOURCE_OWNER"
  // --- Password reset ---
  | "VALIDATION_FAILED"
  | "RESET_LINK_INVALID"
  | "PASSWORD_TOO_SHORT"
  | "RESET_TOKEN_REQUIRED"
  | "PASSWORD_RESET_FAILED"
  | "FORGOT_PASSWORD_FAILED"
  // --- Field-level validation ---
  | "REQUIRED_FIELDS_MISSING"
  | "INVALID_ID"
  | "INVALID_URL"
  | "BIO_TOO_LONG"
  | "DATE_RANGE_INVALID"
  | "DATE_IN_FUTURE"
  | "DATE_TOO_EARLY"
  | "INVALID_EXPERIENCE_DEPTH"
  | "INVALID_STATUS"
  | "INVALID_DURATION"
  // --- Repertoire ---
  | "ROLE_FIELDS_REQUIRED"
  | "WORK_TITLE_REQUIRED"
  | "ROLE_ALREADY_ADDED"
  | "WORK_ALREADY_ADDED"
  | "REPERTOIRE_SEARCH_FAILED"
  | "SEARCH_OPTIONS_FAILED"
  | "LOCATION_INCOMPLETE"
  | "LOCATION_NOT_FOUND"
  | "LOCATION_LOOKUP_UNAVAILABLE"
  // --- File uploads ---
  | "FILE_MISSING"
  | "FILE_TOO_LARGE"
  | "FILE_TYPE_INVALID"
  | "UPLOAD_FAILED"
  // --- Engagement feedback ---
  | "FEEDBACK_FIELDS_REQUIRED"
  | "FEEDBACK_ALREADY_SUBMITTED"
  // --- Billing & subscriptions ---
  | "BILLING_NOT_CONFIGURED"
  | "CHECKOUT_IN_PROGRESS"
  | "SUBSCRIPTION_ALREADY_ACTIVE"
  | "SUBSCRIPTION_ALREADY_FREE"
  | "BILLING_ACCOUNT_MISSING"
  | "SUBSCRIPTION_NOT_ACTIVE"
  | "SUBSCRIPTION_NOT_CANCELLING"
  | "SUBSCRIPTION_MANAGED_BY_PORTAL"
  | "PRO_UPGRADE_REQUIRES_CHECKOUT"
  | "ANNUAL_BILLING_UNAVAILABLE"
  | "CHECKOUT_FAILED"
  | "BILLING_PORTAL_FAILED"
  | "SUBSCRIPTION_SYNC_FAILED"
  | "SUBSCRIPTION_UPDATE_FAILED"
  | "PRICING_LOAD_FAILED"
  | "WEBHOOK_BODY_MISSING"
  | "WEBHOOK_SIGNATURE_INVALID"
  | "WEBHOOK_PROCESSING_FAILED"
  // --- Admin operations ---
  | "INVALID_ACCOUNT_TIER"
  | "INVALID_BADGE_FIELD"
  | "CREDIT_AMOUNT_INVALID"
  | "CREDIT_REASON_INVALID"
  | "CREDIT_BALANCE_NEGATIVE"
  | "CREDIT_LIMIT_BELOW_USED"
  // --- Infrastructure ---
  | "DUPLICATE_ENTRY"
  | "RELATED_RECORD_MISSING"
  | "RECORD_IN_USE"
  | "DATABASE_UNAVAILABLE"
  | "REQUEST_TIMEOUT"
  | "PAYLOAD_TOO_LARGE"
  | "SERVICE_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR"
  | "ENDPOINT_NOT_FOUND"
  // --- Feature-level fallbacks ---
  | "SEARCH_FAILED"
  | "CONTACT_REVEAL_FAILED"
  | "PROFILE_UPDATE_FAILED"
  | "PROFILE_LOAD_FAILED"
  | "OPERATION_FAILED";

export type ApiErrorDefinition = {
  status: number;
  message: string;
  /** Form field this error belongs to, when it maps to a single input. */
  field?: string;
};

export const API_ERRORS: Record<ApiErrorCode, ApiErrorDefinition> = {
  // --- Admin access ---
  ADMIN_AUTH_REQUIRED: {
    status: 401,
    message: "Please sign in with an admin account to continue.",
  },
  ADMIN_PASSWORD_NOT_CONFIGURED: {
    status: 500,
    message:
      "Admin access hasn't been set up on this server yet. Please contact support.",
  },
  ADMIN_INVALID_PASSWORD: {
    status: 401,
    message: "That admin password is incorrect. Please try again.",
    field: "password",
  },
  ADMIN_MFA_REQUIRED: {
    status: 403,
    message:
      "Admin accounts need two-factor authentication. Please set it up, then sign in again.",
  },
  ADMIN_FORBIDDEN: {
    status: 403,
    message: "This account doesn't have admin access.",
  },
  ADMIN_SUPER_REQUIRED: {
    status: 403,
    message: "Only super admins can add, approve, or remove other admins.",
  },
  ADMIN_INVITE_INVALID: {
    status: 400,
    message: "This admin invite has already been used, or it no longer exists.",
  },
  ADMIN_APPROVE_FORBIDDEN: {
    status: 403,
    message:
      "You can't approve or reject an invite you created. Ask another super admin to review it.",
  },
  ADMIN_BOOTSTRAP_UNAUTHORIZED: {
    status: 401,
    message: "That bootstrap secret doesn't match the one configured on this server.",
  },

  // --- Authentication & accounts ---
  RATE_LIMITED: {
    status: 429,
    message:
      "Too many attempts from this device. Please wait a few minutes before trying again.",
  },
  NOT_AUTHENTICATED: {
    status: 401,
    message: "Your session has ended. Please sign in again to continue.",
  },
  SINGER_ACCESS_REQUIRED: {
    status: 403,
    message: "This page is for singer accounts. Sign in with your singer login to continue.",
  },
  ORG_ACCESS_REQUIRED: {
    status: 403,
    message:
      "This page is for organization accounts. Sign in with your organization login to continue.",
  },
  ACCOUNT_TYPE_MISMATCH: {
    status: 403,
    message:
      "This email is registered under a different account type. Try the other login, or register the account you need.",
  },
  EMAIL_PASSWORD_REQUIRED: {
    status: 400,
    message: "Please enter both your email address and password.",
  },
  EMAIL_USER_TYPE_REQUIRED: {
    status: 400,
    message: "Please enter your email address and choose an account type.",
  },
  EMAIL_ALREADY_REGISTERED: {
    status: 409,
    message: "An account already uses this email. Sign in instead, or reset your password.",
    field: "email",
  },
  INVALID_EMAIL: {
    status: 400,
    message: "That email address doesn't look right. Please check it and try again.",
    field: "email",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "We couldn't find an account with that email. Please register first.",
    field: "email",
  },
  INVALID_PASSWORD: {
    // Returned for unknown-account and wrong-password alike, so the copy must
    // stay neutral about which one it was.
    status: 400,
    message: "That email and password combination doesn't match. Please check both and try again.",
    field: "password",
  },
  CURRENT_PASSWORD_INCORRECT: {
    status: 400,
    message: "Your current password is incorrect. Please re-enter it and try again.",
    field: "currentPassword",
  },
  INVALID_USER_TYPE: {
    status: 400,
    message: "Please choose a valid account type — either singer or organization.",
    field: "userType",
  },
  LOGIN_FAILED: {
    status: 500,
    message: "We couldn't sign you in just now. Please try again in a moment.",
  },
  REGISTRATION_FAILED: {
    status: 500,
    message:
      "We couldn't finish creating your account. Please try again — no charge was made.",
  },
  LOGOUT_FAILED: {
    status: 500,
    message: "We couldn't sign you out. Please refresh the page and try again.",
  },
  INVALID_SESSION: {
    status: 400,
    message: "Your session is no longer valid. Please sign in again.",
  },
  PASSWORD_FIELDS_REQUIRED: {
    status: 400,
    message: "Please enter both your current password and your new password.",
  },

  // --- Records ---
  SINGER_NOT_FOUND: {
    status: 404,
    message: "We couldn't find that singer profile. It may have been removed.",
  },
  ORG_NOT_FOUND: {
    status: 404,
    message: "We couldn't find that organization profile. It may have been removed.",
  },
  ACCOUNT_NOT_FOUND: {
    status: 404,
    message: "We couldn't find that account. It may have been removed.",
  },
  UPGRADE_REQUIRED: {
    status: 403,
    message: "This feature is part of Pro. Upgrade your plan to use it.",
  },
  FORBIDDEN: {
    status: 403,
    message: "You don't have permission to do that.",
  },
  NOT_RESOURCE_OWNER: {
    status: 403,
    message: "This entry belongs to another account, so you can't change it.",
  },

  // --- Password reset ---
  VALIDATION_FAILED: {
    status: 400,
    message: "Some of the details below need fixing. Please review and try again.",
  },
  RESET_LINK_INVALID: {
    status: 400,
    message:
      "This password reset link has expired or was already used. Please request a new one.",
  },
  PASSWORD_TOO_SHORT: {
    status: 400,
    message: "Please choose a password with at least 8 characters.",
    field: "password",
  },
  RESET_TOKEN_REQUIRED: {
    status: 400,
    message:
      "This reset request is incomplete. Please open the link from your email again.",
  },
  PASSWORD_RESET_FAILED: {
    status: 500,
    message: "We couldn't reset your password. Please request a new reset link and try again.",
  },
  FORGOT_PASSWORD_FAILED: {
    status: 500,
    message: "We couldn't send your reset email. Please try again in a moment.",
  },

  // --- Field-level validation ---
  REQUIRED_FIELDS_MISSING: {
    status: 400,
    message: "Some required fields are still empty. Please fill them in and try again.",
  },
  INVALID_ID: {
    status: 400,
    message: "That record reference isn't valid. Please go back and try again.",
  },
  INVALID_URL: {
    status: 400,
    message: "Links must start with http:// or https://.",
  },
  BIO_TOO_LONG: {
    status: 400,
    message: "Your bio is over the 1,700 character limit. Please shorten it.",
    field: "bio",
  },
  DATE_RANGE_INVALID: {
    status: 400,
    message: "The end date must be on or after the start date.",
    field: "endDate",
  },
  DATE_IN_FUTURE: {
    status: 400,
    message: "The last performed date can't be in the future.",
    field: "lastPerformed",
  },
  DATE_TOO_EARLY: {
    status: 400,
    message: "The last performed date can't be before 1900.",
    field: "lastPerformed",
  },
  INVALID_EXPERIENCE_DEPTH: {
    status: 400,
    message: "Please choose one of the listed experience levels.",
    field: "experienceDepth",
  },
  INVALID_STATUS: {
    status: 400,
    message: "Please choose one of the listed statuses.",
    field: "status",
  },
  INVALID_DURATION: {
    status: 400,
    message: "Please pick a valid duration, or choose a custom end date.",
    field: "duration",
  },

  // --- Repertoire ---
  ROLE_FIELDS_REQUIRED: {
    status: 400,
    message: "Please enter both the role name and the work it comes from.",
  },
  WORK_TITLE_REQUIRED: {
    status: 400,
    message: "Please enter the title of the work.",
    field: "workTitle",
  },
  ROLE_ALREADY_ADDED: {
    status: 409,
    message: "This role is already in your repertoire. Edit the existing entry instead.",
  },
  WORK_ALREADY_ADDED: {
    status: 409,
    message: "This work is already in your repertoire. Edit the existing entry instead.",
  },
  REPERTOIRE_SEARCH_FAILED: {
    status: 500,
    message: "We couldn't search the repertoire catalog. Please try again in a moment.",
  },
  SEARCH_OPTIONS_FAILED: {
    status: 500,
    message: "We couldn't load the search filters. Please refresh the page to try again.",
  },
  LOCATION_INCOMPLETE: {
    status: 400,
    message: "Please enter both a city and a state to search by location.",
    field: "location",
  },
  LOCATION_NOT_FOUND: {
    status: 422,
    message: "We couldn't find that city and state. Please check the spelling and try again.",
    field: "location",
  },
  LOCATION_LOOKUP_UNAVAILABLE: {
    status: 503,
    message: "Location search is temporarily unavailable. Please search without a location for now.",
    field: "location",
  },

  // --- File uploads ---
  FILE_MISSING: {
    status: 400,
    message: "No file was received. Please choose a file and try again.",
  },
  FILE_TOO_LARGE: {
    status: 413,
    message: "That file is too large. Please upload a file under 4MB.",
  },
  FILE_TYPE_INVALID: {
    status: 400,
    message: "That file type isn't supported. Please check the accepted formats and try again.",
  },
  UPLOAD_FAILED: {
    status: 500,
    message: "We couldn't upload your file. Please try again in a moment.",
  },

  // --- Engagement feedback ---
  FEEDBACK_FIELDS_REQUIRED: {
    status: 400,
    message: "Please choose a singer, a role, and the engagement date.",
  },
  FEEDBACK_ALREADY_SUBMITTED: {
    status: 409,
    message: "You've already rated this singer for that engagement date.",
  },

  // --- Billing & subscriptions ---
  BILLING_NOT_CONFIGURED: {
    status: 503,
    message: "Payments aren't available right now. Please try again later or contact support.",
  },
  CHECKOUT_IN_PROGRESS: {
    status: 429,
    message:
      "A checkout is already open. Finish or close that one before starting another.",
  },
  SUBSCRIPTION_ALREADY_ACTIVE: {
    status: 400,
    message: "You already have an active subscription. Manage it from your billing settings.",
  },
  SUBSCRIPTION_ALREADY_FREE: {
    status: 400,
    message: "You already have free Pro access, so there's nothing to pay for.",
  },
  BILLING_ACCOUNT_MISSING: {
    status: 400,
    message: "There's no billing account on file yet. Subscribe to Pro to create one.",
  },
  SUBSCRIPTION_NOT_ACTIVE: {
    status: 400,
    message: "There's no active subscription to cancel.",
  },
  SUBSCRIPTION_NOT_CANCELLING: {
    status: 400,
    message: "There's no cancelled subscription to resume.",
  },
  SUBSCRIPTION_MANAGED_BY_PORTAL: {
    status: 409,
    message:
      "This plan is billed through Stripe. Open the billing portal to cancel at the end of your period.",
  },
  PRO_UPGRADE_REQUIRES_CHECKOUT: {
    status: 403,
    message: "Upgrading to Pro needs a payment. Start checkout from the pricing page.",
  },
  ANNUAL_BILLING_UNAVAILABLE: {
    status: 503,
    message: "Annual billing isn't available yet. Please choose monthly billing for now.",
  },
  CHECKOUT_FAILED: {
    status: 500,
    message: "We couldn't open checkout. Please try again — you haven't been charged.",
  },
  BILLING_PORTAL_FAILED: {
    status: 500,
    message: "We couldn't open your billing portal. Please try again in a moment.",
  },
  SUBSCRIPTION_SYNC_FAILED: {
    status: 500,
    message:
      "We couldn't refresh your subscription status. Your plan hasn't changed — please try again.",
  },
  SUBSCRIPTION_UPDATE_FAILED: {
    status: 500,
    message:
      "We couldn't update your subscription. Please try again, or check your billing portal.",
  },
  PRICING_LOAD_FAILED: {
    status: 500,
    message: "We couldn't load current pricing. Please refresh the page to try again.",
  },
  WEBHOOK_BODY_MISSING: {
    status: 400,
    message: "The webhook request had no body to verify.",
  },
  WEBHOOK_SIGNATURE_INVALID: {
    status: 400,
    message: "The webhook signature didn't verify against the configured signing secret.",
  },
  WEBHOOK_PROCESSING_FAILED: {
    status: 500,
    message: "The webhook was verified but could not be processed.",
  },

  // --- Admin operations ---
  INVALID_ACCOUNT_TIER: {
    status: 400,
    message: "Account tier must be either 'free' or 'pro'.",
    field: "tier",
  },
  INVALID_BADGE_FIELD: {
    status: 400,
    message: "That isn't a badge that can be changed.",
  },
  CREDIT_AMOUNT_INVALID: {
    status: 400,
    message: "Credit adjustments must be a whole number other than zero.",
    field: "amount",
  },
  CREDIT_REASON_INVALID: {
    status: 400,
    message: "Please choose one of the listed reasons for this adjustment.",
    field: "reason",
  },
  CREDIT_BALANCE_NEGATIVE: {
    status: 400,
    message: "That adjustment would push the credit balance below zero.",
    field: "amount",
  },
  CREDIT_LIMIT_BELOW_USED: {
    status: 400,
    message:
      "That adjustment would set the credit limit below what's already been used this month.",
    field: "amount",
  },

  // --- Infrastructure ---
  DUPLICATE_ENTRY: {
    status: 409,
    message: "That entry already exists. Please edit the existing one instead of adding a duplicate.",
  },
  RELATED_RECORD_MISSING: {
    status: 400,
    message: "This is linked to a record that no longer exists. Please refresh and try again.",
  },
  RECORD_IN_USE: {
    status: 409,
    message: "This can't be removed while other records still reference it.",
  },
  DATABASE_UNAVAILABLE: {
    status: 503,
    message:
      "We can't reach the database right now. Your changes weren't saved — please try again shortly.",
  },
  REQUEST_TIMEOUT: {
    status: 504,
    message: "That request took too long and was stopped. Please try again.",
  },
  PAYLOAD_TOO_LARGE: {
    status: 413,
    message: "That request is too large to process. Please reduce the amount of data and retry.",
  },
  SERVICE_UNAVAILABLE: {
    status: 503,
    message: "This service is temporarily unavailable. Please try again in a few minutes.",
  },
  NETWORK_ERROR: {
    status: 0,
    message: "We couldn't reach the server. Please check your internet connection and try again.",
  },
  INTERNAL_ERROR: {
    status: 500,
    message:
      "The server hit an unexpected problem and couldn't finish. Please try again — contact support if it keeps happening.",
  },
  ENDPOINT_NOT_FOUND: {
    status: 404,
    message: "That endpoint doesn't exist. Please refresh the page to load the latest version.",
  },

  // --- Feature-level fallbacks ---
  SEARCH_FAILED: {
    status: 500,
    message: "We couldn't run that search. Please adjust your filters and try again.",
  },
  CONTACT_REVEAL_FAILED: {
    status: 500,
    message: "We couldn't reveal those contact details. No credit was used — please try again.",
  },
  PROFILE_UPDATE_FAILED: {
    status: 500,
    message: "We couldn't save your changes. Your profile is unchanged — please try again.",
  },
  PROFILE_LOAD_FAILED: {
    status: 500,
    message: "We couldn't load your profile. Please refresh the page to try again.",
  },
  OPERATION_FAILED: {
    status: 500,
    message: "We couldn't complete that action. Please try again in a moment.",
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
  "Internal Server Error": "INTERNAL_ERROR",
  "Internal server error": "INTERNAL_ERROR",
  "Failed to fetch": "NETWORK_ERROR",
  "Load failed": "NETWORK_ERROR",
  "Not your role": "NOT_RESOURCE_OWNER",
  "Not your work": "NOT_RESOURCE_OWNER",
  "Not your availability": "NOT_RESOURCE_OWNER",
  "Upload failed": "UPLOAD_FAILED",
  "No file uploaded": "FILE_MISSING",
};

export type ApiErrorBody = {
  code: ApiErrorCode;
  message: string;
  /** Form field to highlight, when the error maps to a single input. */
  field?: string;
  /** Per-field problems, for multi-field validation failures. */
  details?: string[];
};

export type ApiErrorOptions = {
  /** Replaces the catalog message. Use when a specific value makes it clearer. */
  message?: string;
  /** Overrides the catalog's default field. */
  field?: string;
  details?: string[];
};

function toOptions(input?: string | ApiErrorOptions): ApiErrorOptions {
  if (typeof input === "string") return { message: input };
  return input ?? {};
}

export function getApiError(
  code: ApiErrorCode,
  overrides?: string | ApiErrorOptions,
): ApiErrorBody {
  const def = API_ERRORS[code];
  const opts = toOptions(overrides);
  const body: ApiErrorBody = {
    code,
    message: opts.message ?? def.message,
  };
  const field = opts.field ?? def.field;
  if (field) body.field = field;
  if (opts.details?.length) body.details = opts.details;
  return body;
}

/**
 * Turns any API error payload into a message worth showing a user. Prefers the
 * server's own message, falls back through the legacy alias table, and only
 * lands on the generic fallback when nothing better is available.
 */
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
    const message =
      typeof body.message === "string" && body.message.trim()
        ? body.message
        : API_ERRORS[code].message;
    return appendDetails(message, body.details);
  }

  const rawMessage =
    (typeof body.message === "string" && body.message) ||
    (typeof body.error === "string" && body.error) ||
    "";

  if (rawMessage && LEGACY_MESSAGE_ALIASES[rawMessage]) {
    return API_ERRORS[LEGACY_MESSAGE_ALIASES[rawMessage]].message;
  }

  if (rawMessage) return appendDetails(rawMessage, body.details);
  return API_ERRORS[fallbackCode].message;
}

function appendDetails(message: string, details: unknown): string {
  if (!Array.isArray(details) || details.length === 0) return message;
  const clean = details.filter((d): d is string => typeof d === "string" && !!d.trim());
  if (clean.length === 0) return message;
  return `${message} (${clean.join("; ")})`;
}

/** Field to highlight for a given error payload, when the server named one. */
export function resolveApiErrorField(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const body = payload as Record<string, unknown>;
  if (typeof body.field === "string" && body.field) return body.field;
  const code = typeof body.code === "string" ? (body.code as ApiErrorCode) : undefined;
  return code ? API_ERRORS[code]?.field : undefined;
}
