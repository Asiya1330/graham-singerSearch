import { useEffect, useState } from "react";
import { useAppContext } from "../AppContext";
import { useCityStateAutofill } from "../hooks/useCityStateAutofill";
import { adminFetch } from "../lib/adminApi";
import { getSupabaseBrowser } from "../lib/supabase";
import { apiFetch, describeError, getApiErrorMessage } from "../lib/api";
import { AdminsPanel } from "./AdminsPanel";
import { AdminMainTabs } from "./AdminMainTabs";
import { AdminNav } from "./AdminNav";
import { AdminStats } from "./AdminStats";
import { CreditAdjustModal } from "./CreditAdjustModal";
import { GiftProModal } from "./GiftProModal";
import { SuggestionsPanel } from "./SuggestionsPanel";
import { DEFAULT_CREDIT_ADJUST_FORM, DEFAULT_GIFT_FORM } from "./constants";
import { useActionBusy } from "./useActionBusy";
import { fetchOrgDetail, fetchSingerDetail } from "./api";
import {
  buildOrgEditForm,
  buildSingerEditForm,
  filterSingers,
} from "./utils";
import { SingerDetailView } from "./singers/SingerDetailView";
import { SingerEditView } from "./singers/SingerEditView";
import { SingersPanel } from "./singers/SingersPanel";
import { OrgDetailView } from "./orgs/OrgDetailView";
import { OrgEditView } from "./orgs/OrgEditView";
import { OrgsPanel } from "./orgs/OrgsPanel";

export function AdminDashboard({ setAdminMode, showAlert }) {
  const { setView } = useAppContext();
  const { withBusy, isBusy, isRowBusy } = useActionBusy();

  const [stats, setStats] = useState(null);
  const [extStats, setExtStats] = useState(null);
  const [allSingers, setAllSingers] = useState([]);
  const [allOrgs, setAllOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminTab, setAdminTab] = useState("pending");
  const [adminMainTab, setAdminMainTab] = useState("singers");
  const [adminMe, setAdminMe] = useState(null);
  const [adminViewSinger, setAdminViewSinger] = useState(null);
  const [editingSinger, setEditingSinger] = useState(null);
  const [editForm, setEditForm] = useState({});
  const { stateAutoFilled, handleCityChange, handleStateChange } = useCityStateAutofill(setEditForm);
  const [singerSearchQuery, setSingerSearchQuery] = useState("");
  const [adminViewOrg, setAdminViewOrg] = useState(null);
  const [editingOrg, setEditingOrg] = useState(null);
  const [orgEditForm, setOrgEditForm] = useState({});
  const [creditAdjustOrgId, setCreditAdjustOrgId] = useState(null);
  const [creditAdjustForm, setCreditAdjustForm] = useState(DEFAULT_CREDIT_ADJUST_FORM);
  const [creditAdjustError, setCreditAdjustError] = useState("");
  const [giftTarget, setGiftTarget] = useState(null);
  const [giftForm, setGiftForm] = useState(DEFAULT_GIFT_FORM);
  const [giftError, setGiftError] = useState("");
  const [giftSubmitting, setGiftSubmitting] = useState(false);

  const loadAdminData = async () => {
    try {
      const [statsRes, extStatsRes, singersRes, orgsRes, meResult] = await Promise.all([
        adminFetch("/api/admin/stats"),
        adminFetch("/api/admin/stats-extended"),
        adminFetch("/api/admin/singers"),
        adminFetch("/api/admin/orgs"),
        apiFetch("/api/admin/auth/me").catch(() => null),
      ]);
      if (!statsRes.ok) throw new Error(await getApiErrorMessage(statsRes, "OPERATION_FAILED"));
      if (!singersRes.ok) throw new Error(await getApiErrorMessage(singersRes, "OPERATION_FAILED"));
      if (!orgsRes.ok) throw new Error(await getApiErrorMessage(orgsRes, "OPERATION_FAILED"));
      setStats(await statsRes.json());
      if (extStatsRes.ok) setExtStats(await extStatsRes.json());
      setAllSingers(await singersRes.json());
      setAllOrgs(await orgsRes.json());
      if (meResult?.data?.admin) setAdminMe(meResult.data.admin);
      setLoading(false);
    } catch (err) {
      setError(describeError(err));
      setLoading(false);
    }
  };

  useEffect(() => { loadAdminData(); }, []);

  const handleGiftPro = async () => {
    if (!giftTarget) return;
    setGiftError("");
    setGiftSubmitting(true);
    const target = giftTarget;
    try {
      const url = target.type === "singer"
        ? `/api/admin/singers/${target.id}/gift-pro`
        : `/api/admin/orgs/${target.id}/gift-pro`;
      const res = await adminFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(giftForm),
      });
      if (!res.ok) {
        setGiftError(await getApiErrorMessage(res, "OPERATION_FAILED"));
        return;
      }
      showAlert(`Pro access gifted to ${target.name}`, "success");
      setGiftTarget(null);
      setGiftForm(DEFAULT_GIFT_FORM);
      await loadAdminData();
      if (target.type === "singer" && adminViewSinger && adminViewSinger.id === target.id) {
        const singer = await fetchSingerDetail(target.id);
        if (singer) setAdminViewSinger(singer);
      }
      if (target.type === "org" && adminViewOrg && adminViewOrg.id === target.id) {
        const org = await fetchOrgDetail(target.id);
        if (org) setAdminViewOrg(org);
      }
    } catch (err) {
      setGiftError(describeError(err));
    } finally {
      setGiftSubmitting(false);
    }
  };

  const handleFoundingToggle = async (type, id, name, grant) => {
    await withBusy(`${type}:${id}:founding`, async () => {
      try {
        const base = type === "singer" ? `/api/admin/singers/${id}` : `/api/admin/orgs/${id}`;
        const res = await adminFetch(`${base}/${grant ? "grant-founding" : "revoke-founding"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          showAlert(await getApiErrorMessage(res, "OPERATION_FAILED"), "error");
          return;
        }
        showAlert(`Founding status ${grant ? "granted to" : "revoked from"} ${name}`, "success");
        await loadAdminData();
        if (type === "singer" && adminViewSinger && adminViewSinger.id === id) {
          const singer = await fetchSingerDetail(id);
          if (singer) setAdminViewSinger(singer);
        }
        if (type === "org" && adminViewOrg && adminViewOrg.id === id) {
          const org = await fetchOrgDetail(id);
          if (org) setAdminViewOrg(org);
        }
      } catch (err) {
        showAlert(describeError(err), "error");
      }
    });
  };

  const handleAdminAction = async (singerId, action) => {
    if (action === "deactivate") {
      const singer = allSingers.find((s) => s.id === singerId) || (adminViewSinger?.id === singerId ? adminViewSinger : null);
      const name = singer ? `${singer.first_name} ${singer.last_name}` : "this singer";
      if (!window.confirm(`Are you sure you want to deactivate ${name}? They will no longer appear in search results.`)) return;
    } else if (action === "delete") {
      if (!confirm("Permanently delete this singer and all their data?")) return;
    }

    await withBusy(`singer:${singerId}:${action}`, async () => {
      try {
        let url, method;
        if (action === "approve") { url = `/api/admin/singers/${singerId}/approve`; method = "PUT"; }
        else if (action === "reject") { url = `/api/admin/singers/${singerId}/reject`; method = "PUT"; }
        else if (action === "deactivate") { url = `/api/admin/singers/${singerId}/deactivate`; method = "PUT"; }
        else if (action === "activate") { url = `/api/admin/singers/${singerId}/activate`; method = "PUT"; }
        else if (action === "delete") { url = `/api/admin/singers/${singerId}`; method = "DELETE"; }
        const res = await adminFetch(url, { method });
        if (!res.ok) throw new Error(await getApiErrorMessage(res, "OPERATION_FAILED"));
        showAlert(`Singer ${action}d successfully`, "success");
        await loadAdminData();
      } catch (err) {
        showAlert(describeError(err), "error");
      }
    });
  };

  const handleBadgeToggle = async (singerId, field, currentValue) => {
    await withBusy(`singer:${singerId}:badge:${field}`, async () => {
      try {
        const res = await adminFetch(`/api/admin/singers/${singerId}/badges`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field, value: !currentValue }),
        });
        if (!res.ok) throw new Error(await getApiErrorMessage(res, "OPERATION_FAILED"));
        await loadAdminData();
      } catch (err) {
        showAlert(describeError(err), "error");
      }
    });
  };

  const handleViewSinger = async (singerId) => {
    await withBusy(`singer:${singerId}:view`, async () => {
      try {
        setAdminViewSinger(await fetchSingerDetail(singerId));
      } catch (err) {
        showAlert(describeError(err, "PROFILE_LOAD_FAILED"), "error");
      }
    });
  };

  const handleStartEditSinger = async (singerId) => {
    await withBusy(`singer:${singerId}:edit`, async () => {
      try {
        const singer = await fetchSingerDetail(singerId);
        setEditingSinger(singer);
        setEditForm(buildSingerEditForm(singer));
      } catch (err) {
        showAlert(describeError(err, "PROFILE_LOAD_FAILED"), "error");
      }
    });
  };

  const handleEditSinger = async () => {
    await withBusy(`singer:${editingSinger.id}:save`, async () => {
      try {
        const res = await adminFetch(`/api/admin/singers/${editingSinger.id}/edit`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });
        if (!res.ok) throw new Error(await getApiErrorMessage(res, "PROFILE_UPDATE_FAILED"));
        showAlert("Singer profile updated", "success");
        setEditingSinger(null);
        await loadAdminData();
      } catch (err) {
        showAlert(describeError(err, "PROFILE_UPDATE_FAILED"), "error");
      }
    });
  };

  const handleViewOrg = async (orgId) => {
    await withBusy(`org:${orgId}:view`, async () => {
      try {
        setAdminViewOrg(await fetchOrgDetail(orgId));
      } catch (err) {
        showAlert(describeError(err, "PROFILE_LOAD_FAILED"), "error");
      }
    });
  };

  const handleEditOrg = async () => {
    await withBusy(`org:${editingOrg.id}:save`, async () => {
      try {
        const orgId = editingOrg.id;
        const res = await adminFetch(`/api/admin/orgs/${orgId}/edit`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orgEditForm),
        });
        if (!res.ok) throw new Error(await getApiErrorMessage(res, "PROFILE_UPDATE_FAILED"));
        showAlert("Organization updated", "success");
        setEditingOrg(null);
        await loadAdminData();
        const org = await fetchOrgDetail(orgId);
        if (org) setAdminViewOrg(org);
      } catch (err) {
        showAlert(describeError(err, "PROFILE_UPDATE_FAILED"), "error");
      }
    });
  };

  const handleToggleOrgSubscription = async (orgId, currentTier) => {
    await withBusy(`org:${orgId}:tier`, async () => {
      try {
        const tier = currentTier === "pro" ? "free" : "pro";
        const res = await adminFetch(`/api/admin/orgs/${orgId}/subscription`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier }),
        });
        if (!res.ok) throw new Error(await getApiErrorMessage(res, "SUBSCRIPTION_UPDATE_FAILED"));
        showAlert(`Organization set to ${tier === "pro" ? "Pro" : "Free"}`, "success");
        await loadAdminData();
        if (adminViewOrg && adminViewOrg.id === orgId) {
          const org = await fetchOrgDetail(orgId);
          if (org) setAdminViewOrg(org);
        }
      } catch (err) {
        showAlert(describeError(err, "SUBSCRIPTION_UPDATE_FAILED"), "error");
      }
    });
  };

  const handleDeleteOrg = async (orgId) => {
    if (!confirm("Permanently delete this organization and all its reveal/search/feedback history?")) return;
    await withBusy(`org:${orgId}:delete`, async () => {
      try {
        const res = await adminFetch(`/api/admin/orgs/${orgId}`, { method: "DELETE" });
        if (!res.ok) throw new Error(await getApiErrorMessage(res, "OPERATION_FAILED"));
        showAlert("Organization deleted", "success");
        await loadAdminData();
      } catch (err) {
        showAlert(describeError(err), "error");
      }
    });
  };

  const handleAdjustCredits = async (orgId) => {
    setCreditAdjustError("");
    const amt = parseInt(creditAdjustForm.amount);
    if (!Number.isFinite(amt) || amt === 0) {
      setCreditAdjustError("Enter a non-zero amount.");
      return;
    }
    await withBusy(`org:${orgId}:credits`, async () => {
      try {
        const res = await adminFetch(`/api/admin/orgs/${orgId}/credits`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amt, reason: creditAdjustForm.reason }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const targetOrg = adminViewOrg && adminViewOrg.id === orgId
            ? adminViewOrg
            : allOrgs.find((o) => o.id === orgId);
          const balance = targetOrg
            ? ((targetOrg.contact_reveal_limit ?? 0) - (targetOrg.contact_reveals_used_this_month ?? 0))
            : null;
          const lower = (data.message || "").toLowerCase();
          if (res.status === 400 && (lower.includes("negative") || lower.includes("below already-used")) && balance !== null) {
            setCreditAdjustError(`Cannot reduce credits below zero. Current balance is ${balance}.`);
          } else {
            setCreditAdjustError(data.message || "Adjustment failed.");
          }
          return;
        }
        showAlert(`Credits adjusted (${amt > 0 ? "+" : ""}${amt}). New balance: ${data.new_balance}`, "success");
        setCreditAdjustOrgId(null);
        setCreditAdjustForm(DEFAULT_CREDIT_ADJUST_FORM);
        setCreditAdjustError("");
        await loadAdminData();
        if (adminViewOrg && adminViewOrg.id === orgId) {
          const org = await fetchOrgDetail(orgId);
          if (org) setAdminViewOrg(org);
        }
      } catch (err) {
        setCreditAdjustError(err.message || "Network error. Please try again.");
      }
    });
  };

  const closeCreditModal = () => {
    setCreditAdjustOrgId(null);
    setCreditAdjustForm(DEFAULT_CREDIT_ADJUST_FORM);
    setCreditAdjustError("");
  };

  const openCreditModal = (orgId) => {
    setCreditAdjustOrgId(orgId);
    setCreditAdjustForm(DEFAULT_CREDIT_ADJUST_FORM);
    setCreditAdjustError("");
  };

  const handleMainTabChange = (tab) => {
    setAdminMainTab(tab);
    setAdminViewSinger(null);
    setEditingSinger(null);
    setAdminViewOrg(null);
    setEditingOrg(null);
    setCreditAdjustOrgId(null);
  };

  const handleLogout = async () => {
    try {
      await getSupabaseBrowser().auth.signOut();
    } catch { /* ignore */ }
    await adminFetch("/api/admin/auth/logout", { method: "POST" });
    setView("landing", { replace: true });
    setAdminMode(false);
  };

  const filteredSingers = filterSingers(allSingers, adminTab, singerSearchQuery);

  const creditModalTargetOrg = creditAdjustOrgId === null
    ? null
    : (adminViewOrg && adminViewOrg.id === creditAdjustOrgId)
      ? adminViewOrg
      : allOrgs.find((o) => o.id === creditAdjustOrgId) ?? null;

  if (adminViewOrg) {
    return (
      <>
        <OrgDetailView
          org={adminViewOrg}
          onLogoClick={() => setView("landing")}
          onBack={() => setAdminViewOrg(null)}
          onFoundingToggle={handleFoundingToggle}
          onGift={setGiftTarget}
          onToggleSubscription={handleToggleOrgSubscription}
          onEdit={(o) => {
            setEditingOrg(o);
            setOrgEditForm(buildOrgEditForm(o));
            setAdminViewOrg(null);
          }}
          onAdjustCredits={openCreditModal}
          creditAdjustOrgId={creditAdjustOrgId}
          creditAdjustForm={creditAdjustForm}
          setCreditAdjustForm={setCreditAdjustForm}
          creditAdjustError={creditAdjustError}
          setCreditAdjustError={setCreditAdjustError}
          onCloseCreditModal={closeCreditModal}
          onConfirmCreditAdjust={handleAdjustCredits}
          isBusy={isBusy}
        />
        <GiftProModal
          giftTarget={giftTarget}
          giftForm={giftForm}
          setGiftForm={setGiftForm}
          giftError={giftError}
          giftSubmitting={giftSubmitting}
          onClose={() => { setGiftTarget(null); setGiftError(""); }}
          onConfirm={handleGiftPro}
        />
      </>
    );
  }

  if (editingOrg) {
    return (
      <OrgEditView
        editingOrg={editingOrg}
        orgEditForm={orgEditForm}
        setOrgEditForm={setOrgEditForm}
        onLogoClick={() => setView("landing")}
        onCancel={() => setEditingOrg(null)}
        onSave={handleEditOrg}
        isBusy={isBusy}
      />
    );
  }

  if (adminViewSinger) {
    return (
      <SingerDetailView
        singer={adminViewSinger}
        onLogoClick={() => setView("landing")}
        onBack={() => setAdminViewSinger(null)}
        onFoundingToggle={handleFoundingToggle}
        onGift={setGiftTarget}
        onAdminAction={handleAdminAction}
        isBusy={isBusy}
      />
    );
  }

  if (editingSinger) {
    return (
      <SingerEditView
        editingSinger={editingSinger}
        editForm={editForm}
        setEditForm={setEditForm}
        stateAutoFilled={stateAutoFilled}
        handleCityChange={handleCityChange}
        handleStateChange={handleStateChange}
        onLogoClick={() => setView("landing")}
        onCancel={() => setEditingSinger(null)}
        onSave={handleEditSinger}
        isBusy={isBusy}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav
        onLogoClick={() => setView("adminDashboard")}
        rightContent={
          <button
            data-testid="button-admin-logout"
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Platform Overview</h1>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-slate-500">Loading…</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {stats && (
          <>
            <AdminStats
              stats={stats}
              extStats={extStats}
              onNavigateSingers={() => handleMainTabChange("singers")}
              onNavigateOrgs={() => handleMainTabChange("orgs")}
            />

            <AdminMainTabs
              adminMainTab={adminMainTab}
              allSingersCount={allSingers.length}
              allOrgsCount={allOrgs.length}
              onTabChange={handleMainTabChange}
            />

            {adminMainTab === "admins" && (
              <div className="mb-8" data-testid="section-admins">
                <AdminsPanel
                  currentAdminId={adminMe?.id}
                  isSuper={!!adminMe?.is_super}
                  showAlert={showAlert}
                />
              </div>
            )}

            {adminMainTab === "suggestions" && <SuggestionsPanel />}

            {adminMainTab === "orgs" && (
              <OrgsPanel
                allOrgs={allOrgs}
                onViewOrg={handleViewOrg}
                onEditOrg={(org) => {
                  setEditingOrg(org);
                  setOrgEditForm(buildOrgEditForm(org));
                }}
                onAdjustCredits={openCreditModal}
                onToggleSubscription={handleToggleOrgSubscription}
                onFoundingToggle={handleFoundingToggle}
                onGift={setGiftTarget}
                onDeleteOrg={handleDeleteOrg}
                isBusy={isBusy}
                isRowBusy={isRowBusy}
              />
            )}

            {adminMainTab === "singers" && (
              <SingersPanel
                allSingers={allSingers}
                filteredSingers={filteredSingers}
                adminTab={adminTab}
                setAdminTab={setAdminTab}
                singerSearchQuery={singerSearchQuery}
                setSingerSearchQuery={setSingerSearchQuery}
                onAdminAction={handleAdminAction}
                onViewSinger={handleViewSinger}
                onStartEditSinger={handleStartEditSinger}
                onFoundingToggle={handleFoundingToggle}
                onGift={setGiftTarget}
                onBadgeToggle={handleBadgeToggle}
                isBusy={isBusy}
                isRowBusy={isRowBusy}
              />
            )}
          </>
        )}
      </div>

      <CreditAdjustModal
        creditAdjustOrgId={creditAdjustOrgId}
        targetOrg={creditModalTargetOrg}
        creditAdjustForm={creditAdjustForm}
        setCreditAdjustForm={setCreditAdjustForm}
        creditAdjustError={creditAdjustError}
        setCreditAdjustError={setCreditAdjustError}
        isBusy={isBusy}
        onClose={closeCreditModal}
        onConfirm={handleAdjustCredits}
      />

      <GiftProModal
        giftTarget={giftTarget}
        giftForm={giftForm}
        setGiftForm={setGiftForm}
        giftError={giftError}
        giftSubmitting={giftSubmitting}
        onClose={() => { setGiftTarget(null); setGiftError(""); }}
        onConfirm={handleGiftPro}
      />
    </div>
  );
}
