import test from "node:test";
import assert from "node:assert/strict";
import { API_ERRORS } from "./api-errors";
import {
  isCredentialRejection,
  mapAuthProviderError,
  messageFromAuthProviderError,
} from "./auth-error-map";

test("wrong password maps to INVALID_PASSWORD, not LOGIN_FAILED", () => {
  const err = { message: "Invalid login credentials", status: 400, code: "invalid_credentials" };
  assert.equal(mapAuthProviderError(err, "login"), "INVALID_PASSWORD");
  assert.equal(
    messageFromAuthProviderError(err, "login"),
    API_ERRORS.INVALID_PASSWORD.message,
  );
  assert.ok(isCredentialRejection(err));
  assert.notEqual(messageFromAuthProviderError(err, "login"), API_ERRORS.LOGIN_FAILED.message);
});

test("unknown email uses the same credentials copy as a wrong password", () => {
  assert.equal(
    mapAuthProviderError({ message: "Invalid credentials", status: 400 }, "login"),
    "INVALID_PASSWORD",
  );
});

test("admin wrong password uses the admin-specific copy", () => {
  assert.equal(
    mapAuthProviderError({ message: "Invalid login credentials" }, "admin"),
    "ADMIN_INVALID_PASSWORD",
  );
});

test("unconfirmed email is not treated as a credentials typo", () => {
  const err = { message: "Email not confirmed", status: 400 };
  assert.equal(mapAuthProviderError(err, "login"), "EMAIL_NOT_CONFIRMED");
  assert.equal(isCredentialRejection(err), false);
});

test("register already-exists and weak password map to catalog codes", () => {
  assert.equal(
    mapAuthProviderError({ message: "User already registered" }, "register"),
    "EMAIL_ALREADY_REGISTERED",
  );
  assert.equal(
    mapAuthProviderError({ message: "Password should be at least 6 characters" }, "register"),
    "PASSWORD_TOO_SHORT",
  );
  assert.equal(
    mapAuthProviderError({ message: "Unable to validate email address: invalid format" }, "register"),
    "INVALID_EMAIL",
  );
});

test("rate limits and network failures are not LOGIN_FAILED", () => {
  assert.equal(
    mapAuthProviderError({ message: "Email rate limit exceeded" }, "login"),
    "RATE_LIMITED",
  );
  assert.equal(
    mapAuthProviderError({ message: "Failed to fetch" }, "login"),
    "NETWORK_ERROR",
  );
});

test("reset session problems map to an expired-link message", () => {
  assert.equal(
    mapAuthProviderError({ message: "Auth session missing!" }, "reset"),
    "RESET_LINK_INVALID",
  );
  assert.equal(
    mapAuthProviderError({ code: "same_password", message: "New password should be different from the old password." }, "reset"),
    "PASSWORD_UNCHANGED",
  );
});

test("unrecognised provider errors keep the context fallback", () => {
  assert.equal(mapAuthProviderError({ message: "weird gotrue glitch" }, "login"), "LOGIN_FAILED");
  assert.equal(mapAuthProviderError({ message: "weird gotrue glitch" }, "register"), "REGISTRATION_FAILED");
});
