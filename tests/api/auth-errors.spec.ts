import { test, expect } from "@playwright/test";

const API = "http://localhost:5000/api";

/**
 * Pre-cutover this file tested POST /api/auth/login with a password body.
 * That endpoint no longer exists — the browser authenticates against Supabase
 * directly and sends the resulting JWT as a Bearer token, so credential errors
 * are now surfaced by Supabase and mapped in client/src/lib/accountAuth.js.
 *
 * Token-level behaviour lives in auth-supabase.spec.ts; what remains here is
 * the API's own unauthenticated error contract.
 */

test.describe("API error messaging", () => {
  /** The register limiter (10/hour/IP) fires ahead of validation, so a spent
   *  window turns these into RATE_LIMITED rather than the code under test. */
  function skipIfRateLimited(body: any) {
    test.skip(body?.code === "RATE_LIMITED", "register rate limit spent — rerun after the 1h window");
  }

  test("unauthenticated /api/auth/me returns NOT_AUTHENTICATED", async ({ request }) => {
    const response = await request.get(`${API}/auth/me`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.code).toBe("NOT_AUTHENTICATED");
  });

  test("registration rejects a malformed email", async ({ request }) => {
    const response = await request.post(`${API}/auth/register/singer`, {
      data: {
        email: "not-an-email",
        first_name: "Test",
        last_name: "Singer",
        primary_voice_type: "Soprano",
        city: "New York",
        state: "NY",
      },
    });

    const body = await response.json();
    skipIfRateLimited(body);
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(body.code).toBe("INVALID_EMAIL");
  });

  test("registration requires an email", async ({ request }) => {
    const response = await request.post(`${API}/auth/register/singer`, {
      data: { first_name: "Test", last_name: "Singer" },
    });

    const body = await response.json();
    skipIfRateLimited(body);
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(body.code).toBe("EMAIL_PASSWORD_REQUIRED");
  });
});
