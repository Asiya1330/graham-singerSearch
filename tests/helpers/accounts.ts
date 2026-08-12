import "dotenv/config";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import pg from "pg";

/**
 * Test account factory.
 *
 * Real signup requires a confirmation email, which is unusable in CI. The
 * service-role admin API can mint a *pre-confirmed* auth user instead, so the
 * rest of the flow (profile row + role grant via /api/auth/register/*) runs
 * exactly as it does in production. Nothing here bypasses the app's own
 * authorization — only the mailbox.
 */

const API = process.env.TEST_API_URL || "http://localhost:5000/api";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} must be set in .env to run the QA suite`);
  return v;
}

let admin: SupabaseClient | null = null;
export function supabaseAdmin(): SupabaseClient {
  if (!admin) {
    admin = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

function anonClient(): SupabaseClient {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type AccountType = "singer" | "organization";

export type TestAccount = {
  email: string;
  password: string;
  authUserId: string;
  profileId: number;
  type: AccountType;
  token: string;
};

/** Namespaced so leftovers are always identifiable as test data. */
export function testEmail(tag: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `qa-${tag}-${Date.now()}-${rand}@example.com`;
}

const PASSWORD = "QaTestPassword!2431";

/** Create a confirmed auth user with no profile row and no app role. */
export async function createAuthUser(email: string, password = PASSWORD): Promise<User> {
  const { data, error } = await supabaseAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message}`);
  return data.user;
}

export async function signIn(email: string, password = PASSWORD): Promise<string> {
  const { data, error } = await anonClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`signIn failed for ${email}: ${error?.message}`);
  return data.session.access_token;
}

function profileBody(type: AccountType, email: string) {
  return type === "singer"
    ? {
        email,
        first_name: "Qa",
        last_name: "Singer",
        primary_voice_type: "Soprano",
        city: "Boston",
        state: "MA",
      }
    : {
        email,
        organization_name: "QA Opera Company",
        city: "Boston",
        state: "MA",
      };
}

let pool: pg.Pool | null = null;
function db(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: requireEnv("SUPABASE_DATABASE_URL"),
      ssl: { rejectUnauthorized: false },
      max: 4,
    });
  }
  return pool;
}

export async function closeDb(): Promise<void> {
  await pool?.end();
  pool = null;
}

/** Mirror of grantAuthRole() in server/lib/auth-roles.ts. */
async function grantRole(authUserId: string, role: AccountType): Promise<void> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.auth.admin.getUserById(authUserId);
  if (error || !data.user) throw new Error(`getUserById failed: ${error?.message}`);

  const meta = (data.user.app_metadata || {}) as Record<string, unknown>;
  const current = Array.isArray(meta.roles) ? (meta.roles as string[]) : [];
  const { role: _legacy, ...rest } = meta;

  const { error: upErr } = await sb.auth.admin.updateUserById(authUserId, {
    app_metadata: { ...rest, roles: [...new Set([...current, role])] },
  });
  if (upErr) throw new Error(`role grant failed: ${upErr.message}`);
}

/** Insert the profile row the register endpoint would have created. */
async function insertProfile(
  type: AccountType,
  email: string,
  authUserId: string,
): Promise<number> {
  const q =
    type === "singer"
      ? `insert into singers (email, first_name, last_name, primary_voice_type, city, state, auth_user_id)
         values ($1, 'Qa', 'Singer', 'Soprano', 'Boston', 'MA', $2) returning id`
      : `insert into organizations (email, organization_name, city, state, auth_user_id)
         values ($1, 'QA Opera Company', 'Boston', 'MA', $2) returning id`;
  const { rows } = await db().query(q, [email, authUserId]);
  return rows[0].id;
}

/**
 * Full account: confirmed auth user -> profile row -> role grant -> fresh token.
 *
 * The profile row is inserted directly rather than through
 * POST /api/auth/register/* because that endpoint is rate limited to 10/hour
 * per IP — a correct production guard that a suite creating ~30 accounts would
 * otherwise trip. The registration endpoint's own contract is covered
 * separately in auth-supabase.spec.ts, which stays inside the budget.
 *
 * The token is fetched *last*: the role only lands in app_metadata at grant
 * time, and a JWT minted earlier would not carry it.
 */
export async function createAccount(type: AccountType, tag = type): Promise<TestAccount> {
  const email = testEmail(tag);
  const user = await createAuthUser(email);
  const profileId = await insertProfile(type, email, user.id);
  await grantRole(user.id, type);

  return {
    email,
    password: PASSWORD,
    authUserId: user.id,
    profileId,
    type,
    token: await signIn(email),
  };
}

/** Create an account through the real HTTP registration flow (rate limited). */
export async function registerViaApi(
  type: AccountType,
  email: string,
  extra: Record<string, unknown> = {},
): Promise<ApiCall> {
  const endpoint = type === "singer" ? "register/singer" : "register/organization";
  const res = await fetch(`${API}/auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...profileBody(type, email), ...extra }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

/**
 * A single auth user holding BOTH roles with both profile rows — the state the
 * account-switching logic in resolveUserFromToken() exists to handle, and one
 * that cannot be produced through the UI.
 */
export async function createDualRoleAccount(): Promise<{
  email: string;
  authUserId: string;
  singerId: number;
  orgId: number;
  token: string;
}> {
  const email = testEmail("dual");
  const user = await createAuthUser(email);

  const singerId = await insertProfile("singer", email, user.id);
  const orgId = await insertProfile("organization", email, user.id);
  await grantRole(user.id, "singer");
  await grantRole(user.id, "organization");

  return {
    email,
    authUserId: user.id,
    singerId,
    orgId,
    token: await signIn(email),
  };
}

/** Remove the auth user; profile rows are cleaned by the caller via the API/db. */
export async function deleteAuthUser(authUserId: string): Promise<void> {
  await supabaseAdmin().auth.admin.deleteUser(authUserId).catch(() => {});
}

export type ApiCall = {
  status: number;
  body: any;
};

/** Authenticated request helper mirroring what the browser sends. */
export async function api(
  path: string,
  opts: {
    method?: string;
    token?: string | null;
    accountType?: string | null;
    body?: unknown;
  } = {},
): Promise<ApiCall> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.accountType) headers["X-Account-Type"] = opts.accountType;

  const res = await fetch(`${API}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const text = await res.text();
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}
