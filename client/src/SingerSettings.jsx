import React, { useState, useEffect } from "react";
import singerSearchLogo from "@assets/Singer_Search_Logo_May_2026_1777734809747.png";
import { useAppContext } from "./AppContext";
import { US_STATES } from "./AppShared";
import { useCityStateAutofill } from "./hooks/useCityStateAutofill";

export function SingerSettings() {
  const { currentUser, setCurrentUser, setView } = useAppContext();
    const user = currentUser?.data ?? currentUser ?? {};
    const [profile, setProfile] = React.useState({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      primary_voice_type: user.primary_voice_type || "",
      primary_fach: user.primary_fach || "",
      union_status: user.union_status || "",
      represented: user.represented || false,
      agent_name: user.agent_name || "",
      agent_email: user.agent_email || "",
      website_url: user.website_url || "",
      video_link_1: user.video_link_1 || "",
      video_link_2: user.video_link_2 || "",
      audio_link_1: user.audio_link_1 || "",
      languages_sung: Array.isArray(user.languages_sung) ? user.languages_sung : [],
      performance_types: Array.isArray(user.performance_types) ? user.performance_types : [],
      city: user.city || "",
      state: user.state || "",
    });
    const { stateAutoFilled, handleCityChange, handleStateChange } = useCityStateAutofill(setProfile);
    const [profileMsg, setProfileMsg] = React.useState(null);
    const [profileSaving, setProfileSaving] = React.useState(false);

    const FACH_OPTIONS = ["Soprano","Mezzo-Soprano","Contralto","Countertenor","Tenor","Baritone","Bass-Baritone","Bass"];
    const UNION_OPTIONS = ["Non-Union","AGMA Member","AEA Member","AFM Member"];
    const LANGUAGE_OPTIONS = ["Italian","German","French","English","Spanish","Latin","Russian","Czech","Other"];
    const PERFORMANCE_TYPE_OPTIONS = ["Opera","Orchestra","Chorus","Chamber","Recital"];

    const toggleArrayValue = (field, value) => {
      setProfile(p => {
        const current = Array.isArray(p[field]) ? p[field] : [];
        return { ...p, [field]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
      });
    };

    const [pw, setPw] = React.useState({ current: "", next: "", confirm: "" });
    const [pwMsg, setPwMsg] = React.useState(null);
    const [pwSaving, setPwSaving] = React.useState(false);


    const [mgmt, setMgmt] = React.useState({
      is_managed: user.is_managed || false,
      manager_name: user.manager_name || "",
      manager_email: user.manager_email || "",
      manager_phone: user.manager_phone || "",
    });
    const [mgmtMsg, setMgmtMsg] = React.useState(null);
    const [mgmtSaving, setMgmtSaving] = React.useState(false);

    const saveMgmt = async () => {
      setMgmtSaving(true);
      setMgmtMsg(null);
      try {
        const res = await fetch("/api/singer/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(mgmt),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "Save failed");
        setCurrentUser(prev => prev?.data
          ? { ...prev, data: { ...prev.data, ...mgmt } }
          : { ...prev, ...mgmt });
        setMgmtMsg({ type: "success", text: "Management info saved." });
      } catch (e) {
        setMgmtMsg({ type: "error", text: e.message });
      } finally {
        setMgmtSaving(false);
      }
    };

    const voiceTypes = ["Soprano","Mezzo-Soprano","Contralto","Tenor","Baritone","Bass","Countertenor"];

    const saveProfile = async () => {
      if (profile.website_url && !/^https?:\/\//i.test(profile.website_url)) {
        setProfileMsg({ type: "error", text: "Website URL must start with http:// or https://" });
        return;
      }
      const mediaFields = [
        { key: "video_link_1", label: "Video Link 1" },
        { key: "video_link_2", label: "Video Link 2" },
        { key: "audio_link_1", label: "Audio / Recording Link" },
      ];
      for (const f of mediaFields) {
        if (profile[f.key] && !/^https?:\/\//i.test(profile[f.key])) {
          setProfileMsg({ type: "error", text: `${f.label} must start with http:// or https://` });
          return;
        }
      }
      setProfileSaving(true);
      setProfileMsg(null);
      try {
        const payload = { ...profile };
        if (!payload.represented) {
          payload.agent_name = "";
          payload.agent_email = "";
        }
        const res = await fetch("/api/singer/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Save failed");
        setCurrentUser(prev => prev?.data
          ? { ...prev, data: { ...prev.data, ...payload } }
          : { ...prev, ...payload });
        setProfileMsg({ type: "success", text: "Profile updated successfully." });
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
        const res = await fetch("/api/singer/password", {
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
                  <span className="text-white/40 hover:text-white/80 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium cursor-pointer transition-colors" onClick={() => setView("singerDashboard")}>
                    Dashboard
                  </span>
                  <span className="text-white/40 hover:text-white/80 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium cursor-pointer transition-colors" onClick={() => { const el = document.getElementById("singer-subscription-section"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }} data-testid="link-my-subscription-settings">
                    My Subscription
                  </span>
                  <span className="border-[#3B82F6] text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Account &amp; Profile
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-white/50 text-sm font-medium mr-4">{user.first_name} {user.last_name}</span>
                <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); setCurrentUser(null); setView("landing"); }} className="text-white/30 hover:text-white/60 text-sm transition-colors">Sign out</button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
          <h1 className="text-2xl font-bold text-slate-900">Account &amp; Profile</h1>

          {/* Profile Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input data-testid="input-first-name" type="text" value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input data-testid="input-last-name" type="text" value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Voice Type</label>
              <select data-testid="select-voice-type" value={profile.primary_voice_type} onChange={e => setProfile(p => ({ ...p, primary_voice_type: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select voice type</option>
                {voiceTypes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  data-testid="input-city"
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
                <select
                  data-testid="select-state"
                  value={profile.state}
                  onChange={e => handleStateChange(e.target.value)}
                  className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${stateAutoFilled ? 'text-slate-500' : ''}`}
                >
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Fach <span className="text-slate-400 font-normal">(optional)</span></label>
                <select
                  data-testid="select-primary-fach"
                  value={profile.primary_fach}
                  onChange={e => setProfile(p => ({ ...p, primary_fach: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select fach</option>
                  {FACH_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Union Status <span className="text-slate-400 font-normal">(optional)</span></label>
                <select
                  data-testid="select-union-status"
                  value={profile.union_status}
                  onChange={e => setProfile(p => ({ ...p, union_status: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select status</option>
                  {UNION_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  data-testid="toggle-represented"
                  type="checkbox"
                  checked={profile.represented}
                  onChange={e => setProfile(p => ({ ...p, represented: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Represented by an agent</span>
              </label>
              {profile.represented && (
                <div className="mt-3 grid grid-cols-2 gap-4 pl-7 border-l-2 border-blue-100 py-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Agent Name</label>
                    <input
                      data-testid="input-agent-name"
                      type="text"
                      value={profile.agent_name}
                      onChange={e => setProfile(p => ({ ...p, agent_name: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Agent Email</label>
                    <input
                      data-testid="input-agent-email"
                      type="email"
                      value={profile.agent_email}
                      onChange={e => setProfile(p => ({ ...p, agent_email: e.target.value }))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website URL <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                data-testid="input-website-url"
                type="url"
                value={profile.website_url}
                onChange={e => setProfile(p => ({ ...p, website_url: e.target.value }))}
                placeholder="https://yourname.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Must start with http:// or https://</p>
            </div>

            <div className="border-t border-slate-200 pt-4" data-testid="section-media-links">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Media Links <span className="text-slate-400 font-normal">(optional)</span></h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Video Link 1 (YouTube or Vimeo URL)</label>
                  <input
                    data-testid="input-video-link-1"
                    type="url"
                    value={profile.video_link_1}
                    onChange={e => setProfile(p => ({ ...p, video_link_1: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Video Link 2 (YouTube or Vimeo URL)</label>
                  <input
                    data-testid="input-video-link-2"
                    type="url"
                    value={profile.video_link_2}
                    onChange={e => setProfile(p => ({ ...p, video_link_2: e.target.value }))}
                    placeholder="https://vimeo.com/..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Audio / Recording Link</label>
                  <input
                    data-testid="input-audio-link-1"
                    type="url"
                    value={profile.audio_link_1}
                    onChange={e => setProfile(p => ({ ...p, audio_link_1: e.target.value }))}
                    placeholder="https://soundcloud.com/..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-slate-400">All links must start with http:// or https://. Leave any field blank to omit.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Languages Sung <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGE_OPTIONS.map(lang => (
                  <label key={lang} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      data-testid={`checkbox-language-${lang.toLowerCase()}`}
                      type="checkbox"
                      checked={profile.languages_sung.includes(lang)}
                      onChange={() => toggleArrayValue("languages_sung", lang)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Performance Types <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="grid grid-cols-3 gap-2">
                {PERFORMANCE_TYPE_OPTIONS.map(pt => (
                  <label key={pt} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      data-testid={`checkbox-perftype-${pt.toLowerCase()}`}
                      type="checkbox"
                      checked={profile.performance_types.includes(pt)}
                      onChange={() => toggleArrayValue("performance_types", pt)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">{pt}</span>
                  </label>
                ))}
              </div>
            </div>

            {profileMsg && (
              <p className={`text-sm ${profileMsg.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{profileMsg.text}</p>
            )}
            <button data-testid="button-save-profile" onClick={saveProfile} disabled={profileSaving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {profileSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* Subscription */}
          <div id="singer-subscription-section" className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 scroll-mt-20" data-testid="section-singer-subscription">
            <h2 className="text-lg font-semibold text-slate-800">My Subscription</h2>
            {(() => {
              const tier = user.subscription_tier;
              const isFounding = tier === "founding" && user.founding_expires_at;
              const isPro = tier === "pro";
              const foundingDate = isFounding
                ? new Date(user.founding_expires_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                : null;
              const planLabel = isPro ? "Pro" : isFounding ? "Founding Artist" : "Free";
              const planColor = isPro
                ? "bg-blue-100 text-blue-700"
                : isFounding
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-600";
              return (
                <>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${planColor}`} data-testid="text-subscription-tier">
                      {planLabel}
                    </span>
                    {isPro && <span className="text-sm text-slate-600">$9.99/month</span>}
                  </div>
                  {isFounding && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3" data-testid="text-founding-info">
                      <p className="text-sm text-amber-900 font-medium">Founding Artist — Pro access free until {foundingDate}</p>
                      <p className="text-xs text-amber-700 mt-1">Enjoy full Pro features at no charge as one of our earliest members.</p>
                    </div>
                  )}
                  {isPro && !isFounding && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3" data-testid="text-pro-info">
                        <p className="text-sm text-blue-900 font-medium">You are on the Pro plan — $9.99/month</p>
                        <p className="text-xs text-blue-700 mt-1">To manage your subscription contact <a href="mailto:support@singersearch.net" className="underline font-medium">support@singersearch.net</a></p>
                      </div>
                      <button
                        onClick={async () => {
                          if (!window.confirm("Downgrade to the Free tier? You will lose Pro features (priority short-notice access, profile view analytics, Castability Score) at the end of the current period.")) return;
                          try {
                            const res = await fetch("/api/singer/downgrade", { method: "POST", credentials: "include" });
                            if (!res.ok) { setProfileMsg({ type: "error", text: "Failed to downgrade. Please try again." }); return; }
                            setProfileMsg({ type: "success", text: "Your account has been moved to the Free tier." });
                            const me = await fetch("/api/auth/me", { credentials: "include" });
                            if (me.ok) { const data = await me.json(); window.location.reload(); }
                          } catch (e) {
                            setProfileMsg({ type: "error", text: "Network error. Please try again." });
                          }
                        }}
                        className="text-sm font-medium text-slate-600 hover:text-red-700 border border-slate-300 hover:border-red-300 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                        data-testid="button-downgrade-singer"
                      >
                        Downgrade to Free
                      </button>
                    </div>
                  )}
                  {!isPro && !isFounding && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600">Upgrade to Pro for expedited Short-Notice Engagement access, profile view analytics, and the Castability Score.</p>
                      <button
                        onClick={() => setProfileMsg({ type: "success", text: "Online payments coming soon. To upgrade contact us at support@singersearch.net" })}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        data-testid="button-upgrade-pro"
                      >
                        Upgrade to Pro — $9.99/month
                      </button>
                      {profileMsg?.text?.startsWith("Online payments") && (
                        <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2" data-testid="text-upgrade-message">
                          Online payments coming soon. To upgrade contact us at <a href="mailto:support@singersearch.net" className="underline font-semibold">support@singersearch.net</a>
                        </p>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Password */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input data-testid="input-current-password" type="password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input data-testid="input-new-password" type="password" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input data-testid="input-confirm-password" type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {pwMsg && (
              <p className={`text-sm ${pwMsg.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{pwMsg.text}</p>
            )}
            <button data-testid="button-change-password" onClick={changePassword} disabled={pwSaving || !pw.current || !pw.next || !pw.confirm} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {pwSaving ? "Saving…" : "Change Password"}
            </button>
          </div>

          {/* Management */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-800">Management</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                data-testid="toggle-is-managed"
                type="checkbox"
                checked={mgmt.is_managed}
                onChange={e => setMgmt(p => ({ ...p, is_managed: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm font-medium text-slate-700">I am professionally managed</span>
            </label>
            {mgmt.is_managed && (
              <div className="space-y-4 pl-7 border-l-2 border-violet-100">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Manager or Agency Name</label>
                  <input
                    data-testid="input-manager-name"
                    type="text"
                    value={mgmt.manager_name}
                    onChange={e => setMgmt(p => ({ ...p, manager_name: e.target.value }))}
                    placeholder="e.g. Columbia Artists"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Manager Email <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input
                    data-testid="input-manager-email"
                    type="email"
                    value={mgmt.manager_email}
                    onChange={e => setMgmt(p => ({ ...p, manager_email: e.target.value }))}
                    placeholder="manager@agency.com"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Manager Phone <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input
                    data-testid="input-manager-phone"
                    type="tel"
                    value={mgmt.manager_phone}
                    onChange={e => setMgmt(p => ({ ...p, manager_phone: e.target.value }))}
                    placeholder="+1 212 555 0000"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <p className="text-xs text-slate-500">Manager email and phone are private — only your name and agency are shown publicly on your profile.</p>
              </div>
            )}
            {mgmtMsg && (
              <p className={`text-sm ${mgmtMsg.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{mgmtMsg.text}</p>
            )}
            <button
              data-testid="button-save-management"
              onClick={saveMgmt}
              disabled={mgmtSaving}
              className="bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {mgmtSaving ? "Saving…" : "Save Management Info"}
            </button>
          </div>
        </div>
      </div>
    );
  };

