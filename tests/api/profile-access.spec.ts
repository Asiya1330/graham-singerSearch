import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import {
  api,
  closeDb,
  createAccount,
  createDualRoleAccount,
  deleteAuthUser,
  type TestAccount,
} from "../helpers/accounts";

/**
 * Profile read/write, role isolation, and mass-assignment.
 *
 * Both profile handlers protect privileged columns with a *denylist* of
 * destructured fields, and storage.updateSinger/updateOrganization pass the
 * remainder straight to Drizzle .set(). Anything the denylist forgets is
 * therefore writable by the account itself — these tests enumerate the
 * columns that matter.
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

test.describe("singer profile — happy path", () => {
  test("a singer can read their own profile", async () => {
    const singer = await account("singer", "read");
    const { status, body } = await api("/singer/profile", {
      token: singer.token,
      accountType: "singer",
    });

    expect(status).toBe(200);
    expect(body.email).toBe(singer.email);
    expect(body.password).toBeUndefined();
    expect(Array.isArray(body.roles)).toBe(true);
  });

  test("a singer can update their own profile", async () => {
    const singer = await account("singer", "write");
    const { status, body } = await api("/singer/profile", {
      method: "PUT",
      token: singer.token,
      accountType: "singer",
      body: { short_bio: "Updated by QA", website_url: "https://example.com" },
    });

    expect(status).toBe(200);
    expect(body.short_bio).toBe("Updated by QA");

    const reread = await api("/singer/profile", { token: singer.token, accountType: "singer" });
    expect(reread.body.short_bio).toBe("Updated by QA");
  });

  test("bio length and URL scheme are validated", async () => {
    const singer = await account("singer", "validate");

    const longBio = await api("/singer/profile", {
      method: "PUT",
      token: singer.token,
      accountType: "singer",
      body: { short_bio: "x".repeat(1701) },
    });
    expect(longBio.status).toBe(400);

    const badUrl = await api("/singer/profile", {
      method: "PUT",
      token: singer.token,
      accountType: "singer",
      body: { website_url: "javascript:alert(1)" },
    });
    expect(badUrl.status).toBe(400);
  });
});

test.describe("organization profile — happy path", () => {
  test("an organization can read their own profile", async () => {
    const org = await account("organization", "read");
    const { status, body } = await api("/org/profile", {
      token: org.token,
      accountType: "organization",
    });

    expect(status).toBe(200);
    expect(body.email).toBe(org.email);
    expect(body.password).toBeUndefined();
  });

  test("an organization can update their own profile", async () => {
    const org = await account("organization", "write");
    const { status, body } = await api("/org/profile", {
      method: "PUT",
      token: org.token,
      accountType: "organization",
      body: { organization_name: "QA Renamed Opera" },
    });

    expect(status).toBe(200);
    expect(body.organization_name).toBe("QA Renamed Opera");
  });
});

test.describe("role isolation", () => {
  test("a singer cannot reach organization endpoints", async () => {
    const singer = await account("singer", "iso");

    for (const path of ["/org/profile", "/org/revealed-singers"]) {
      const { status, body } = await api(path, { token: singer.token, accountType: "singer" });
      expect(status, `${path} must refuse a singer`).toBe(403);
      expect(body.code).toBe("ORG_ACCESS_REQUIRED");
    }
  });

  test("an organization cannot reach singer endpoints", async () => {
    const org = await account("organization", "iso");

    for (const path of ["/singer/profile", "/singer/search-appearances"]) {
      const { status, body } = await api(path, { token: org.token, accountType: "organization" });
      expect(status, `${path} must refuse an organization`).toBe(403);
      expect(body.code).toBe("SINGER_ACCESS_REQUIRED");
    }
  });

  test("an organization cannot write a singer profile", async () => {
    const org = await account("organization", "xwrite");
    const { status } = await api("/singer/profile", {
      method: "PUT",
      token: org.token,
      accountType: "organization",
      body: { short_bio: "written by an org" },
    });
    expect(status).toBe(403);
  });

  test("a singer cannot reach admin endpoints", async () => {
    const singer = await account("singer", "admin");
    const { status } = await api("/admin/singers", { token: singer.token, accountType: "singer" });
    expect(status).toBeGreaterThanOrEqual(401);
    expect(status).toBeLessThan(500);
  });

  test("dual-role user is confined to the profile named by the header", async () => {
    const dual = await createDualRoleAccount();
    created.push(dual.authUserId);

    const singerSide = await api("/singer/profile", {
      token: dual.token,
      accountType: "singer",
    });
    expect(singerSide.status).toBe(200);
    expect(singerSide.body.id).toBe(dual.singerId);

    const orgSide = await api("/org/profile", {
      token: dual.token,
      accountType: "organization",
    });
    expect(orgSide.status).toBe(200);
    expect(orgSide.body.id).toBe(dual.orgId);
  });
});

test.describe("mass assignment — singer", () => {
  test("billing and entitlement columns are not writable", async () => {
    const singer = await account("singer", "mass");

    const { status } = await api("/singer/profile", {
      method: "PUT",
      token: singer.token,
      accountType: "singer",
      body: {
        subscription_tier: "pro",
        founding_artist: true,
        is_gifted: true,
        admin_approved: true,
        is_pro_verified: true,
        stripe_subscription_status: "active",
        viewed_count: 99999,
        reliability_score: 100,
      },
    });
    expect(status).toBe(200);

    const after = await api("/singer/profile", { token: singer.token, accountType: "singer" });
    expect(after.body.subscription_tier).toBe("free");
    expect(after.body.founding_artist).toBeFalsy();
    expect(after.body.is_gifted).toBeFalsy();
    expect(after.body.admin_approved).toBeFalsy();
    expect(after.body.is_pro_verified).toBeFalsy();
    expect(after.body.stripe_subscription_status).not.toBe("active");
    expect(after.body.viewed_count).not.toBe(99999);
  });

  test("email cannot be changed through the profile endpoint", async () => {
    const singer = await account("singer", "email");
    await api("/singer/profile", {
      method: "PUT",
      token: singer.token,
      accountType: "singer",
      body: { email: "hijacked@example.com" },
    });

    const after = await api("/singer/profile", { token: singer.token, accountType: "singer" });
    expect(after.body.email).toBe(singer.email);
  });

  test("auth_user_id cannot be pointed at another user's auth id", async () => {
    const victim = await account("singer", "victim");
    const attacker = await account("singer", "attacker");

    const attempt = await api("/singer/profile", {
      method: "PUT",
      token: attacker.token,
      accountType: "singer",
      body: { auth_user_id: victim.authUserId },
    });

    // NOTE: this is refused by the UNIQUE index on singers.auth_user_id, not by
    // the route — hence a 500 rather than a 400. The victim staying intact is
    // the property that matters; see the sibling test for the case the index
    // does not cover.
    expect(attempt.status).not.toBe(200);

    const stillVictims = await api("/auth/me", {
      token: victim.token,
      accountType: "singer",
    });
    expect(stillVictims.status).toBe(200);
    expect(stillVictims.body.id).toBe(victim.profileId);
    expect(stillVictims.body.email).toBe(victim.email);
  });

  // KNOWN BUG: auth_user_id is absent from the denylist in PUT /api/singer/profile
  // and storage.updateSinger passes the object straight to Drizzle .set(), so any
  // singer can rewrite their own auth linkage to an unused UUID. The write returns
  // 200 and instantly orphans the account — every later request 401s, and the
  // email is still taken, so re-registration is refused too. Unrecoverable
  // without manual DB surgery.
  test.fail("auth_user_id cannot be set to an unused uuid", async () => {
    const singer = await account("singer", "orphan");

    const attempt = await api("/singer/profile", {
      method: "PUT",
      token: singer.token,
      accountType: "singer",
      body: { auth_user_id: randomUUID() },
    });
    expect(attempt.status).toBe(400);

    const after = await api("/auth/me", { token: singer.token, accountType: "singer" });
    expect(after.status).toBe(200);
  });

  test("the profile row id cannot be moved", async () => {
    const singer = await account("singer", "idmove");
    await api("/singer/profile", {
      method: "PUT",
      token: singer.token,
      accountType: "singer",
      body: { id: 999999 },
    });

    const after = await api("/singer/profile", { token: singer.token, accountType: "singer" });
    expect(after.body.id).toBe(singer.profileId);
  });
});

test.describe("mass assignment — organization", () => {
  test("entitlement and reveal-quota columns are not writable", async () => {
    const org = await account("organization", "mass");

    await api("/org/profile", {
      method: "PUT",
      token: org.token,
      accountType: "organization",
      body: {
        subscription_tier: "pro",
        founding_org: true,
        is_gifted: true,
        verified: true,
        contact_reveal_limit: 9999,
        contact_reveals_used_this_month: 0,
      },
    });

    const after = await api("/org/profile", { token: org.token, accountType: "organization" });
    expect(after.body.subscription_tier).toBe("free");
    expect(after.body.founding_org).toBeFalsy();
    expect(after.body.is_gifted).toBeFalsy();
    expect(after.body.verified).toBeFalsy();
    expect(after.body.contact_reveal_limit).not.toBe(9999);
  });

  test("auth_user_id cannot be pointed at another org's auth id", async () => {
    const victim = await account("organization", "ovictim");
    const attacker = await account("organization", "oattacker");

    const attempt = await api("/org/profile", {
      method: "PUT",
      token: attacker.token,
      accountType: "organization",
      body: { auth_user_id: victim.authUserId },
    });
    expect(attempt.status).not.toBe(200);

    const stillVictims = await api("/auth/me", {
      token: victim.token,
      accountType: "organization",
    });
    expect(stillVictims.status).toBe(200);
    expect(stillVictims.body.id).toBe(victim.profileId);
  });

  // KNOWN BUG: identical omission in PUT /api/org/profile — see the singer case.
  test.fail("auth_user_id cannot be set to an unused uuid", async () => {
    const org = await account("organization", "oorphan");

    const attempt = await api("/org/profile", {
      method: "PUT",
      token: org.token,
      accountType: "organization",
      body: { auth_user_id: randomUUID() },
    });
    expect(attempt.status).toBe(400);

    const after = await api("/auth/me", { token: org.token, accountType: "organization" });
    expect(after.status).toBe(200);
  });
});

test.describe("unauthenticated access", () => {
  const guarded = [
    ["GET", "/singer/profile"],
    ["PUT", "/singer/profile"],
    ["GET", "/org/profile"],
    ["PUT", "/org/profile"],
  ] as const;

  for (const [method, path] of guarded) {
    test(`${method} ${path} requires a token`, async () => {
      const { status } = await api(path, { method, body: method === "PUT" ? {} : undefined });
      expect(status).toBe(401);
    });
  }
});
