import React, { useState, useEffect } from "react";
import { ArrowDown, ArrowUp, Award, Building2, CreditCard, Edit2, Eye, Flag, Lightbulb, Search, Shield, Trash2, UserCheck, Users, UserX, Zap } from "lucide-react";
import { useAppContext } from "./AppContext";
import { useCityStateAutofill } from "./hooks/useCityStateAutofill";

export function AdminDashboard({ setAdminMode, showAlert }) {
  const { setView } = useAppContext();
    const [stats, setStats] = useState(null);
    const [extStats, setExtStats] = useState(null);
    const [allSingers, setAllSingers] = useState([]);
    const [allOrgs, setAllOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminTab, setAdminTab] = useState("pending");
    const [adminMainTab, setAdminMainTab] = useState("singers"); // 'singers' | 'orgs'
    const [adminViewSinger, setAdminViewSinger] = useState(null);
    const [editingSinger, setEditingSinger] = useState(null);
    const [editForm, setEditForm] = useState({});
    const { stateAutoFilled, handleCityChange, handleStateChange } = useCityStateAutofill(setEditForm);
    const [singerSearchQuery, setSingerSearchQuery] = useState("");
    const [adminViewOrg, setAdminViewOrg] = useState(null);
    const [editingOrg, setEditingOrg] = useState(null);
    const [orgEditForm, setOrgEditForm] = useState({});
    const [creditAdjustOrgId, setCreditAdjustOrgId] = useState(null);
    const [creditAdjustForm, setCreditAdjustForm] = useState({ amount: "", reason: "Promotional Grant" });
    const [creditAdjustError, setCreditAdjustError] = useState("");
    const [giftTarget, setGiftTarget] = useState(null); // { type: 'singer'|'org', id, name }
    const [giftForm, setGiftForm] = useState({ duration: "1y", customDate: "", reason: "" });
    const [giftError, setGiftError] = useState("");
    const [giftSubmitting, setGiftSubmitting] = useState(false);
    const [repertoireSuggestions, setRepertoireSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState("");
    const [reseedLoading, setReseedLoading] = useState(false);
    const [reseedResult, setReseedResult] = useState(null);
    const [reseedError, setReseedError] = useState("");

    const handleReseedDemo = async () => {
      if (!confirm("This will delete all demo singers (emails ending in @example.com) and the 7 demo organizations, then re-insert 100 demo singers + 7 demo orgs. Real user accounts will NOT be affected. Continue?")) return;
      setReseedLoading(true);
      setReseedError("");
      setReseedResult(null);
      try {
        const res = await fetch("/api/admin/seed-demo", { method: "POST", credentials: "include" });
        const data = await res.json();
        if (!res.ok) {
          setReseedError(data.message || "Reseed failed");
        } else {
          setReseedResult(data);
        }
      } catch (e) {
        setReseedError(e.message || "Network error");
      } finally {
        setReseedLoading(false);
      }
    };

    useEffect(() => {
      if (adminMainTab !== "suggestions") return;
      let cancelled = false;
      (async () => {
        setSuggestionsLoading(true);
        setSuggestionsError("");
        try {
          const res = await fetch("/api/admin/repertoire-suggestions", { credentials: "include" });
          if (!res.ok) throw new Error("Failed to load suggestions");
          const data = await res.json();
          if (!cancelled) setRepertoireSuggestions(Array.isArray(data) ? data : []);
        } catch (err) {
          if (!cancelled) setSuggestionsError(err.message || "Failed to load suggestions");
        } finally {
          if (!cancelled) setSuggestionsLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [adminMainTab]);

    const handleGiftPro = async () => {
      if (!giftTarget) return;
      setGiftError("");
      setGiftSubmitting(true);
      try {
        const url = giftTarget.type === 'singer'
          ? `/api/admin/singers/${giftTarget.id}/gift-pro`
          : `/api/admin/orgs/${giftTarget.id}/gift-pro`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(giftForm),
        });
        const data = await res.json();
        if (!res.ok) { setGiftError(data.message || "Failed to gift Pro"); return; }
        showAlert(`Pro access gifted to ${giftTarget.name}`, "success");
        setGiftTarget(null);
        setGiftForm({ duration: "1y", customDate: "", reason: "" });
        await loadAdminData();
        if (giftTarget.type === 'singer' && adminViewSinger && adminViewSinger.id === giftTarget.id) await handleViewSinger(giftTarget.id);
        if (giftTarget.type === 'org' && adminViewOrg && adminViewOrg.id === giftTarget.id) await handleViewOrg(giftTarget.id);
      } catch (err) {
        setGiftError("Failed to gift Pro");
      } finally {
        setGiftSubmitting(false);
      }
    };

    const renderGiftModal = () => {
      if (!giftTarget) return null;
      const close = () => { setGiftTarget(null); setGiftError(""); setGiftForm({ duration: "1y", customDate: "", reason: "" }); };
      return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={close} data-testid="modal-gift-pro">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">🎁 Gift Pro Access</h3>
                <p className="text-sm text-slate-500 mt-0.5">To: <span className="font-medium text-slate-700">{giftTarget.name}</span> ({giftTarget.type === 'singer' ? 'Singer' : 'Organization'})</p>
              </div>
              <button onClick={close} className="text-slate-400 hover:text-slate-600" data-testid="button-close-gift">✕</button>
            </div>
            <div className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
                <select value={giftForm.duration} onChange={e => setGiftForm(f => ({ ...f, duration: e.target.value }))} className="w-full border border-slate-300 rounded-md h-9 px-2 text-sm" data-testid="select-gift-duration">
                  <option value="1m">1 month</option>
                  <option value="3m">3 months</option>
                  <option value="6m">6 months</option>
                  <option value="1y">1 year</option>
                  <option value="custom">Custom date…</option>
                </select>
              </div>
              {giftForm.duration === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Expires On</label>
                  <input type="date" value={giftForm.customDate} onChange={e => setGiftForm(f => ({ ...f, customDate: e.target.value }))} className="w-full border border-slate-300 rounded-md h-9 px-2 text-sm" data-testid="input-gift-custom-date" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Reason (optional)</label>
                <textarea value={giftForm.reason} onChange={e => setGiftForm(f => ({ ...f, reason: e.target.value }))} rows={2} className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm" placeholder="e.g. Beta tester, Promotional grant, VIP partner" data-testid="textarea-gift-reason" />
              </div>
              {giftError && <p className="text-sm text-red-600" data-testid="text-gift-error">{giftError}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={close} className="h-9 px-4 rounded-md text-sm text-slate-700 bg-slate-100 hover:bg-slate-200" data-testid="button-cancel-gift">Cancel</button>
              <button onClick={handleGiftPro} disabled={giftSubmitting} className="h-9 px-4 rounded-md text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50" data-testid="button-confirm-gift">{giftSubmitting ? "Gifting…" : "Gift Pro Access"}</button>
            </div>
          </div>
        </div>
      );
    };

    const FACH_OPTIONS_ADMIN = ["Soprano","Mezzo-Soprano","Contralto","Countertenor","Tenor","Baritone","Bass-Baritone","Bass"];
    const VOICE_TYPE_OPTIONS_ADMIN = ["Soprano","Mezzo-Soprano","Contralto","Countertenor","Tenor","Baritone","Bass-Baritone","Bass"];
    const UNION_OPTIONS_ADMIN = ["Non-Union","AGMA","AEA","AFM","AGMA Member","AEA Member","AFM Member"];
    const TIER_OPTIONS_ADMIN = ["free","pro","founding"];
    const STATE_OPTIONS_ADMIN = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
    const CREDIT_REASONS = ["Promotional Grant","Support Adjustment","Refund","Correction","Other"];

    const loadAdminData = async () => {
      try {
        const [statsRes, extStatsRes, singersRes, orgsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/stats-extended"),
          fetch("/api/admin/singers"),
          fetch("/api/admin/orgs"),
        ]);
        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        if (!singersRes.ok) throw new Error("Failed to fetch singers");
        if (!orgsRes.ok) throw new Error("Failed to fetch organizations");
        setStats(await statsRes.json());
        if (extStatsRes.ok) setExtStats(await extStatsRes.json());
        setAllSingers(await singersRes.json());
        setAllOrgs(await orgsRes.json());
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    useEffect(() => { loadAdminData(); }, []);

    const handleAdminAction = async (singerId, action) => {
      try {
        let url, method;
        if (action === "approve") { url = `/api/admin/singers/${singerId}/approve`; method = "PUT"; }
        else if (action === "reject") { url = `/api/admin/singers/${singerId}/reject`; method = "PUT"; }
        else if (action === "deactivate") {
          const singer = allSingers.find(s => s.id === singerId);
          const name = singer ? `${singer.first_name} ${singer.last_name}` : "this singer";
          if (!window.confirm(`Are you sure you want to deactivate ${name}? They will no longer appear in search results.`)) return;
          url = `/api/admin/singers/${singerId}/deactivate`; method = "PUT";
        }
        else if (action === "activate") { url = `/api/admin/singers/${singerId}/activate`; method = "PUT"; }
        else if (action === "delete") {
          if (!confirm("Permanently delete this singer and all their data?")) return;
          url = `/api/admin/singers/${singerId}`; method = "DELETE";
        }
        const res = await fetch(url, { method });
        if (!res.ok) throw new Error("Action failed");
        showAlert(`Singer ${action}d successfully`, "success");
        await loadAdminData();
      } catch (err) {
        showAlert(`Failed to ${action} singer`, "error");
      }
    };

    const handleBadgeToggle = async (singerId, field, currentValue) => {
      try {
        const res = await fetch(`/api/admin/singers/${singerId}/badges`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field, value: !currentValue }),
        });
        if (!res.ok) throw new Error("Badge update failed");
        await loadAdminData();
      } catch (err) {
        showAlert("Failed to update badge", "error");
      }
    };

    const handleViewSinger = async (singerId) => {
      try {
        const res = await fetch(`/api/admin/singers/${singerId}`);
        if (!res.ok) throw new Error("Failed to load singer");
        setAdminViewSinger(await res.json());
      } catch (err) {
        showAlert("Failed to load singer profile", "error");
      }
    };

    const handleEditSinger = async () => {
      try {
        const res = await fetch(`/api/admin/singers/${editingSinger.id}/edit`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });
        if (!res.ok) throw new Error("Failed to save");
        showAlert("Singer profile updated", "success");
        setEditingSinger(null);
        await loadAdminData();
      } catch (err) {
        showAlert("Failed to update singer", "error");
      }
    };

    const getStatusBadge = (singer) => {
      if (singer.subscription_status === "inactive") return { label: "Inactive", color: "bg-slate-100 text-slate-600" };
      if (singer.admin_approved) return { label: "Profile Approved", color: "bg-emerald-100 text-emerald-700" };
      if (singer.admin_rejected) return { label: "Rejected", color: "bg-red-100 text-red-700" };
      return { label: "Pending Approval", color: "bg-amber-100 text-amber-700" };
    };

    const handleViewOrg = async (orgId) => {
      try {
        const res = await fetch(`/api/admin/orgs/${orgId}`);
        if (!res.ok) throw new Error("Failed to load");
        const orgData = await res.json();
        const adjRes = await fetch(`/api/admin/orgs/${orgId}/credit-adjustments`);
        const adjustments = adjRes.ok ? await adjRes.json() : [];
        setAdminViewOrg({ ...orgData, credit_adjustments: adjustments });
      } catch (err) {
        showAlert("Failed to load organization profile", "error");
      }
    };

    const handleEditOrg = async () => {
      try {
        const orgId = editingOrg.id;
        const res = await fetch(`/api/admin/orgs/${orgId}/edit`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orgEditForm),
        });
        if (!res.ok) throw new Error("Failed to save");
        showAlert("Organization updated", "success");
        setEditingOrg(null);
        await loadAdminData();
        // Return admin to the org profile view for the same org
        await handleViewOrg(orgId);
      } catch (err) {
        showAlert("Failed to update organization", "error");
      }
    };

    const handleToggleOrgSubscription = async (orgId, currentTier) => {
      try {
        const tier = currentTier === "pro" ? "free" : "pro";
        const res = await fetch(`/api/admin/orgs/${orgId}/subscription`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier }),
        });
        if (!res.ok) throw new Error("Failed");
        showAlert(`Organization set to ${tier === "pro" ? "Pro" : "Free"}`, "success");
        await loadAdminData();
        if (adminViewOrg && adminViewOrg.id === orgId) await handleViewOrg(orgId);
      } catch (err) {
        showAlert("Failed to update subscription", "error");
      }
    };

    const handleDeleteOrg = async (orgId) => {
      if (!confirm("Permanently delete this organization and all its reveal/search/feedback history?")) return;
      try {
        const res = await fetch(`/api/admin/orgs/${orgId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
        showAlert("Organization deleted", "success");
        await loadAdminData();
      } catch (err) {
        showAlert("Failed to delete organization", "error");
      }
    };

    const handleAdjustCredits = async (orgId) => {
      setCreditAdjustError("");
      const amt = parseInt(creditAdjustForm.amount);
      if (!Number.isFinite(amt) || amt === 0) {
        setCreditAdjustError("Enter a non-zero amount.");
        return;
      }
      try {
        const res = await fetch(`/api/admin/orgs/${orgId}/credits`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amt, reason: creditAdjustForm.reason }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          // Inline error — keep panel open so admin can correct the amount
          const targetOrg = adminViewOrg && adminViewOrg.id === orgId
            ? adminViewOrg
            : allOrgs.find(o => o.id === orgId);
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
        setCreditAdjustForm({ amount: "", reason: "Promotional Grant" });
        setCreditAdjustError("");
        await loadAdminData();
        // Stay in the same context: refresh detail view if currently viewing this org
        if (adminViewOrg && adminViewOrg.id === orgId) await handleViewOrg(orgId);
      } catch (err) {
        setCreditAdjustError(err.message || "Network error. Please try again.");
      }
    };

    const filteredSingers = allSingers.filter(s => {
      const q = singerSearchQuery.trim().toLowerCase();
      if (q) {
        // When searching, ignore tab filter and search across all loaded singers
        const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
        return fullName.includes(q) || (s.email || "").toLowerCase().includes(q);
      }
      if (adminTab === "pending" && !(!s.admin_approved && !s.admin_rejected && s.subscription_status !== "inactive")) return false;
      if (adminTab === "rejected" && !(!s.admin_approved && s.admin_rejected && s.subscription_status !== "inactive")) return false;
      if (adminTab === "approved" && !(s.admin_approved && s.subscription_status !== "inactive")) return false;
      if (adminTab === "inactive" && s.subscription_status !== "inactive") return false;
      if (adminTab === "requests" && !(s.emergency_status_requested === true && !s.is_emergency_ready)) return false;
      return true;
    });

    // Reusable credit-adjustment modal — rendered in both org detail and main dashboard
    // so opening it from the detail view does NOT navigate away.
    const renderCreditModal = () => {
      if (creditAdjustOrgId === null) return null;
      const targetOrg = (adminViewOrg && adminViewOrg.id === creditAdjustOrgId)
        ? adminViewOrg
        : allOrgs.find(o => o.id === creditAdjustOrgId);
      if (!targetOrg) return null;
      const balance = (targetOrg.contact_reveal_limit ?? 0) - (targetOrg.contact_reveals_used_this_month ?? 0);
      const close = () => {
        setCreditAdjustOrgId(null);
        setCreditAdjustForm({ amount: "", reason: "Promotional Grant" });
        setCreditAdjustError("");
      };
      return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={close} data-testid="modal-credit-adjust-overlay">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()} data-testid="modal-credit-adjust">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Adjust Credits</h3>
            <p className="text-sm text-slate-600 mb-4">{targetOrg.organization_name}</p>
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
              <p className="text-xs text-slate-500">Current Balance</p>
              <p className="font-bold text-emerald-700 text-2xl" data-testid="text-credit-current-balance">{balance}</p>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount (positive = add, negative = subtract)</label>
              <input
                type="number"
                className="border border-slate-300 rounded-md h-10 px-3 text-sm w-full"
                value={creditAdjustForm.amount}
                onChange={e => { setCreditAdjustForm({...creditAdjustForm, amount: e.target.value}); if (creditAdjustError) setCreditAdjustError(""); }}
                placeholder="e.g. 5 or -2"
                data-testid={`input-credit-amount-${creditAdjustOrgId}`}
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
              <select
                className="border border-slate-300 rounded-md h-10 px-3 text-sm w-full"
                value={creditAdjustForm.reason}
                onChange={e => setCreditAdjustForm({...creditAdjustForm, reason: e.target.value})}
                data-testid={`select-credit-reason-${creditAdjustOrgId}`}
              >
                {CREDIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {creditAdjustError && (
              <p className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2" data-testid="text-credit-error">
                {creditAdjustError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={close} className="h-9 px-4 rounded-md text-sm text-slate-700 bg-slate-100 hover:bg-slate-200" data-testid="button-cancel-credit">Cancel</button>
              <button onClick={() => handleAdjustCredits(creditAdjustOrgId)} className="h-9 px-4 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700" data-testid={`button-confirm-credit-${creditAdjustOrgId}`}>Confirm</button>
            </div>
          </div>
        </div>
      );
    };

    if (adminViewOrg) {
      const o = adminViewOrg;
      const balance = (o.contact_reveal_limit ?? 0) - (o.contact_reveals_used_this_month ?? 0);
      return (
        <div className="min-h-screen bg-slate-50">
          <nav className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center cursor-pointer" onClick={() => setView("landing")}>
                  <span className="text-2xl font-bold text-slate-900">Singer Search</span>
                  <span className="ml-2 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">ADMIN</span>
                </div>
                <button onClick={() => setAdminViewOrg(null)} className="text-sm text-blue-600 hover:text-blue-800" data-testid="link-back-org-list">← Back to List</button>
              </div>
            </div>
          </nav>
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap" data-testid="text-org-name">
                    {o.organization_name}
                    {o.founding_org && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">🌟 FOUNDING</span>}
                    {o.is_gifted && <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full">🎁 GIFTED</span>}
                  </h2>
                  <p className="text-sm text-slate-500">{o.email} · {o.city || "—"}{o.state ? `, ${o.state}` : ""}</p>
                  {o.contact_person_name && <p className="text-xs text-slate-500 mt-1">Contact: {o.contact_person_name} {o.contact_person_email ? `<${o.contact_person_email}>` : ""}</p>}
                  {o.subscription_tier === 'pro' && o.pro_expires_at && (
                    <p className="text-xs text-slate-500 mt-1">Pro access until {new Date(o.pro_expires_at).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${o.subscription_tier === "pro" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>{(o.subscription_tier || "free").toUpperCase()}</span>
                    <p className="text-xs text-slate-500 mt-1">Joined {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</p>
                  </div>
                  <button onClick={() => setGiftTarget({ type: 'org', id: o.id, name: o.organization_name })} className="px-3 py-1.5 text-sm rounded-md bg-violet-600 text-white hover:bg-violet-700 flex items-center gap-1 ml-auto" data-testid="button-gift-org-detail">🎁 Gift Pro</button>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Credit Balance</p><p className="text-lg font-bold text-emerald-600" data-testid="text-org-balance">{balance}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Limit</p><p className="text-lg font-bold text-slate-900">{o.contact_reveal_limit ?? 0}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Used This Month</p><p className="text-lg font-bold text-slate-900">{o.contact_reveals_used_this_month ?? 0}</p></div>
                <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Total Reveals</p><p className="text-lg font-bold text-slate-900">{o.reveal_history?.length ?? 0}</p></div>
              </div>
              {o.admin_notes && <div className="px-6 pb-5"><h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">Admin Notes</h4><p className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded p-3 whitespace-pre-wrap">{o.admin_notes}</p></div>}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-900">Contact Reveal History (last 50)</h3></div>
              {o.reveal_history?.length === 0 ? <div className="p-6 text-sm text-slate-500">No contact reveals yet.</div> : (
                <table className="w-full text-sm">
                  <thead><tr className="text-left bg-slate-50 text-xs"><th className="px-4 py-2 text-slate-500">Singer</th><th className="px-4 py-2 text-slate-500">Voice Type</th><th className="px-4 py-2 text-slate-500">Date</th><th className="px-4 py-2 text-slate-500">Type</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {o.reveal_history?.map(r => (
                      <tr key={r.id} data-testid={`row-reveal-${r.id}`}>
                        <td className="px-4 py-2 text-slate-900">{r.first_name} {r.last_name}</td>
                        <td className="px-4 py-2 text-slate-600">{r.primary_voice_type || "—"}</td>
                        <td className="px-4 py-2 text-slate-500">{r.revealed_at ? new Date(r.revealed_at).toLocaleString() : "—"}</td>
                        <td className="px-4 py-2">{r.is_emergency ? <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Urgent</span> : <span className="text-xs text-slate-500">Standard</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-900">Search History (last 20)</h3></div>
              {o.search_history?.length === 0 ? <div className="p-6 text-sm text-slate-500">No searches logged.</div> : (
                <ul className="divide-y divide-slate-100">
                  {o.search_history?.map(s => (
                    <li key={s.id} className="px-4 py-3 text-sm" data-testid={`row-search-${s.id}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{s.created_at ? new Date(s.created_at).toLocaleString() : "—"}</span>
                      </div>
                      <pre className="text-xs text-slate-600 mt-1 whitespace-pre-wrap font-mono bg-slate-50 rounded p-2 overflow-x-auto">{JSON.stringify(s.search_filters, null, 0)}</pre>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-900">Engagement Feedback Submitted</h3></div>
              {o.feedback_history?.length === 0 ? <div className="p-6 text-sm text-slate-500">No feedback submitted.</div> : (
                <table className="w-full text-sm">
                  <thead><tr className="text-left bg-slate-50 text-xs"><th className="px-4 py-2 text-slate-500">Singer</th><th className="px-4 py-2 text-slate-500">Role</th><th className="px-4 py-2 text-slate-500">Date</th><th className="px-4 py-2 text-slate-500">Marks</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {o.feedback_history?.map(f => (
                      <tr key={f.id} data-testid={`row-feedback-${f.id}`}>
                        <td className="px-4 py-2 text-slate-900">{f.first_name} {f.last_name}</td>
                        <td className="px-4 py-2 text-slate-600">{f.role_name}</td>
                        <td className="px-4 py-2 text-slate-500">{f.engagement_date}</td>
                        <td className="px-4 py-2 text-xs">
                          {f.was_prepared && <span className="inline-block bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded mr-1">Prepared</span>}
                          {f.was_professional && <span className="inline-block bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded mr-1">Professional</span>}
                          {f.was_accurate && <span className="inline-block bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">Accurate</span>}
                          {!f.was_prepared && !f.was_professional && !f.was_accurate && <span className="text-slate-400">— none —</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-900">🎁 Gift History</h3></div>
              {(!o.gift_history || o.gift_history.length === 0) ? <div className="p-6 text-sm text-slate-500">No Pro gifts recorded.</div> : (
                <ul className="divide-y divide-slate-100">
                  {o.gift_history.map(g => (
                    <li key={g.id} className="px-4 py-3 text-sm flex items-center justify-between gap-2" data-testid={`row-gift-org-${g.id}`}>
                      <div>
                        <div className="font-medium text-slate-900">{g.duration_days} days · expires {new Date(g.expires_at).toLocaleDateString()}</div>
                        {g.reason && <div className="text-xs text-slate-500">Reason: {g.reason}</div>}
                      </div>
                      <span className="text-xs text-slate-400">{g.created_at ? new Date(g.created_at).toLocaleDateString() : "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-900">Credit Adjustment History</h3></div>
              {o.credit_adjustments?.length === 0 ? <div className="p-6 text-sm text-slate-500">No adjustments recorded.</div> : (
                <table className="w-full text-sm">
                  <thead><tr className="text-left bg-slate-50 text-xs"><th className="px-4 py-2 text-slate-500">Date</th><th className="px-4 py-2 text-slate-500">Reason</th><th className="px-4 py-2 text-slate-500 text-right">Amount</th><th className="px-4 py-2 text-slate-500 text-right">Prev</th><th className="px-4 py-2 text-slate-500 text-right">New</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {o.credit_adjustments?.map(a => (
                      <tr key={a.id} data-testid={`row-adjustment-${a.id}`}>
                        <td className="px-4 py-2 text-slate-500">{a.created_at ? new Date(a.created_at).toLocaleString() : "—"}</td>
                        <td className="px-4 py-2 text-slate-700">{a.admin_action}</td>
                        <td className={`px-4 py-2 text-right font-medium ${a.amount > 0 ? "text-emerald-600" : "text-red-600"}`}>{a.amount > 0 ? "+" : ""}{a.amount}</td>
                        <td className="px-4 py-2 text-right text-slate-500">{a.previous_balance}</td>
                        <td className="px-4 py-2 text-right text-slate-900 font-medium">{a.new_balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => handleToggleOrgSubscription(o.id, o.subscription_tier)} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700" data-testid="button-toggle-org-tier-detail">
                {o.subscription_tier === "pro" ? "Downgrade to Free" : "Upgrade to Pro"}
              </button>
              <button onClick={() => { setEditingOrg(o); setOrgEditForm({ organization_name: o.organization_name || "", email: o.email || "", city: o.city || "", contact_person_name: o.contact_person_name || "", contact_person_email: o.contact_person_email || "", subscription_tier: o.subscription_tier || "free", admin_notes: o.admin_notes || "" }); setAdminViewOrg(null); }} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700" data-testid="button-edit-org-detail">
                Edit
              </button>
              <button onClick={() => { setCreditAdjustOrgId(o.id); setCreditAdjustForm({ amount: "", reason: "Promotional Grant" }); setCreditAdjustError(""); }} className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200" data-testid="button-adjust-credits-detail">
                Adjust Credits
              </button>
            </div>
          </div>
          {renderCreditModal()}
        </div>
      );
    }

    if (editingOrg) {
      return (
        <div className="min-h-screen bg-slate-50">
          <nav className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center cursor-pointer" onClick={() => setView("landing")}>
                  <span className="text-2xl font-bold text-slate-900">Singer Search</span>
                  <span className="ml-2 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">ADMIN</span>
                </div>
                <button onClick={() => setEditingOrg(null)} className="text-sm text-blue-600 hover:text-blue-800">← Back to List</button>
              </div>
            </div>
          </nav>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Edit Organization: {editingOrg.organization_name}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                  <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.organization_name || ""} onChange={e => setOrgEditForm({...orgEditForm, organization_name: e.target.value})} data-testid="input-org-edit-name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.email || ""} onChange={e => setOrgEditForm({...orgEditForm, email: e.target.value})} data-testid="input-org-edit-email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.city || ""} onChange={e => setOrgEditForm({...orgEditForm, city: e.target.value})} data-testid="input-org-edit-city" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person Name</label>
                    <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.contact_person_name || ""} onChange={e => setOrgEditForm({...orgEditForm, contact_person_name: e.target.value})} data-testid="input-org-edit-contact-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person Email</label>
                    <input type="email" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.contact_person_email || ""} onChange={e => setOrgEditForm({...orgEditForm, contact_person_email: e.target.value})} data-testid="input-org-edit-contact-email" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Tier</label>
                  <select className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.subscription_tier || "free"} onChange={e => setOrgEditForm({...orgEditForm, subscription_tier: e.target.value})} data-testid="select-org-edit-tier">
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes (internal only)</label>
                  <textarea rows={4} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" value={orgEditForm.admin_notes || ""} onChange={e => setOrgEditForm({...orgEditForm, admin_notes: e.target.value})} data-testid="textarea-org-edit-notes" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setEditingOrg(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">Cancel</button>
                  <button onClick={handleEditOrg} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700" data-testid="button-save-org-edit">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (adminViewSinger) {
      const s = adminViewSinger;
      return (
        <div className="min-h-screen bg-slate-50">
          <nav className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center cursor-pointer" onClick={() => setView("landing")}>
                  <span className="text-2xl font-bold text-slate-900">Singer Search</span>
                  <span className="ml-2 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">ADMIN</span>
                </div>
                <button onClick={() => setAdminViewSinger(null)} className="text-sm text-blue-600 hover:text-blue-800">← Back to List</button>
              </div>
            </div>
          </nav>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                      {s.first_name} {s.last_name}
                      {s.founding_artist && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">🌟 FOUNDING</span>}
                      {s.is_gifted && <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full">🎁 GIFTED</span>}
                    </h2>
                    <p className="text-sm text-slate-500">{s.primary_voice_type} · {s.city}, {s.state} · {s.email}</p>
                    {s.subscription_tier === 'pro' && s.pro_expires_at && (
                      <p className="text-xs text-slate-500 mt-0.5">Pro access until {new Date(s.pro_expires_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  <button onClick={() => setGiftTarget({ type: 'singer', id: s.id, name: `${s.first_name} ${s.last_name}` })} className="px-3 py-1.5 text-sm rounded-md bg-violet-600 text-white hover:bg-violet-700 flex items-center gap-1" data-testid="button-gift-singer-detail">🎁 Gift Pro</button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {s.gift_history?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">🎁 Gift History</h4>
                    <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                      {s.gift_history.map(g => (
                        <li key={g.id} className="px-3 py-2 text-sm flex items-center justify-between gap-2" data-testid={`row-gift-singer-${g.id}`}>
                          <div>
                            <div className="font-medium text-slate-900">{g.duration_days} days · expires {new Date(g.expires_at).toLocaleDateString()}</div>
                            {g.reason && <div className="text-xs text-slate-500">Reason: {g.reason}</div>}
                          </div>
                          <span className="text-xs text-slate-400">{g.created_at ? new Date(g.created_at).toLocaleDateString() : "—"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {s.short_bio && <div><h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">Bio</h4><p className="text-slate-700">{s.short_bio}</p></div>}
                {s.roles?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Opera Roles ({s.roles.length})</h4>
                    <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                      {s.roles.map(r => <li key={r.id} className="px-3 py-2 text-sm"><span className="font-medium">{r.role_name}</span> in <span className="italic">{r.work_title}</span> ({r.composer})</li>)}
                    </ul>
                  </div>
                )}
                {s.works?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Concert Works ({s.works.length})</h4>
                    <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                      {s.works.map(w => <li key={w.id} className="px-3 py-2 text-sm"><span className="font-medium">{w.work_title}</span> — {w.composer}</li>)}
                    </ul>
                  </div>
                )}
                {s.availabilities?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Availability Windows</h4>
                    <div className="flex flex-wrap gap-2">
                      {s.availabilities.map(a => <span key={a.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">{a.start_date} → {a.end_date}</span>)}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button onClick={() => { handleAdminAction(s.id, s.admin_approved ? "reject" : "approve"); setAdminViewSinger(null); }} className={`px-4 py-2 rounded-md text-sm font-medium text-white ${s.admin_approved ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    {s.admin_approved ? "Reject" : "Approve"}
                  </button>
                  <button onClick={() => { handleAdminAction(s.id, "deactivate"); setAdminViewSinger(null); }} className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (editingSinger) {
      return (
        <div className="min-h-screen bg-slate-50">
          <nav className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center cursor-pointer" onClick={() => setView("landing")}>
                  <span className="text-2xl font-bold text-slate-900">Singer Search</span>
                  <span className="ml-2 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">ADMIN</span>
                </div>
                <button onClick={() => setEditingSinger(null)} className="text-sm text-blue-600 hover:text-blue-800">← Back to List</button>
              </div>
            </div>
          </nav>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Edit Singer: {editingSinger.first_name} {editingSinger.last_name}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.first_name || ""} onChange={e => setEditForm({...editForm, first_name: e.target.value})} data-testid="input-edit-first-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.last_name || ""} onChange={e => setEditForm({...editForm, last_name: e.target.value})} data-testid="input-edit-last-name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Primary Voice Type</label>
                    <select className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.primary_voice_type || ""} onChange={e => setEditForm({...editForm, primary_voice_type: e.target.value})} data-testid="select-edit-voice-type">
                      <option value="">— Select —</option>
                      {VOICE_TYPE_OPTIONS_ADMIN.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Primary Fach</label>
                    <select className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.primary_fach || ""} onChange={e => setEditForm({...editForm, primary_fach: e.target.value})} data-testid="select-edit-fach">
                      <option value="">— Select —</option>
                      {FACH_OPTIONS_ADMIN.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm"
                      value={editForm.city || ""}
                      onChange={e => handleCityChange(e.target.value)}
                      data-testid="input-edit-city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">State
                      {stateAutoFilled && <span className="text-[10px] font-normal text-slate-400 italic" data-testid="label-state-autofilled">auto-filled</span>}
                    </label>
                    <select
                      className={`w-full border border-slate-300 rounded-md h-10 px-3 text-sm ${stateAutoFilled ? 'text-slate-500' : ''}`}
                      value={editForm.state || ""}
                      onChange={e => handleStateChange(e.target.value)}
                      data-testid="select-edit-state"
                    >
                      <option value="">—</option>
                      {STATE_OPTIONS_ADMIN.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.email || ""} onChange={e => setEditForm({...editForm, email: e.target.value})} data-testid="input-edit-email" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Union Status</label>
                    <select className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.union_status || ""} onChange={e => setEditForm({...editForm, union_status: e.target.value})} data-testid="select-edit-union">
                      <option value="">— Select —</option>
                      {UNION_OPTIONS_ADMIN.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Tier</label>
                    <select className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.subscription_tier || "free"} onChange={e => setEditForm({...editForm, subscription_tier: e.target.value})} data-testid="select-edit-tier">
                      {TIER_OPTIONS_ADMIN.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                  <textarea rows={3} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" value={editForm.short_bio || ""} onChange={e => setEditForm({...editForm, short_bio: e.target.value})} data-testid="textarea-edit-bio" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes (internal only)</label>
                  <textarea rows={3} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" value={editForm.admin_notes || ""} onChange={e => setEditForm({...editForm, admin_notes: e.target.value})} data-testid="textarea-edit-admin-notes" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setEditingSinger(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">Cancel</button>
                  <button onClick={handleEditSinger} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700" data-testid="button-save-singer-edit">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center cursor-pointer" onClick={() => setView("adminDashboard")}>
                <span className="text-2xl font-bold text-slate-900">Singer Search</span>
                <span className="ml-2 text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">ADMIN</span>
              </div>
              <button
                data-testid="button-admin-logout"
                onClick={async () => {
                  await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
                  setView("landing", { replace: true });
                  setAdminMode(false);
                }}
                className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Platform Overview</h1>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => { setAdminMainTab("singers"); setAdminViewOrg(null); setEditingOrg(null); }}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
                  data-testid="card-stat-singers"
                >
                  <p className="text-xs font-medium text-slate-500 mb-1">Total Singers →</p>
                  <p className="text-2xl font-bold text-slate-900" data-testid="stat-total-singers">{stats.total_singers}</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setAdminMainTab("singers"); setAdminViewOrg(null); setEditingOrg(null); }}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
                  data-testid="card-stat-founding"
                >
                  <p className="text-xs font-medium text-slate-500 mb-1">Founding Artists →</p>
                  <p className="text-2xl font-bold text-amber-600" data-testid="stat-founding-count">{stats.founding_count}</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setAdminMainTab("orgs"); setAdminViewSinger(null); setEditingSinger(null); }}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
                  data-testid="card-stat-orgs"
                >
                  <p className="text-xs font-medium text-slate-500 mb-1">Organizations →</p>
                  <p className="text-2xl font-bold text-slate-900" data-testid="stat-total-orgs">{stats.total_orgs}</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setAdminMainTab("orgs"); setAdminViewSinger(null); setEditingSinger(null); }}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
                  data-testid="card-stat-pro-orgs"
                >
                  <p className="text-xs font-medium text-slate-500 mb-1">Pro Organizations</p>
                  <p className="text-2xl font-bold text-indigo-600" data-testid="stat-pro-orgs">{extStats?.pro_orgs ?? "—"}</p>
                </button>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-medium text-slate-500 mb-1">Searches</p>
                  <p className="text-2xl font-bold text-blue-600" data-testid="stat-total-searches">{stats.total_searches}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-medium text-slate-500 mb-1">Contact Reveals</p>
                  <p className="text-2xl font-bold text-emerald-600" data-testid="stat-total-reveals">{stats.total_contact_reveals}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-medium text-slate-500 mb-1">Reveals This Month</p>
                  <p className="text-2xl font-bold text-emerald-600" data-testid="stat-reveals-this-month">{extStats?.reveals_this_month ?? "—"}</p>
                </div>
              </div>

              {/* Main tab navigation */}
              <div className="border-b border-slate-200 mb-6 flex gap-2">
                <button
                  onClick={() => { setAdminMainTab("singers"); setAdminViewOrg(null); setEditingOrg(null); setCreditAdjustOrgId(null); }}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${adminMainTab === "singers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                  data-testid="tab-main-singers"
                >
                  <Users className="w-4 h-4 inline mr-1" /> Singers
                  <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{allSingers.length}</span>
                </button>
                <button
                  onClick={() => { setAdminMainTab("orgs"); setAdminViewSinger(null); setEditingSinger(null); }}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${adminMainTab === "orgs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                  data-testid="tab-main-orgs"
                >
                  <Building2 className="w-4 h-4 inline mr-1" /> Organizations
                  <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{allOrgs.length}</span>
                </button>
                <button
                  onClick={() => { setAdminMainTab("suggestions"); setAdminViewSinger(null); setEditingSinger(null); setAdminViewOrg(null); setEditingOrg(null); setCreditAdjustOrgId(null); }}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${adminMainTab === "suggestions" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                  data-testid="tab-main-suggestions"
                >
                  <Lightbulb className="w-4 h-4 inline mr-1" /> Repertoire Suggestions
                </button>
              </div>

              {adminMainTab === "suggestions" && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8" data-testid="section-repertoire-suggestions">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Repertoire Suggestions</h2>
                    <span className="text-sm text-slate-500">{repertoireSuggestions.length} total</span>
                  </div>
                  {suggestionsLoading ? (
                    <div className="p-6 text-sm text-slate-500">Loading…</div>
                  ) : suggestionsError ? (
                    <div className="p-6 text-sm text-red-600">{suggestionsError}</div>
                  ) : repertoireSuggestions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500"><Lightbulb className="w-8 h-8 mx-auto mb-2 text-slate-300" /><p className="text-sm">No suggestions yet.</p></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="text-left px-4 py-2 font-medium">Singer</th>
                            <th className="text-left px-4 py-2 font-medium">Work Title</th>
                            <th className="text-left px-4 py-2 font-medium">Composer</th>
                            <th className="text-left px-4 py-2 font-medium">Role</th>
                            <th className="text-left px-4 py-2 font-medium">Notes</th>
                            <th className="text-left px-4 py-2 font-medium">Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {repertoireSuggestions.map((s) => (
                            <tr key={s.id} className="border-t border-slate-100 align-top" data-testid={`row-suggestion-${s.id}`}>
                              <td className="px-4 py-2 text-slate-900">{[s.singer_first_name, s.singer_last_name].filter(Boolean).join(" ") || `Singer #${s.singer_id}`}</td>
                              <td className="px-4 py-2 text-slate-900">{s.work_title}</td>
                              <td className="px-4 py-2 text-slate-700">{s.composer || "—"}</td>
                              <td className="px-4 py-2 text-slate-700">{s.role_name || "—"}</td>
                              <td className="px-4 py-2 text-slate-700 max-w-xs whitespace-pre-wrap">{s.notes || "—"}</td>
                              <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {adminMainTab === "orgs" && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Organization Management</h2>
                    <span className="text-sm text-slate-500">{allOrgs.length} total organizations</span>
                  </div>
                  {allOrgs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500"><Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" /><p className="text-sm">No organizations yet.</p></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[1100px]" data-testid="admin-orgs-table">
                        <thead>
                          <tr className="bg-slate-50 text-left">
                            <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Organization</th>
                            <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Email</th>
                            <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">City</th>
                            <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Tier</th>
                            <th className="px-4 py-3 font-medium text-slate-600 text-right whitespace-nowrap">Balance</th>
                            <th className="px-4 py-3 font-medium text-slate-600 text-right whitespace-nowrap">Searches</th>
                            <th className="px-4 py-3 font-medium text-slate-600 text-right whitespace-nowrap">Reveals</th>
                            <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Joined</th>
                            <th className="px-4 py-3 font-medium text-slate-600 text-right whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {allOrgs.map(org => {
                            const balance = (org.contact_reveal_limit ?? 0) - (org.contact_reveals_used_this_month ?? 0);
                            const isPro = org.subscription_tier === "pro";
                            return (
                              <React.Fragment key={org.id}>
                                <tr className="hover:bg-slate-50" data-testid={`admin-org-row-${org.id}`}>
                                  <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900 flex items-center gap-1.5 flex-wrap">
                                      {org.organization_name}
                                      {org.founding_org && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full" title="Founding Organization">🌟 FOUNDING</span>}
                                      {org.is_gifted && <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full" title="Pro access gifted by admin">🎁 GIFTED</span>}
                                    </div>
                                    {org.organization_type && <div className="text-xs text-slate-400">{org.organization_type}</div>}
                                  </td>
                                  <td className="px-4 py-3 text-slate-600">{org.email}</td>
                                  <td className="px-4 py-3 text-slate-600">{org.city || "—"}{org.state ? `, ${org.state}` : ""}</td>
                                  <td className="px-4 py-3">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPro ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`} data-testid={`badge-org-tier-${org.id}`}>
                                      {isPro ? "Pro" : "Free"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium text-emerald-600" data-testid={`text-org-balance-${org.id}`}>{balance}</td>
                                  <td className="px-4 py-3 text-right text-slate-600">{org.search_count}</td>
                                  <td className="px-4 py-3 text-right text-slate-600">{org.reveal_count}</td>
                                  <td className="px-4 py-3 text-slate-500">{org.created_at ? new Date(org.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                      <button onClick={() => handleViewOrg(org.id)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="View" data-testid={`button-view-org-${org.id}`}><Eye className="w-4 h-4" /></button>
                                      <button onClick={() => { setEditingOrg(org); setOrgEditForm({ organization_name: org.organization_name || "", email: org.email || "", city: org.city || "", contact_person_name: org.contact_person_name || "", contact_person_email: org.contact_person_email || "", subscription_tier: org.subscription_tier || "free", admin_notes: org.admin_notes || "" }); }} className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100" title="Edit" data-testid={`button-edit-org-${org.id}`}><Edit2 className="w-4 h-4" /></button>
                                      <button onClick={() => { setCreditAdjustOrgId(org.id); setCreditAdjustForm({ amount: "", reason: "Promotional Grant" }); setCreditAdjustError(""); }} className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50" title="Adjust Credits" data-testid={`button-adjust-org-${org.id}`}><CreditCard className="w-4 h-4" /></button>
                                      <button onClick={() => handleToggleOrgSubscription(org.id, org.subscription_tier)} className={`p-1 rounded ${isPro ? "text-amber-600 hover:bg-amber-50" : "text-indigo-600 hover:bg-indigo-50"}`} title={isPro ? "Downgrade to Free" : "Upgrade to Pro"} data-testid={`button-toggle-org-tier-${org.id}`}>
                                        {isPro ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                                      </button>
                                      <button onClick={() => setGiftTarget({ type: 'org', id: org.id, name: org.organization_name })} className="text-violet-600 hover:text-violet-800 p-1 rounded hover:bg-violet-50 text-base leading-none" title="Gift Pro Access" data-testid={`button-gift-org-${org.id}`}>🎁</button>
                                      <button onClick={() => handleDeleteOrg(org.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Delete" data-testid={`button-delete-org-${org.id}`}><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {adminMainTab === "singers" && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900">Singer Management</h2>
                  <div className="flex items-center gap-3 flex-1 max-w-md">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search singers by name or email…"
                        value={singerSearchQuery}
                        onChange={e => setSingerSearchQuery(e.target.value)}
                        className="w-full border border-slate-300 rounded-md h-9 pl-9 pr-3 text-sm"
                        data-testid="input-singer-search"
                      />
                    </div>
                    <span className="text-sm text-slate-500 whitespace-nowrap">{allSingers.length} total</span>
                  </div>
                </div>

                <div className="border-b border-slate-200 px-6">
                  <div className="flex gap-6">
                    {[
                      { key: "pending", label: "Pending Approval", count: allSingers.filter(s => !s.admin_approved && !s.admin_rejected && s.subscription_status !== "inactive").length },
                      { key: "requests", label: "Urgent Status Requests", count: allSingers.filter(s => s.emergency_status_requested === true && !s.is_emergency_ready).length },
                      { key: "rejected", label: "Rejected", count: allSingers.filter(s => !s.admin_approved && s.admin_rejected && s.subscription_status !== "inactive").length },
                      { key: "approved", label: "Profile Approved", count: allSingers.filter(s => s.admin_approved && s.subscription_status !== "inactive").length },
                      { key: "inactive", label: "Inactive", count: allSingers.filter(s => s.subscription_status === "inactive").length },
                      { key: "all", label: "All", count: allSingers.length },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setAdminTab(tab.key)}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors ${adminTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        data-testid={`admin-tab-${tab.key}`}
                      >
                        {tab.label} <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{tab.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSingers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No singers in this category.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full text-sm min-w-[900px]" data-testid="admin-singers-table">
                      <thead>
                        <tr className="bg-slate-50 text-left">
                          <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Name</th>
                          <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Voice Type</th>
                          <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">City</th>
                          <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Date Registered</th>
                          <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">Status</th>
                          <th className="px-4 py-3 font-medium text-slate-600 text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSingers.map(singer => {
                          const status = getStatusBadge(singer);
                          return (
                            <tr key={singer.id} className="hover:bg-slate-50" data-testid={`admin-singer-row-${singer.id}`}>
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-900 flex items-center gap-1.5 flex-wrap">
                                  {singer.first_name} {singer.last_name}
                                  {singer.founding_artist && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full" title="Founding Singer">🌟 FOUNDING</span>}
                                  {singer.is_gifted && <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full" title="Pro access gifted by admin">🎁 GIFTED</span>}
                                </div>
                                <div className="text-xs text-slate-400">{singer.email}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{singer.primary_voice_type || "—"}</td>
                              <td className="px-4 py-3 text-slate-600">{singer.city || "—"}{singer.state ? `, ${singer.state}` : ""}</td>
                              <td className="px-4 py-3 text-slate-500">{singer.created_at ? new Date(singer.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  {!singer.admin_approved && singer.subscription_status !== "inactive" && (
                                    <button onClick={() => handleAdminAction(singer.id, "approve")} className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50" title="Approve" data-testid={`button-approve-${singer.id}`}>
                                      <UserCheck className="w-4 h-4" />
                                    </button>
                                  )}
                                  {singer.admin_approved && singer.subscription_status !== "inactive" && (
                                    <button onClick={() => handleAdminAction(singer.id, "reject")} className="text-amber-600 hover:text-amber-800 p-1 rounded hover:bg-amber-50" title="Reject (Unapprove)" data-testid={`button-reject-${singer.id}`}>
                                      <UserX className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button onClick={() => handleViewSinger(singer.id)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="View Profile" data-testid={`button-view-${singer.id}`}>
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => { setEditingSinger(singer); setEditForm({ first_name: singer.first_name, last_name: singer.last_name, email: singer.email, primary_voice_type: singer.primary_voice_type || "", primary_fach: singer.primary_fach || "", city: singer.city || "", state: singer.state || "", union_status: singer.union_status || "", subscription_tier: singer.subscription_tier || "free", short_bio: singer.short_bio || "", admin_notes: singer.admin_notes || "" }); }} className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100" title="Edit" data-testid={`button-edit-singer-${singer.id}`}>
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {singer.subscription_status !== "inactive" ? (
                                    <button onClick={() => handleAdminAction(singer.id, "deactivate")} className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100" title="Deactivate" data-testid={`button-deactivate-${singer.id}`}>
                                      <Shield className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button onClick={() => handleAdminAction(singer.id, "activate")} className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50" title="Reactivate" data-testid={`button-activate-${singer.id}`}>
                                      <UserCheck className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button onClick={() => setGiftTarget({ type: 'singer', id: singer.id, name: `${singer.first_name} ${singer.last_name}` })} className="text-violet-600 hover:text-violet-800 p-1 rounded hover:bg-violet-50 text-base leading-none" title="Gift Pro Access" data-testid={`button-gift-singer-${singer.id}`}>🎁</button>
                                  <button onClick={() => handleAdminAction(singer.id, "delete")} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Delete" data-testid={`button-delete-singer-${singer.id}`}>
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <span className="w-px h-4 bg-slate-200 mx-0.5" />
                                  <button
                                    onClick={() => handleBadgeToggle(singer.id, "is_pro_verified", singer.is_pro_verified)}
                                    className={`p-1 rounded text-xs font-bold ${singer.is_pro_verified ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                    title={singer.is_pro_verified ? "Remove Verified Pro" : "Grant Verified Pro"}
                                    data-testid={`button-toggle-pro-${singer.id}`}
                                  >
                                    <Award className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleBadgeToggle(singer.id, "is_emergency_ready", singer.is_emergency_ready)}
                                    className={`p-1 rounded text-xs font-bold relative ${singer.is_emergency_ready ? 'text-red-600 bg-red-50 hover:bg-red-100' : singer.emergency_status_requested ? 'text-amber-600 bg-amber-50 hover:bg-red-50 hover:text-red-600 ring-1 ring-amber-400' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                    title={singer.is_emergency_ready ? "Remove Urgent Ready" : singer.emergency_status_requested ? "Approve Urgent Request" : "Grant Urgent Ready"}
                                    data-testid={`button-toggle-emergency-${singer.id}`}
                                  >
                                    <Zap className="w-4 h-4" />
                                    {singer.emergency_status_requested && !singer.is_emergency_ready && (
                                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleBadgeToggle(singer.id, "is_management_verified", singer.is_management_verified)}
                                    className={`p-1 rounded text-xs font-bold ${singer.is_management_verified ? 'text-violet-600 bg-violet-50 hover:bg-violet-100' : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50'}`}
                                    title={singer.is_management_verified ? "Remove Management Verified" : "Grant Management Verified"}
                                    data-testid={`button-toggle-mgmt-${singer.id}`}
                                  >
                                    <Shield className="w-4 h-4" />
                                  </button>
                                  {singer.flagged_for_review && (
                                    <button
                                      onClick={() => handleBadgeToggle(singer.id, "flagged_for_review", true)}
                                      className="p-1 rounded text-orange-600 bg-orange-50 hover:bg-orange-100 ring-1 ring-orange-300"
                                      title="Flagged for review — click to clear"
                                      data-testid={`button-clear-flag-${singer.id}`}
                                    >
                                      <Flag className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              )}
            </>
          )}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-semibold text-slate-800" data-testid="text-developer-tools-title">Developer Tools — Demo Data</h2>
              <p className="text-xs text-slate-500 mt-1">For development and testing only. Affects demo accounts (emails ending in <code className="px-1 bg-slate-100 rounded">@example.com</code>) and the 7 demo organizations. Real user accounts are preserved.</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={handleReseedDemo}
                  disabled={reseedLoading}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  data-testid="button-reseed-demo"
                >
                  {reseedLoading ? "Reseeding…" : "Reseed Demo Data"}
                </button>
                <p className="text-xs text-slate-500 mt-2">Wipes and re-inserts 100 demo singers (incl. <code className="px-1 bg-slate-100 rounded">aisha.williams@example.com</code>) and 7 demo orgs. Idempotent — safe to re-run.</p>
              </div>
              {reseedResult && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" data-testid="text-reseed-result">
                  <div className="font-semibold">Success</div>
                  <div className="mt-1">Demo singers before: <span className="font-mono" data-testid="text-reseed-before">{reseedResult.demoSingersBefore}</span></div>
                  <div>Demo singers after: <span className="font-mono" data-testid="text-reseed-after">{reseedResult.demoSingersAfter}</span></div>
                </div>
              )}
              {reseedError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" data-testid="text-reseed-error">
                  <div className="font-semibold">Failed</div>
                  <div className="mt-1">{reseedError}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {renderCreditModal()}
        {renderGiftModal()}
      </div>
    );
}
