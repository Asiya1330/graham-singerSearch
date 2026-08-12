import test from "node:test";
import assert from "node:assert/strict";
import { API_ERRORS, type ApiErrorCode } from "./api-errors";

/**
 * The client renders these by code, so the status/message contract has to stay
 * stable across the Supabase cutover.
 */

test("auth error codes carry the expected HTTP statuses", () => {
  const expected: Partial<Record<ApiErrorCode, number>> = {
    NOT_AUTHENTICATED: 401,
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
