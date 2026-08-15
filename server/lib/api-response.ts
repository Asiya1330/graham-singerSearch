import type { Response } from "express";
import {
  API_ERRORS,
  getApiError,
  type ApiErrorCode,
  type ApiErrorOptions,
} from "@shared/api-errors";

export class HttpApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly field?: string;
  readonly details?: string[];

  constructor(code: ApiErrorCode, overrides?: string | ApiErrorOptions) {
    const def = API_ERRORS[code];
    const opts = typeof overrides === "string" ? { message: overrides } : overrides ?? {};
    super(opts.message ?? def.message);
    this.name = "HttpApiError";
    this.code = code;
    this.status = def.status;
    this.field = opts.field ?? def.field;
    this.details = opts.details;
  }
}

/**
 * Guards against a non-catalog value reaching the response layer — several call
 * sites forward a driver error code (`error?.code`) as the fallback, which would
 * otherwise dereference an undefined definition and crash the request.
 */
function normalizeCode(code: unknown, fallback: ApiErrorCode = "OPERATION_FAILED"): ApiErrorCode {
  return typeof code === "string" && code in API_ERRORS ? (code as ApiErrorCode) : fallback;
}

export function sendApiError(
  res: Response,
  code: ApiErrorCode,
  overrides?: string | ApiErrorOptions,
): Response {
  const safeCode = normalizeCode(code);
  const body = getApiError(safeCode, overrides);
  return res.status(API_ERRORS[safeCode].status).json(body);
}

/**
 * Postgres SQLSTATE -> catalog code. These are the failures that actually reach
 * users (constraint violations, connection loss), so they get a specific
 * message instead of a blanket 500.
 */
const PG_CODE_MAP: Record<string, ApiErrorCode> = {
  "23505": "DUPLICATE_ENTRY", // unique_violation
  "23503": "RELATED_RECORD_MISSING", // foreign_key_violation
  "23502": "REQUIRED_FIELDS_MISSING", // not_null_violation
  "23514": "VALIDATION_FAILED", // check_violation
  "22001": "VALIDATION_FAILED", // string_data_right_truncation
  "22003": "VALIDATION_FAILED", // numeric_value_out_of_range
  "22P02": "INVALID_ID", // invalid_text_representation
  "57014": "REQUEST_TIMEOUT", // query_canceled
  "53300": "DATABASE_UNAVAILABLE", // too_many_connections
  "53200": "DATABASE_UNAVAILABLE", // out_of_memory
  "40001": "OPERATION_FAILED", // serialization_failure
  "40P01": "OPERATION_FAILED", // deadlock_detected
};

/** Node/undici connection failures — the upstream is unreachable, not our bug. */
const NETWORK_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EAI_AGAIN",
  "EPIPE",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
]);

const MULTER_CODE_MAP: Record<string, ApiErrorCode> = {
  LIMIT_FILE_SIZE: "FILE_TOO_LARGE",
  LIMIT_UNEXPECTED_FILE: "FILE_TYPE_INVALID",
  LIMIT_FILE_COUNT: "PAYLOAD_TOO_LARGE",
  LIMIT_PART_COUNT: "PAYLOAD_TOO_LARGE",
  LIMIT_FIELD_VALUE: "PAYLOAD_TOO_LARGE",
};

type Classified = {
  code: ApiErrorCode;
  options?: ApiErrorOptions;
};

/**
 * Maps a thrown value onto a catalog entry so the user sees why something
 * failed rather than a blanket "something went wrong". Returns null when the
 * error is unrecognised, in which case the caller's fallback code applies.
 *
 * Raw driver/library text is never forwarded to the client — only catalog copy
 * (plus, for card declines, Stripe's own user-facing message).
 */
export function classifyError(error: unknown): Classified | null {
  if (!error || typeof error !== "object") return null;
  const err = error as Record<string, any>;

  // Already-classified errors pass straight through.
  if (error instanceof HttpApiError) {
    return {
      code: error.code,
      options: { message: error.message, field: error.field, details: error.details },
    };
  }

  // A route may throw a bare catalog code string on `.code`.
  if (typeof err.code === "string" && err.code in API_ERRORS) {
    return { code: err.code as ApiErrorCode };
  }

  // Zod validation failures — surface which fields are wrong.
  if (err.name === "ZodError" && Array.isArray(err.issues)) {
    const details = err.issues
      .slice(0, 4)
      .map((issue: any) => {
        const path = Array.isArray(issue?.path) ? issue.path.join(".") : "";
        return path ? `${path}: ${issue?.message}` : String(issue?.message ?? "");
      })
      .filter(Boolean);
    const firstPath = err.issues[0]?.path?.[0];
    return {
      code: "VALIDATION_FAILED",
      options: {
        details,
        field: typeof firstPath === "string" ? firstPath : undefined,
      },
    };
  }

  // Multer upload failures.
  if (typeof err.code === "string" && MULTER_CODE_MAP[err.code]) {
    return { code: MULTER_CODE_MAP[err.code] };
  }

  // Express body-parser failures.
  if (err.type === "entity.too.large") return { code: "PAYLOAD_TOO_LARGE" };
  if (err.type === "entity.parse.failed") return { code: "VALIDATION_FAILED" };

  // Stripe card declines carry copy written for the cardholder; everything else
  // from Stripe is internal detail.
  if (err.type === "StripeCardError" && typeof err.message === "string") {
    return { code: "VALIDATION_FAILED", options: { message: err.message } };
  }
  if (err.type === "StripeConnectionError" || err.type === "StripeAPIError") {
    return { code: "SERVICE_UNAVAILABLE" };
  }

  // Postgres constraint/connection errors.
  if (typeof err.code === "string" && PG_CODE_MAP[err.code]) {
    return { code: PG_CODE_MAP[err.code] };
  }
  if (typeof err.code === "string" && /^08/.test(err.code)) {
    return { code: "DATABASE_UNAVAILABLE" };
  }

  // Transport-level failures reaching any upstream.
  if (typeof err.code === "string" && NETWORK_ERROR_CODES.has(err.code)) {
    return { code: "SERVICE_UNAVAILABLE" };
  }
  if (err.name === "AbortError" || err.name === "TimeoutError") {
    return { code: "REQUEST_TIMEOUT" };
  }

  return null;
}

/** Compact, safe one-liner for server logs — keeps the detail off the wire. */
export function describeErrorForLog(error: unknown): string {
  if (error instanceof Error) {
    const err = error as Error & { code?: unknown; detail?: unknown; constraint?: unknown };
    const parts = [`${err.name}: ${err.message}`];
    if (err.code) parts.push(`code=${String(err.code)}`);
    if (err.constraint) parts.push(`constraint=${String(err.constraint)}`);
    if (err.detail) parts.push(`detail=${String(err.detail)}`);
    return parts.join(" ");
  }
  return String(error);
}

/**
 * Terminal error handler for a route. Classifies the failure, logs the full
 * detail server-side, and returns catalog copy to the client.
 *
 * `context` should name the operation ("update singer profile") so logs point
 * at the route without needing a stack trace.
 */
export function sendRouteError(
  res: Response,
  error: unknown,
  fallbackCode: ApiErrorCode = "OPERATION_FAILED",
  context?: string,
): Response {
  const label = context ? `[api] ${context}` : "[api]";
  const safeFallback = normalizeCode(fallbackCode);

  const classified = classifyError(error);
  if (classified) {
    const status = API_ERRORS[classified.code].status;
    // 4xx is expected traffic (bad input, duplicates); only 5xx is a defect.
    if (status >= 500) {
      console.error(`${label} ${classified.code}:`, describeErrorForLog(error));
    } else {
      console.warn(`${label} ${classified.code}: ${describeErrorForLog(error)}`);
    }
    return sendApiError(res, classified.code, classified.options);
  }

  console.error(`${label} ${safeFallback} (unclassified):`, error);
  return sendApiError(res, safeFallback);
}
