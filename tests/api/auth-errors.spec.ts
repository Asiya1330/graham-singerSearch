import { test, expect } from "@playwright/test";

const API = "http://localhost:5000/api";

test.describe("API error messaging", () => {
  test("login with unknown email returns USER_NOT_FOUND", async ({ request }) => {
    const response = await request.post(`${API}/auth/login`, {
      data: {
        email: `missing-user-${Date.now()}@example.com`,
        password: "wrong-password-123",
        userType: "singer",
      },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.code).toBe("USER_NOT_FOUND");
    expect(body.message).toMatch(/No account found/i);
  });

  test("login with wrong password returns INVALID_PASSWORD", async ({ request }) => {
    const email = `pw-test-${Date.now()}@example.com`;
    const password = "correct-password-123";

    const register = await request.post(`${API}/auth/register/singer`, {
      data: {
        email,
        password,
        first_name: "Test",
        last_name: "Singer",
        primary_voice_type: "Soprano",
        city: "New York",
        state: "NY",
      },
    });
    expect(register.ok()).toBeTruthy();

    const response = await request.post(`${API}/auth/login`, {
      data: {
        email,
        password: "wrong-password-123",
        userType: "singer",
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.code).toBe("INVALID_PASSWORD");
    expect(body.message).toMatch(/Incorrect password/i);
  });

  test("unauthenticated /api/auth/me returns NOT_AUTHENTICATED", async ({ request }) => {
    const response = await request.get(`${API}/auth/me`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.code).toBe("NOT_AUTHENTICATED");
  });
});
