import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Shield, UserPlus } from "lucide-react";
import { apiFetch } from "../lib/api";

/** Admin roster APIs used by this panel (all exist under /api/admin/auth/*). */
const ADMIN_AUTH_API = {
  list: "/api/admin/auth/admins",
  invite: "/api/admin/auth/invite",
  approve: (id) => `/api/admin/auth/admins/${id}/approve`,
  reject: (id) => `/api/admin/auth/admins/${id}/reject`,
  revoke: (id) => `/api/admin/auth/admins/${id}`,
  clearMfa: "/api/admin/auth/clear-mfa",
};

export function AdminsPanel({ currentAdminId, isSuper, showAlert }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiFetch(ADMIN_AUTH_API.list);
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      showAlert?.(err.message || "Failed to load admins", "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const runAction = useCallback(
    async (busyKey, action) => {
      if (busy) return;
      setBusy(busyKey);
      try {
        await action();
        await loadAdmins();
      } catch (err) {
        showAlert?.(err.message || "Action failed", "error");
      } finally {
        setBusy(null);
      }
    },
    [busy, loadAdmins, showAlert],
  );

  const handleInviteSubmit = (event) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;

    runAction("invite", async () => {
      await apiFetch(ADMIN_AUTH_API.invite, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setInviteEmail("");
      showAlert?.("Invite created — waiting for another super to approve.", "success");
    });
  };

  const handleApproveAdmin = (admin) => {
    runAction(`approve-${admin.id}`, async () => {
      await apiFetch(ADMIN_AUTH_API.approve(admin.id), { method: "POST" });
      showAlert?.("Admin approved — invite email sent.", "success");
    });
  };

  const handleRejectAdmin = (admin) => {
    runAction(`reject-${admin.id}`, async () => {
      await apiFetch(ADMIN_AUTH_API.reject(admin.id), { method: "POST" });
      showAlert?.("Invite rejected.", "success");
    });
  };

  const handleClearMfa = (admin) => {
    runAction(`mfa-${admin.id}`, async () => {
      const { data } = await apiFetch(ADMIN_AUTH_API.clearMfa, {
        method: "POST",
        body: JSON.stringify({ adminId: admin.id }),
      });
      const cleared = data?.cleared ?? 0;
      showAlert?.(
        cleared > 0
          ? `MFA cleared for ${admin.email}. They must re-enroll on next login.`
          : `No MFA factors found for ${admin.email}.`,
        "success",
      );
    });
  };

  const handleRevokeAdmin = (admin) => {
    if (!confirm(`Revoke admin access for ${admin.email}?`)) return;
    runAction(`revoke-${admin.id}`, async () => {
      await apiFetch(ADMIN_AUTH_API.revoke(admin.id), { method: "DELETE" });
      showAlert?.("Admin revoked.", "success");
    });
  };

  const pending = admins.filter((a) => a.status === "pending");
  const active = admins.filter((a) => a.status === "active");
  const other = admins.filter((a) => a.status === "rejected" || a.status === "revoked");

  if (!isSuper) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Admin roster management is limited to super admins.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <UserPlus className="w-4 h-4" /> Invite admin
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Creates a pending invite. Another super admin must approve before they receive an email and can sign in.
        </p>
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleInviteSubmit}>
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="new.admin@example.com"
            className="flex-1 rounded-lg border border-slate-200 px-3 h-10 text-sm"
          />
          <button
            type="submit"
            disabled={!!busy}
            className="h-10 px-4 rounded-lg bg-amber-600 text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy === "invite" ? "…" : "Invite"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Pending approval
        </h3>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : pending.length === 0 ? (
          <p className="text-sm text-slate-500">No pending invites.</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((admin) => {
              const isInviter = admin.invited_by === currentAdminId;
              return (
                <li
                  key={admin.id}
                  className="flex flex-wrap items-center justify-between gap-2 border border-slate-100 rounded-lg px-3 py-2 text-sm"
                >
                  <span className="font-medium text-slate-800">{admin.email}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isInviter || !!busy}
                      title={
                        isInviter
                          ? "You invited this person — another super must approve"
                          : "Approve"
                      }
                      onClick={() => handleApproveAdmin(admin)}
                      className="h-8 px-3 rounded-md bg-emerald-600 text-white text-xs font-semibold disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isInviter || !!busy}
                      onClick={() => handleRejectAdmin(admin)}
                      className="h-8 px-3 rounded-md bg-slate-200 text-slate-800 text-xs font-semibold disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Active admins</h3>
        <ul className="space-y-2">
          {active.map((admin) => (
            <li
              key={admin.id}
              className="flex flex-wrap items-center justify-between gap-2 border border-slate-100 rounded-lg px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-slate-800">{admin.email}</span>
                {admin.is_super && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    super
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => handleClearMfa(admin)}
                  className="h-8 px-3 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold disabled:opacity-60"
                >
                  {busy === `mfa-${admin.id}` ? "…" : "Clear MFA"}
                </button>
                {admin.id !== currentAdminId && (
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => handleRevokeAdmin(admin)}
                    className="h-8 px-3 rounded-md bg-red-50 text-red-700 text-xs font-semibold disabled:opacity-60"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {other.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Inactive</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            {other.map((admin) => (
              <li key={admin.id}>
                {admin.email} — <span className="capitalize">{admin.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
