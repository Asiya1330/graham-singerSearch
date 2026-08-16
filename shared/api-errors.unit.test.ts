import test from "node:test";
import assert from "node:assert/strict";
import {
  API_ERRORS,
  getApiError,
  resolveApiErrorMessage,
  resolveApiErrorField,
  type ApiErrorCode,
} from "./api-errors";

/**
 * The client renders these by code, so the status/message contract has to stay
 * stable across the Supabase cutover.
 */

test("auth error codes carry the expected HTTP statuses", () => {
  const expected: Partial<Record<ApiErrorCode, number>> = {
    NOT_AUTHENTICATED: 401,
    ACCOUNT_NOT_ENROLLED: 403,
    SINGER_ACCESS_REQUIRED: 403,
    ORG_ACCESS_REQUIRED: 403,
    ADMIN_AUTH_REQUIRED: 401,
    ADMIN_MFA_REQUIRED: 403,
    ADMIN_FORBIDDEN: 403,
    ADMIN_SUPER_REQUIRED: 403,
  };
  for (const [code, status] of Object.entries(expected)) {
    assert.equal(
      API_ERRORS[code as ApiErrorCode].status,
      status,
      `${code} should be ${status}`,
    );
  }
});

test("every error definition has a non-empty user-facing message", () => {
  for (const [code, def] of Object.entries(API_ERRORS)) {
    assert.ok(def.message && def.message.trim().length > 0, `${code} has no message`);
    // status 0 marks the client-only sentinels (e.g. NETWORK_ERROR) that never
    // come back from the server.
    assert.ok(
      def.status === 0 || (def.status >= 400 && def.status < 600),
      `${code} has status ${def.status}`,
    );
  }
});

test("credential failures do not leak which factor was wrong", () => {
  // INVALID_PASSWORD is returned for unknown-account and wrong-password alike
  // by /api/auth/legacy-login, so its copy must not name either case.
  const msg = API_ERRORS.INVALID_PASSWORD.message.toLowerCase();
  assert.ok(!msg.includes("no account"), "message reveals account existence");
  assert.ok(!msg.includes("not found"), "message reveals account existence");
});

/**
 * These messages are the whole user-facing contract, so the copy rules are
 * enforced rather than left to review.
 */

test("no message falls back to uninformative filler", () => {
  // Copy that says nothing is the failure mode this catalog exists to prevent.
  const banned = [
    "something went wrong",
    "an error occurred",
    "unknown error",
    "unexpected error occurred",
    "operation failed",
    "internal server error",
    "error",
    "failed",
  ];
  for (const [code, def] of Object.entries(API_ERRORS)) {
    const normalized = def.message.trim().toLowerCase().replace(/[.!]$/, "");
    assert.ok(
      !banned.includes(normalized),
      `${code} uses filler copy: "${def.message}"`,
    );
  }
});

test("messages are descriptive but stay short enough to read in a toast", () => {
  for (const [code, def] of Object.entries(API_ERRORS)) {
    assert.ok(
      def.message.length >= 20,
      `${code} is too terse to be self-explanatory: "${def.message}"`,
    );
    assert.ok(
      def.message.length <= 160,
      `${code} is too long for an inline error (${def.message.length} chars)`,
    );
    assert.match(
      def.message,
      /[.!?]$/,
      `${code} should read as a complete sentence: "${def.message}"`,
    );
  }
});

test("getApiError carries the catalog field and any supplied details", () => {
  const body = getApiError("BIO_TOO_LONG");
  assert.equal(body.code, "BIO_TOO_LONG");
  assert.equal(body.field, "bio");

  const overridden = getApiError("VALIDATION_FAILED", {
    message: "Check the highlighted fields.",
    field: "email",
    details: ["email: required"],
  });
  assert.equal(overridden.message, "Check the highlighted fields.");
  assert.equal(overridden.field, "email");
  assert.deepEqual(overridden.details, ["email: required"]);
});

test("resolveApiErrorMessage prefers the server message over the fallback", () => {
  assert.equal(
    resolveApiErrorMessage({ code: "SINGER_NOT_FOUND", message: "Custom copy." }),
    "Custom copy.",
  );
  // A known code with a blank message falls back to the catalog entry.
  assert.equal(
    resolveApiErrorMessage({ code: "SINGER_NOT_FOUND", message: "  " }),
    API_ERRORS.SINGER_NOT_FOUND.message,
  );
  // Legacy plain-text messages are upgraded to catalog copy.
  assert.equal(
    resolveApiErrorMessage({ message: "Not authenticated" }),
    API_ERRORS.NOT_AUTHENTICATED.message,
  );
  // Nothing usable at all lands on the caller's fallback.
  assert.equal(resolveApiErrorMessage(null, "SEARCH_FAILED"), API_ERRORS.SEARCH_FAILED.message);
});

test("validation details are appended so the user sees which field failed", () => {
  const message = resolveApiErrorMessage({
    code: "VALIDATION_FAILED",
    details: ["email: Invalid email"],
  });
  assert.match(message, /email: Invalid email/);
});

test("resolveApiErrorField finds the field to highlight", () => {
  assert.equal(resolveApiErrorField({ code: "BIO_TOO_LONG" }), "bio");
  assert.equal(resolveApiErrorField({ field: "customField" }), "customField");
  assert.equal(resolveApiErrorField({ code: "INTERNAL_ERROR" }), undefined);
});
