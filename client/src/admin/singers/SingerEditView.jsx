import { Loader2, Star } from "lucide-react";
import { AdminNav } from "../AdminNav";
import {
  FACH_OPTIONS_ADMIN,
  STATE_OPTIONS_ADMIN,
  TIER_OPTIONS_ADMIN,
  UNION_OPTIONS_ADMIN,
  VOICE_TYPE_OPTIONS_ADMIN,
} from "../constants";
import { getStatusBadge } from "../utils";

export function SingerEditView({
  editingSinger,
  editForm,
  setEditForm,
  stateAutoFilled,
  handleCityChange,
  handleStateChange,
  onLogoClick,
  onCancel,
  onSave,
  isBusy,
}) {
  const editStatus = getStatusBadge(editingSinger);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav
        onLogoClick={onLogoClick}
        rightContent={
          <button onClick={onCancel} className="text-sm text-blue-600 hover:text-blue-800">← Back to List</button>
        }
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Edit Singer: {editingSinger.first_name} {editingSinger.last_name}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-5 p-4 rounded-xl border border-slate-200 bg-slate-50" data-testid="edit-singer-profile-summary">
              <div className="shrink-0">
                {editingSinger.headshot_url ? (
                  <img
                    src={editingSinger.headshot_url}
                    alt={`${editingSinger.first_name} ${editingSinger.last_name}`}
                    className="w-28 h-28 rounded-xl object-cover border border-slate-200 bg-white"
                    data-testid="img-edit-singer-headshot"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400 text-center px-2" data-testid="img-edit-singer-headshot-empty">
                    No photo on file
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-1.5 text-center">Photo (read-only)</p>
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${editStatus.color}`}>{editStatus.label}</span>
                  {editingSinger.founding_artist && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> FOUNDING
                    </span>
                  )}
                  {editingSinger.is_gifted && (
                    <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full">GIFTED</span>
                  )}
                  {editingSinger.is_pro_verified && (
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full">VERIFIED PRO</span>
                  )}
                  {editingSinger.is_emergency_ready && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">URGENT READY</span>
                  )}
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Subscription</dt>
                    <dd className="font-medium text-slate-900 capitalize">{editingSinger.subscription_tier || "free"} · {editingSinger.subscription_status || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Registered</dt>
                    <dd className="font-medium text-slate-900">{editingSinger.created_at ? new Date(editingSinger.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Voice / Fach</dt>
                    <dd className="font-medium text-slate-900">{editingSinger.primary_voice_type || "—"}{editingSinger.primary_fach ? ` · ${editingSinger.primary_fach}` : ""}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Location</dt>
                    <dd className="font-medium text-slate-900">{[editingSinger.city, editingSinger.state].filter(Boolean).join(", ") || "—"}</dd>
                  </div>
                  {editingSinger.website_url && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-slate-500">Website</dt>
                      <dd className="font-medium text-slate-900 truncate">
                        <a href={editingSinger.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">{editingSinger.website_url}</a>
                      </dd>
                    </div>
                  )}
                  {(editingSinger.represented || editingSinger.agent_name) && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-slate-500">Representation</dt>
                      <dd className="font-medium text-slate-900">
                        {editingSinger.represented ? "Represented" : "Not represented"}
                        {editingSinger.agent_name ? ` · ${editingSinger.agent_name}` : ""}
                        {editingSinger.agent_email ? ` (${editingSinger.agent_email})` : ""}
                      </dd>
                    </div>
                  )}
                  {editingSinger.pro_expires_at && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-slate-500">Pro expires</dt>
                      <dd className="font-medium text-slate-900">{new Date(editingSinger.pro_expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.first_name || ""} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} data-testid="input-edit-first-name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.last_name || ""} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} data-testid="input-edit-last-name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Voice Type</label>
                <select className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.primary_voice_type || ""} onChange={(e) => setEditForm({ ...editForm, primary_voice_type: e.target.value })} data-testid="select-edit-voice-type">
                  <option value="">— Select —</option>
                  {VOICE_TYPE_OPTIONS_ADMIN.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Fach</label>
                <select className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.primary_fach || ""} onChange={(e) => setEditForm({ ...editForm, primary_fach: e.target.value })} data-testid="select-edit-fach">
                  <option value="">— Select —</option>
                  {FACH_OPTIONS_ADMIN.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.city || ""} onChange={(e) => handleCityChange(e.target.value)} data-testid="input-edit-city" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  State
                  {stateAutoFilled && <span className="text-[10px] font-normal text-slate-400 italic" data-testid="label-state-autofilled">auto-filled</span>}
                </label>
                <select className={`w-full border border-slate-300 rounded-md h-10 px-3 text-sm ${stateAutoFilled ? "text-slate-500" : ""}`} value={editForm.state || ""} onChange={(e) => handleStateChange(e.target.value)} data-testid="select-edit-state">
                  <option value="">—</option>
                  {STATE_OPTIONS_ADMIN.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} data-testid="input-edit-email" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Union Status</label>
                <select className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.union_status || ""} onChange={(e) => setEditForm({ ...editForm, union_status: e.target.value })} data-testid="select-edit-union">
                  <option value="">— Select —</option>
                  {UNION_OPTIONS_ADMIN.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Tier</label>
                <select className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={editForm.subscription_tier || "free"} onChange={(e) => setEditForm({ ...editForm, subscription_tier: e.target.value })} data-testid="select-edit-tier">
                  {TIER_OPTIONS_ADMIN.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
              <textarea rows={3} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" value={editForm.short_bio || ""} onChange={(e) => setEditForm({ ...editForm, short_bio: e.target.value })} data-testid="textarea-edit-bio" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes (internal only)</label>
              <textarea rows={3} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" value={editForm.admin_notes || ""} onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })} data-testid="textarea-edit-admin-notes" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">Cancel</button>
              <button onClick={onSave} disabled={isBusy(`singer:${editingSinger.id}:save`)} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-1.5" data-testid="button-save-singer-edit">
                {isBusy(`singer:${editingSinger.id}:save`) && <Loader2 className="w-4 h-4 animate-spin" />}
                {isBusy(`singer:${editingSinger.id}:save`) ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
