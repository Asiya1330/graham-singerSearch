import { and, eq, inArray, asc, desc } from "drizzle-orm";
import {
  ADMIN_SEED_EMAILS,
  adminAuditLog,
  admins,
  type Admin,
  type AdminAuditAction,
  type AdminAuditLog,
} from "@shared/schema";
import { db } from "../storage";
import { getSupabaseAdmin } from "./supabase";
import { getSiteUrl, getSupabaseUrl, getSupabaseServiceRoleKey } from "./env";
import { normalizeAdminEmail } from "./auth-admin";
import { grantAuthRole, revokeAuthRole } from "./auth-roles";
import { HttpApiError } from "./api-response";
import type { ApiErrorCode } from "@shared/api-errors";

const ADMIN_REDIRECT = () => `${getSiteUrl()}/admin/set-password`;

function fail(code: ApiErrorCode, message?: string): never {
  throw new HttpApiError(code, message);
}

type AuditActor = {
  adminId?: number | null;
  email?: string | null;
};

type AuditEntry = {
  action: AdminAuditAction;
  actor?: AuditActor | null;
  targetAdminId?: number | null;
  targetEmail?: string | null;
  metadata?: Record<string, unknown> | null;
};

async function writeAuditLog(
  tx: Pick<typeof db, "insert">,
  entry: AuditEntry,
): Promise<void> {
  await tx.insert(adminAuditLog).values({
    action: entry.action,
    actor_admin_id: entry.actor?.adminId ?? null,
    actor_email: entry.actor?.email ?? null,
    target_admin_id: entry.targetAdminId ?? null,
    target_email: entry.targetEmail ?? null,
    metadata: entry.metadata ?? null,
  });
}

function actorFromAdmin(admin: Admin): AuditActor {
  return { adminId: admin.id, email: admin.email };
}

export async function listAdmins(): Promise<Admin[]> {
  return db.select().from(admins).orderBy(asc(admins.created_at));
}

export async function listAdminAuditLogs(limit = 100): Promise<AdminAuditLog[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  return db
    .select()
    .from(adminAuditLog)
    .orderBy(desc(adminAuditLog.created_at))
    .limit(safeLimit);
}

export async function getAdminById(id: number): Promise<Admin | undefined> {
  const [row] = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  return row;
}

export async function invitePendingAdmin(
  emailRaw: string,
  invitedBy: Admin,
): Promise<Admin> {
  const email = normalizeAdminEmail(emailRaw);
  if (!email || !email.includes("@")) {
    fail("INVALID_EMAIL");
  }

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    let result: Admin;

    if (existing) {
      if (existing.status === "pending") {
        await writeAuditLog(tx, {
          action: "invite",
          actor: actorFromAdmin(invitedBy),
          targetAdminId: existing.id,
          targetEmail: existing.email,
          metadata: { reuse: true },
        });
        return existing;
      }
      if (existing.status === "active") {
        fail("EMAIL_ALREADY_REGISTERED", "That email is already an active admin.");
      }
      const [updated] = await tx
        .update(admins)
        .set({
          status: "pending",
          invited_by: invitedBy.id,
          approved_by: null,
          auth_user_id: null,
          is_super: false,
          updated_at: new Date(),
        })
        .where(eq(admins.id, existing.id))
        .returning();
      result = updated;
    } else {
      const [created] = await tx
        .insert(admins)
        .values({
          email,
          status: "pending",
          is_super: false,
          invited_by: invitedBy.id,
        })
        .returning();
      result = created;
    }

    await writeAuditLog(tx, {
      action: "invite",
      actor: actorFromAdmin(invitedBy),
      targetAdminId: result.id,
      targetEmail: result.email,
    });
    return result;
  });
}

async function ensureAuthAdminUser(email: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const redirectTo = ADMIN_REDIRECT();

  const { data: invited, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(email, { redirectTo });

  if (!inviteError && invited.user?.id) {
    await grantAuthRole(invited.user.id, "admin");
    return invited.user.id;
  }

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) {
    fail("OPERATION_FAILED", inviteError?.message || listError.message || "Auth invite failed");
  }

  const found = list.users.find(
    (u) => (u.email || "").toLowerCase() === email.toLowerCase(),
  );
  if (!found) {
    fail("OPERATION_FAILED", inviteError?.message || "Could not invite admin user");
  }

  await grantAuthRole(found.id, "admin");

  await supabase.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo },
  });

  return found.id;
}

export async function approvePendingAdmin(
  pending: Admin,
  approver: Admin,
): Promise<Admin> {
  if (pending.status !== "pending") {
    fail("ADMIN_INVITE_INVALID");
  }
  if (pending.invited_by != null && pending.invited_by === approver.id) {
    fail("ADMIN_APPROVE_FORBIDDEN");
  }

  const authUserId = await ensureAuthAdminUser(pending.email);

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(admins)
      .set({
        status: "active",
        auth_user_id: authUserId,
        approved_by: approver.id,
        updated_at: new Date(),
      })
      .where(eq(admins.id, pending.id))
      .returning();

    await writeAuditLog(tx, {
      action: "approve",
      actor: actorFromAdmin(approver),
      targetAdminId: updated.id,
      targetEmail: updated.email,
      metadata: { auth_user_id: authUserId },
    });
    return updated;
  });
}

export async function rejectPendingAdmin(
  pending: Admin,
  rejector: Admin,
): Promise<Admin> {
  if (pending.status !== "pending") {
    fail("ADMIN_INVITE_INVALID");
  }
  if (pending.invited_by != null && pending.invited_by === rejector.id) {
    fail("ADMIN_APPROVE_FORBIDDEN");
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(admins)
      .set({
        status: "rejected",
        approved_by: rejector.id,
        updated_at: new Date(),
      })
      .where(eq(admins.id, pending.id))
      .returning();

    await writeAuditLog(tx, {
      action: "reject",
      actor: actorFromAdmin(rejector),
      targetAdminId: updated.id,
      targetEmail: updated.email,
    });
    return updated;
  });
}

export async function revokeAdmin(
  target: Admin,
  actor: Admin,
): Promise<Admin> {
  if (target.status !== "active") {
    fail("ADMIN_INVITE_INVALID");
  }
  if (target.id === actor.id) {
    fail("ADMIN_INVITE_INVALID", "You cannot revoke your own admin access.");
  }

  if (target.is_super) {
    const supers = await db
      .select()
      .from(admins)
      .where(and(eq(admins.status, "active"), eq(admins.is_super, true)));
    if (supers.length <= 1) {
      fail("ADMIN_INVITE_INVALID", "Cannot revoke the last super admin.");
    }
  }

  if (target.auth_user_id) {
    await revokeAuthRole(target.auth_user_id, "admin");
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(admins)
      .set({
        status: "revoked",
        updated_at: new Date(),
      })
      .where(eq(admins.id, target.id))
      .returning();

    await writeAuditLog(tx, {
      action: "revoke",
      actor: actorFromAdmin(actor),
      targetAdminId: updated.id,
      targetEmail: updated.email,
      metadata: { auth_user_id: target.auth_user_id },
    });
    return updated;
  });
}

export async function clearAdminMfa(
  opts: {
    adminId?: number;
    email?: string;
  },
  actor: Admin,
): Promise<{ cleared: number; email: string }> {
  let target: Admin | undefined;

  if (opts.adminId != null && Number.isFinite(Number(opts.adminId))) {
    target = await getAdminById(Number(opts.adminId));
  } else if (opts.email) {
    const email = normalizeAdminEmail(opts.email);
    const [row] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    target = row;
  }

  if (!target || target.status !== "active") {
    fail("USER_NOT_FOUND", "No active admin found for that account.");
  }
  if (!target.auth_user_id) {
    fail(
      "OPERATION_FAILED",
      "This admin has no linked Auth user yet. They must complete invite/login first.",
    );
  }

  const supabase = getSupabaseAdmin();
  const userId = target.auth_user_id;

  const adminMfa = (supabase.auth.admin as { mfa?: {
    listFactors: (args: { userId: string }) => Promise<{ data: { factors?: Array<{ id: string }> } | null; error: { message: string } | null }>;
    deleteFactor: (args: { userId: string; id: string }) => Promise<{ error: { message: string } | null }>;
  } }).mfa;

  let factors: Array<{ id: string }> = [];
  if (adminMfa?.listFactors) {
    const { data, error: factorsError } = await adminMfa.listFactors({ userId });
    if (factorsError) fail("OPERATION_FAILED", factorsError.message);
    factors = data?.factors || [];
  } else {
    const res = await fetch(
      `${getSupabaseUrl()}/auth/v1/admin/users/${userId}/factors`,
      {
        headers: {
          Authorization: `Bearer ${getSupabaseServiceRoleKey()}`,
          apikey: getSupabaseServiceRoleKey(),
        },
      },
    );
    if (!res.ok) {
      fail("OPERATION_FAILED", `Failed to list MFA factors (${res.status})`);
    }
    const body = await res.json();
    factors = Array.isArray(body) ? body : body?.factors || [];
  }

  let cleared = 0;
  for (const factor of factors) {
    if (adminMfa?.deleteFactor) {
      const { error: delErr } = await adminMfa.deleteFactor({
        userId,
        id: factor.id,
      });
      if (!delErr) cleared += 1;
    } else {
      const res = await fetch(
        `${getSupabaseUrl()}/auth/v1/admin/users/${userId}/factors/${factor.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getSupabaseServiceRoleKey()}`,
            apikey: getSupabaseServiceRoleKey(),
          },
        },
      );
      if (res.ok) cleared += 1;
    }
  }

  await db.transaction(async (tx) => {
    await writeAuditLog(tx, {
      action: "clear_mfa",
      actor: actorFromAdmin(actor),
      targetAdminId: target!.id,
      targetEmail: target!.email,
      metadata: { cleared, auth_user_id: userId },
    });
  });

  return { cleared, email: target.email };
}

export type BootstrapResult = {
  status: "ok" | "already_done";
  results: Array<{ email: string; action: string; auth_user_id?: string }>;
};

export async function bootstrapSeedAdmins(): Promise<BootstrapResult> {
  const seedEmails = ADMIN_SEED_EMAILS.map((e) => e.toLowerCase());
  const existing = await db
    .select()
    .from(admins)
    .where(and(inArray(admins.email, [...seedEmails]), eq(admins.status, "active")));

  if (existing.length >= seedEmails.length) {
    return { status: "already_done", results: [] };
  }

  const results: BootstrapResult["results"] = [];
  const bootstrapActor: AuditActor = { adminId: null, email: "bootstrap" };

  for (const email of seedEmails) {
    const [row] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (row?.status === "active" && row.auth_user_id) {
      results.push({ email, action: "already_active", auth_user_id: row.auth_user_id });
      continue;
    }

    const authUserId = await ensureAuthAdminUser(email);

    await db.transaction(async (tx) => {
      let adminId: number;
      if (row) {
        const [updated] = await tx
          .update(admins)
          .set({
            status: "active",
            is_super: true,
            auth_user_id: authUserId,
            updated_at: new Date(),
          })
          .where(eq(admins.id, row.id))
          .returning();
        adminId = updated.id;
      } else {
        const [created] = await tx
          .insert(admins)
          .values({
            email,
            status: "active",
            is_super: true,
            auth_user_id: authUserId,
          })
          .returning();
        adminId = created.id;
      }

      await writeAuditLog(tx, {
        action: "bootstrap",
        actor: bootstrapActor,
        targetAdminId: adminId,
        targetEmail: email,
        metadata: { auth_user_id: authUserId },
      });
    });

    results.push({ email, action: "seeded", auth_user_id: authUserId });
  }

  return { status: "ok", results };
}

export function publicAdminDto(admin: Admin) {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    status: admin.status,
    is_super: admin.is_super,
    invited_by: admin.invited_by,
    approved_by: admin.approved_by,
    created_at: admin.created_at,
    updated_at: admin.updated_at,
  };
}

export function publicAuditDto(row: AdminAuditLog) {
  return {
    id: row.id,
    action: row.action,
    actor_admin_id: row.actor_admin_id,
    actor_email: row.actor_email,
    target_admin_id: row.target_admin_id,
    target_email: row.target_email,
    metadata: row.metadata,
    created_at: row.created_at,
  };
}
