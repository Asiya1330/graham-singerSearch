import React from "react";
import { useAppContext } from "./AppContext";
import { OrgNav } from "./AppNav";
import { useCityStateAutofill } from "./hooks/useCityStateAutofill";
import { getErrorMessageFromBody } from "./lib/api";

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

    const [emailForm, setEmailForm] = React.useState({ email: user.email || "", password: "" });
    const [emailMsg, setEmailMsg] = React.useState(null);
    const [emailSaving, setEmailSaving] = React.useState(false);

    React.useEffect(() => {
      if (!user?.id) return;
      setEmailForm({ email: user.email || "", password: "" });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const saveEmail = async () => {
      if (!emailForm.email.trim()) {
        setEmailMsg({ type: "error", text: "Email is required." });
        return;
      }
      if (!emailForm.password) {
        setEmailMsg({ type: "error", text: "Enter your current password to confirm this change." });
        return;
      }
      setEmailSaving(true);
      setEmailMsg(null);
      try {
        const res = await fetch("/api/org/email", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: emailForm.email.trim(), currentPassword: emailForm.password }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) throw new Error(getErrorMessageFromBody(data, "PROFILE_UPDATE_FAILED"));
        setCurrentUser(prev => prev?.data
          ? { ...prev, data: { ...prev.data, email: data.email } }
          : { ...prev, email: data.email });
        setEmailForm({ email: data.email, password: "" });
        setEmailMsg({ type: "success", text: "Email updated. Use this address to sign in from now on." });
      } catch (e) {
        setEmailMsg({ type: "error", text: e.message });
      } finally {
        setEmailSaving(false);
      }
    };

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
        if (!res.ok) throw new Error(getErrorMessageFromBody(data, "PROFILE_UPDATE_FAILED"));
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
        if (!res.ok) throw new Error(getErrorMessageFromBody(data, "OPERATION_FAILED"));
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
        <OrgNav />

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
                : `${user.contact_reveals_used_this_month ?? 0} of ${user.contact_reveal_limit ?? 3} free contact reveals used.`}
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

          {/* Email Address */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Email Address</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Login Email</label>
              <input
                data-testid="input-org-email"
                type="email"
                value={emailForm.email}
                onChange={e => setEmailForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                data-testid="input-org-email-password"
                type="password"
                value={emailForm.password}
                onChange={e => setEmailForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Confirm your password"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <span aria-hidden="true" className="text-base leading-none">⚠️</span>
              <div className="space-y-1">
                <p className="font-semibold">Changing your email affects your account:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>You'll sign in with the new email from now on.</li>
                  <li>Password-reset links and all account notifications go to the new address.</li>
                  <li>You can't use an email already registered to another account.</li>
                </ul>
              </div>
            </div>
            {emailMsg && (
              <p className={`text-sm ${emailMsg.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{emailMsg.text}</p>
            )}
            <button
              data-testid="button-save-org-email"
              onClick={saveEmail}
              disabled={emailSaving || !emailForm.email.trim() || !emailForm.password}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {emailSaving ? "Saving…" : "Update Email"}
            </button>
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
