import test from "node:test";
import assert from "node:assert/strict";
import { API_ERRORS } from "@shared/api-errors";
import { HttpApiError, classifyError, describeErrorForLog } from "./api-response";

/**
 * classifyError is what keeps an unexpected failure from collapsing into a
 * generic 500. These cases cover the errors that actually reach users.
 */

test("Postgres constraint violations map to specific codes", () => {
  const cases: Array<[string, string]> = [
    ["23505", "DUPLICATE_ENTRY"],
    ["23503", "RELATED_RECORD_MISSING"],
    ["23502", "REQUIRED_FIELDS_MISSING"],
    ["22P02", "INVALID_ID"],
    ["57014", "REQUEST_TIMEOUT"],
    ["53300", "DATABASE_UNAVAILABLE"],
  ];
  for (const [sqlState, expected] of cases) {
    const err = Object.assign(new Error("db blew up"), { code: sqlState });
    assert.equal(classifyError(err)?.code, expected, `SQLSTATE ${sqlState}`);
  }
});

test("Postgres connection-class errors (08xxx) report the database as unavailable", () => {
  const err = Object.assign(new Error("connection failure"), { code: "08006" });
  assert.equal(classifyError(err)?.code, "DATABASE_UNAVAILABLE");
});

test("transport failures map to SERVICE_UNAVAILABLE rather than a 500", () => {
  for (const code of ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN"]) {
    const err = Object.assign(new Error("socket died"), { code });
    assert.equal(classifyError(err)?.code, "SERVICE_UNAVAILABLE", code);
  }
});

test("multer upload limits map to upload-specific codes", () => {
  const tooBig = Object.assign(new Error("File too large"), { code: "LIMIT_FILE_SIZE" });
  assert.equal(classifyError(tooBig)?.code, "FILE_TOO_LARGE");

  const unexpected = Object.assign(new Error("Unexpected field"), {
    code: "LIMIT_UNEXPECTED_FILE",
  });
  assert.equal(classifyError(unexpected)?.code, "FILE_TYPE_INVALID");
});

test("Zod issues surface the offending fields as details", () => {
  const zodErr = Object.assign(new Error("invalid"), {
    name: "ZodError",
    issues: [
      { path: ["email"], message: "Invalid email" },
      { path: ["age"], message: "Expected number" },
    ],
  });
  const result = classifyError(zodErr);
  assert.equal(result?.code, "VALIDATION_FAILED");
  assert.deepEqual(result?.options?.details, ["email: Invalid email", "age: Expected number"]);
  assert.equal(result?.options?.field, "email");
});

test("HttpApiError passes through with its own message and field", () => {
  const err = new HttpApiError("BIO_TOO_LONG");
  const result = classifyError(err);
  assert.equal(result?.code, "BIO_TOO_LONG");
  assert.equal(result?.options?.field, "bio");
  assert.equal(result?.options?.message, API_ERRORS.BIO_TOO_LONG.message);
});

test("a thrown catalog code on .code is honoured", () => {
  const err = Object.assign(new Error("nope"), { code: "UPGRADE_REQUIRED" });
  assert.equal(classifyError(err)?.code, "UPGRADE_REQUIRED");
});

test("Stripe card declines keep Stripe's cardholder-facing message", () => {
  const err = Object.assign(new Error("Your card was declined."), {
    type: "StripeCardError",
  });
  const result = classifyError(err);
  assert.equal(result?.code, "VALIDATION_FAILED");
  assert.equal(result?.options?.message, "Your card was declined.");
});

test("unrecognised errors stay unclassified so the caller's fallback applies", () => {
  assert.equal(classifyError(new Error("something odd")), null);
  assert.equal(classifyError(null), null);
  assert.equal(classifyError("a string"), null);
});

test("log descriptions include the driver detail that never reaches the client", () => {
  const err = Object.assign(new Error("duplicate key"), {
    code: "23505",
    constraint: "singers_email_key",
    detail: "Key (email)=(a@b.c) already exists.",
  });
  const line = describeErrorForLog(err);
  assert.match(line, /duplicate key/);
  assert.match(line, /code=23505/);
  assert.match(line, /constraint=singers_email_key/);
});
