import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import singerSearchLogo from "@assets/Singer_Search_Logo_May_2026_1777734809747.png";
import { useAppContext } from "./AppContext";
import { useCityStateAutofill } from "./hooks/useCityStateAutofill";

export function OrgSettings() {
  const { currentUser, setCurrentUser, setView } = useAppContext();
    const user = currentUser?.data ?? currentUser ?? {};
    const [profile, setProfile] = React.useState({
      organization_name: user.organization_name || "",
      organization_type: user.organization_type || "",
      city: user.city || "",
      state: user.state || "",
      website_url: user.website_url || "",
    });
    const { stateAutoFilled, handleCityChange, handleStateChange } = useCityStateAutofill(setProfile);
    const [profileMsg, setProfileMsg] = React.useState(null);
    const [profileSaving, setProfileSaving] = React.useState(false);

    const [pw, setPw] = React.useState({ current: "", next: "", confirm: "" });
    const [pwMsg, setPwMsg] = React.useState(null);
    const [pwSaving, setPwSaving] = React.useState(false);

    const saveProfile = async () => {
      setProfileSaving(true);
      setProfileMsg(null);
      try {
        const res = await fetch("/api/org/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(profile),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed");
        setCurrentUser(prev => prev?.data
          ? { ...prev, data: { ...prev.data, ...profile } }
          : { ...prev, ...profile });
        setProfileMsg({ type: "success", text: "Settings saved successfully." });
      } catch (e) {
        setProfileMsg({ type: "error", text: e.message });
      } finally {
        setProfileSaving(false);
      }
    };

    const changePassword = async () => {
      if (pw.next !== pw.confirm) {
        setPwMsg({ type: "error", text: "New passwords do not match." });
        return;
      }
      if (pw.next.length < 8) {
        setPwMsg({ type: "error", text: "Password must be at least 8 characters." });
        return;
      }
      setPwSaving(true);
      setPwMsg(null);
      try {
        const res = await fetch("/api/org/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Password change failed");
        setPwMsg({ type: "success", text: "Password changed successfully." });
        setPw({ current: "", next: "", confirm: "" });
      } catch (e) {
        setPwMsg({ type: "error", text: e.message });
      } finally {
        setPwSaving(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <nav className="bg-[#121212] border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center cursor-pointer pr-6" onClick={() => setView("landing")}>
                  <img src={singerSearchLogo} alt="SingerSearch" className="h-8 object-contain brightness-0 invert" />
                </div>
                <div className="hidden sm:flex sm:space-x-6">
                  <span className="text-white/40 hover:text-white/80 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium cursor-pointer transition-colors" onClick={() => setView("orgDashboard")}>
                    Search
                  </span>
                  <span className="border-[#3B82F6] text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Account &amp; Settings
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-white/50 text-sm font-medium mr-4 flex items-center gap-2">
                  {user.organization_name}
                  {user.verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
                </span>
                <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); setCurrentUser(null); setView("landing"); }} className="text-white/30 hover:text-white/60 text-sm transition-colors">Sign out</button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
          <h1 className="text-2xl font-bold text-slate-900">Account &amp; Settings</h1>

          {/* Org Profile */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">Organization Information</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
              <input data-testid="input-org-name" type="text" value={profile.organization_name} onChange={e => setProfile(p => ({ ...p, organization_name: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization Type</label>
              <select data-testid="select-org-type" value={profile.organization_type} onChange={e => setProfile(p => ({ ...p, organization_type: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select type</option>
                <option value="opera_company">Opera Company</option>
                <option value="orchestra">Orchestra</option>
                <option value="chorus">Chorus</option>
                <option value="festival">Festival</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  data-testid="input-org-city"
                  type="text"
                  value={profile.city}
                  onChange={e => handleCityChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">State
                  {stateAutoFilled && <span className="text-[10px] font-normal text-slate-400 italic" data-testid="label-state-autofilled">auto-filled</span>}
                </label>
                <input
                  data-testid="input-org-state"
                  type="text"
                  value={profile.state}
                  onChange={e => handleStateChange(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${stateAutoFilled ? 'text-slate-500' : ''}`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input data-testid="input-org-website" type="url" value={profile.website_url} onChange={e => setProfile(p => ({ ...p, website_url: e.target.value }))} placeholder="https://" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{profileMsg.text}</p>
            )}
            <button data-testid="button-save-org-profile" onClick={saveProfile} disabled={profileSaving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {profileSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* Subscription info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Subscription</h2>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.subscription_tier === "pro" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                {user.subscription_tier === "pro" ? "Pro" : "Free"}
              </span>
              {user.subscription_tier !== "pro" && (
                <button onClick={() => setView("pricing")} className="text-sm text-blue-600 hover:underline font-medium">Upgrade to Pro →</button>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {user.subscription_tier === "pro"
                ? "Unlimited contact reveals and urgent search access."
                : `${user.contact_reveals_used ?? 0} of 3 free contact reveals used.`}
            </p>
            {user.subscription_tier === "pro" && (
              <button
                onClick={async () => {
                  if (!window.confirm("Downgrade to the Free tier? Your organization will lose unlimited contact reveals and urgent search access.")) return;
                  try {
                    const res = await fetch("/api/org/downgrade", { method: "POST", credentials: "include" });
                    if (!res.ok) { setProfileMsg({ type: "error", text: "Failed to downgrade. Please try again." }); return; }
                    setProfileMsg({ type: "success", text: "Your organization has been moved to the Free tier." });
                    window.location.reload();
                  } catch (e) {
                    setProfileMsg({ type: "error", text: "Network error. Please try again." });
                  }
                }}
                className="mt-3 text-sm font-medium text-slate-600 hover:text-red-700 border border-slate-300 hover:border-red-300 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                data-testid="button-downgrade-org"
              >
                Downgrade to Free
              </button>
            )}
          </div>

          {/* Password */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input data-testid="input-org-current-password" type="password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input data-testid="input-org-new-password" type="password" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input data-testid="input-org-confirm-password" type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {pwMsg && (
              <p className={`text-sm ${pwMsg.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{pwMsg.text}</p>
            )}
            <button data-testid="button-org-change-password" onClick={changePassword} disabled={pwSaving || !pw.current || !pw.next || !pw.confirm} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {pwSaving ? "Saving…" : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    );
  };
