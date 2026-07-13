import { test, expect } from "@playwright/test";

const API = process.env.API_BASE_URL || "http://localhost:5000/api";

test.describe("Stripe API", () => {
  test("status endpoint reports config", async ({ request }) => {
    const response = await request.get(`${API}/stripe/status`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty("checkoutReady");
    expect(body).toHaveProperty("returnBaseUrl");
  });

  test("checkout requires authentication", async ({ request }) => {
    const response = await request.post(`${API}/stripe/checkout`);
    expect(response.status()).toBe(401);
  });

  test("portal requires authentication", async ({ request }) => {
    const response = await request.post(`${API}/stripe/portal`);
    expect(response.status()).toBe(401);
  });

  test("webhook rejects missing signature", async ({ request }) => {
    const response = await request.post(`${API}/stripe/webhook`, {
      data: { type: "customer.subscription.updated" },
    });
    expect([400, 503]).toContain(response.status());
  });
});

test.describe("Org subscription security", () => {
  test("org cannot self-upgrade to pro without payment", async ({ request }) => {
    const loginRes = await request.post(`${API}/auth/login`, {
      data: {
        email: process.env.VITE_DEMO_ORG_EMAIL || "casting@lyricchicago.org",
        password: process.env.VITE_DEMO_ORG_PASSWORD || "demo1234",
        userType: "organization",
      },
    });

    if (!loginRes.ok()) {
      test.skip(true, "Demo org login unavailable in this environment");
    }

    const response = await request.put(`${API}/org/subscription`, {
      data: { tier: "pro" },
    });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.message).toMatch(/payment/i);
  });
});
