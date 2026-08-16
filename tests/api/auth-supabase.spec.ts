import { test, expect } from "@playwright/test";
import {
  api,
  closeDb,
  createAccount,
  createAuthUser,
  createDualRoleAccount,
  deleteAuthUser,
  signIn,
  supabaseAdmin,
  testEmail,
  type TestAccount,
} from "../helpers/accounts";

/**
 * Authentication contract for the Supabase cutover.
 *
 * These replace the pre-cutover specs that posted credentials to
 * /api/auth/login — that endpoint no longer exists; the browser signs in
 * against Supabase directly and sends the resulting JWT as a Bearer token.
 */

const created: string[] = [];

test.afterAll(async () => {
  for (const id of created) await deleteAuthUser(id);
  await closeDb();
});

async function account(type: "singer" | "organization", tag?: string): Promise<TestAccount> {
  const acct = await createAccount(type, tag);
  created.push(acct.authUserId);
  return acct;
}

test.describe("token authentication", () => {
  test("singer with a valid token resolves to their own profile", async () => {
    const singer = await account("singer");
    const { status, body } = await api("/auth/me", {
      token: singer.token,
      accountType: "singer",
    });

    expect(status).toBe(200);
    expect(body.userType).toBe("singer");
    expect(body.email).toBe(singer.email);
    expect(body.id).toBe(singer.profileId);
  });

  test("organization with a valid token resolves to their own profile", async () => {
    const org = await account("organization");
    const { status, body } = await api("/auth/me", {
      token: org.token,
      accountType: "organization",
    });

    expect(status).toBe(200);
    expect(body.userType).toBe("organization");
    expect(body.email).toBe(org.email);
  });

  test("no token is rejected", async () => {
    const { status, body } = await api("/auth/me");
    expect(status).toBe(401);
    expect(body.code).toBe("NOT_AUTHENTICATED");
  });

  test("garbage token is rejected", async () => {
    const { status } = await api("/auth/me", { token: "not-a-jwt" });
    expect(status).toBe(401);
  });

  test("a valid Auth user with no singer or organization profile is not treated as a dropped session", async () => {
    const email = testEmail("unenrolled");
    const user = await createAuthUser(email);
    created.push(user.id);
    const token = await signIn(email);

    const { status, body } = await api("/auth/me", { token });
    expect(status).toBe(403);
    expect(body.code).toBe("ACCOUNT_NOT_ENROLLED");
    expect(String(body.message)).not.toMatch(/session has ended/i);
  });

  test("token with a tampered signature is rejected", async () => {
    const singer = await account("singer", "tamper");
    const [h, p] = singer.token.split(".");
    const forged = `${h}.${p}.AAAAinvalidsignatureAAAA`;

    const { status } = await api("/auth/me", { token: forged, accountType: "singer" });
    expect(status).toBe(401);
  });

  test("token whose payload was rewritten to another subject is rejected", async () => {
    const singer = await account("singer", "sub");
    const [h, p, s] = singer.token.split(".");
    const payload = JSON.parse(Buffer.from(p, "base64url").toString());
    payload.sub = "00000000-0000-0000-0000-000000000000";
    const rewritten = Buffer.from(JSON.stringify(payload)).toString("base64url");

    const { status } = await api("/auth/me", { token: `${h}.${rewritten}.${s}` });
    expect(status).toBe(401);
  });

  // KNOWN GAP: verifySupabaseAccessToken() validates the signature offline and
  // never asks Supabase whether the session is still good, so an already-issued
  // token stays usable for the rest of its 60-minute life after a password
  // reset. Flip to a normal test once the server checks session validity.
  test.fail("password change revokes previously issued tokens", async () => {
    const singer = await account("singer", "revoke");
    const before = singer.token;

    await supabaseAdmin().auth.admin.updateUserById(singer.authUserId, {
      password: "RotatedPassword!9987",
    });

    const { status } = await api("/auth/me", { token: before, accountType: "singer" });
    expect(status).toBe(401);
  });

  // KNOWN GAP: same root cause, worse consequence — the profile row is found by
  // auth_user_id, which still matches after the auth user is gone.
  test.fail("deleted auth user cannot keep using a live token", async () => {
    const singer = await createAccount("singer", "deleted");
    await deleteAuthUser(singer.authUserId);

    const { status } = await api("/auth/me", {
      token: singer.token,
      accountType: "singer",
    });
    expect(status).toBe(401);
  });
});

test.describe("confirmation gating", () => {
  test("an unconfirmed auth user cannot obtain a session", async () => {
    const email = testEmail("unconfirmed");
    const { data, error } = await supabaseAdmin().auth.admin.createUser({
      email,
      password: "QaTestPassword!2431",
      email_confirm: false,
    });
    expect(error).toBeNull();
    created.push(data!.user!.id);

    await expect(signIn(email)).rejects.toThrow();
  });
});

test.describe("registration", () => {
  /**
   * POST /api/auth/register/* allows 10 attempts per hour per IP. That guard is
   * correct and deliberately not disabled for tests, so these four cases skip
   * rather than fail when the window is already spent — a red suite would
   * otherwise mean "you ran the tests twice", not "the app is broken".
   */
  function skipIfRateLimited(status: number, body: any) {
    test.skip(
      status === 429 || body?.code === "RATE_LIMITED",
      "register rate limit spent — rerun after the 1h window",
    );
  }

  test("registering without a preceding Supabase signup is refused", async () => {
    const { status, body } = await api("/auth/register/singer", {
      method: "POST",
      body: {
        email: testEmail("no-auth-user"),
        first_name: "Qa",
        last_name: "Orphan",
        primary_voice_type: "Bass",
        city: "Boston",
        state: "MA",
      },
    });

    skipIfRateLimited(status, body);
    expect(status).toBeGreaterThanOrEqual(400);
    expect(body.code).toBe("REGISTRATION_FAILED");
  });

  test("duplicate email is refused", async () => {
    const singer = await account("singer", "dupe");
    const { status, body } = await api("/auth/register/singer", {
      method: "POST",
      body: {
        email: singer.email,
        first_name: "Qa",
        last_name: "Duplicate",
        primary_voice_type: "Alto",
        city: "Boston",
        state: "MA",
      },
    });

    skipIfRateLimited(status, body);
    expect(status).toBeGreaterThanOrEqual(400);
    expect(body.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  test("client-supplied coordinates are ignored on create", async () => {
    const email = testEmail("coords");
    const user = await createAuthUser(email);
    created.push(user.id);

    const { status, body } = await api("/auth/register/singer", {
      method: "POST",
      body: {
        email,
        first_name: "Qa",
        last_name: "Coords",
        primary_voice_type: "Tenor",
        city: "Boston",
        state: "MA",
        latitude: 1.234,
        longitude: 5.678,
      },
    });

    skipIfRateLimited(status, body);
    expect(status).toBe(201);
    // Server geocodes Boston itself; the injected pair must not survive.
    expect(body.latitude).not.toBe(1.234);
    expect(body.longitude).not.toBe(5.678);
  });

  test("privileged fields cannot be set at registration", async () => {
    const email = testEmail("privreg");
    const user = await createAuthUser(email);
    created.push(user.id);

    const { status, body } = await api("/auth/register/singer", {
      method: "POST",
      body: {
        email,
        first_name: "Qa",
        last_name: "Priv",
        primary_voice_type: "Tenor",
        city: "Boston",
        state: "MA",
        subscription_tier: "pro",
        founding_artist: true,
        is_gifted: true,
        admin_approved: true,
      },
    });

    skipIfRateLimited(status, body);
    expect(status).toBe(201);
    expect(body.subscription_tier).toBe("free");
    expect(body.founding_artist).toBeFalsy();
    expect(body.is_gifted).toBeFalsy();
    expect(body.admin_approved).toBeFalsy();
  });
});

test.describe("X-Account-Type header trust", () => {
  test("a singer claiming to be an organization does not get org access", async () => {
    const singer = await account("singer", "forge");

    const { status } = await api("/auth/me", {
      token: singer.token,
      accountType: "organization",
    });

    // The token carries only the singer role, so the forged header must not
    // promote them; either resolve as singer or refuse outright.
    const org = await api("/org/profile", {
      token: singer.token,
      accountType: "organization",
    });
    expect(org.status).toBe(403);
    expect(status).toBe(200);
  });

  test("dual-role user lands on the account named by the header", async () => {
    const dual = await createDualRoleAccount();
    created.push(dual.authUserId);

    const asSinger = await api("/auth/me", { token: dual.token, accountType: "singer" });
    expect(asSinger.status).toBe(200);
    expect(asSinger.body.userType).toBe("singer");

    const asOrg = await api("/auth/me", { token: dual.token, accountType: "organization" });
    expect(asOrg.status).toBe(200);
    expect(asOrg.body.userType).toBe("organization");
  });

  test("dual-role user with no header falls back deterministically", async () => {
    const dual = await createDualRoleAccount();
    created.push(dual.authUserId);

    const { status, body } = await api("/auth/me", { token: dual.token });
    expect(status).toBe(200);
    // Documents the silent default in resolveUserFromToken().
    expect(body.userType).toBe("singer");
  });
});
