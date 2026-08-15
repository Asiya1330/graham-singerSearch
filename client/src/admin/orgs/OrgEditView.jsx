import { Loader2 } from "lucide-react";
import { AdminNav } from "../AdminNav";

export function OrgEditView({
  editingOrg,
  orgEditForm,
  setOrgEditForm,
  onLogoClick,
  onCancel,
  onSave,
  isBusy,
}) {
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
            <h2 className="text-xl font-bold text-slate-900">Edit Organization: {editingOrg.organization_name}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
              <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.organization_name || ""} onChange={(e) => setOrgEditForm({ ...orgEditForm, organization_name: e.target.value })} data-testid="input-org-edit-name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.email || ""} onChange={(e) => setOrgEditForm({ ...orgEditForm, email: e.target.value })} data-testid="input-org-edit-email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.city || ""} onChange={(e) => setOrgEditForm({ ...orgEditForm, city: e.target.value })} data-testid="input-org-edit-city" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person Name</label>
                <input type="text" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.contact_person_name || ""} onChange={(e) => setOrgEditForm({ ...orgEditForm, contact_person_name: e.target.value })} data-testid="input-org-edit-contact-name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person Email</label>
                <input type="email" className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.contact_person_email || ""} onChange={(e) => setOrgEditForm({ ...orgEditForm, contact_person_email: e.target.value })} data-testid="input-org-edit-contact-email" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Tier</label>
              <select className="w-full border border-slate-300 rounded-md h-10 px-3 text-sm" value={orgEditForm.subscription_tier || "free"} onChange={(e) => setOrgEditForm({ ...orgEditForm, subscription_tier: e.target.value })} data-testid="select-org-edit-tier">
                <option value="free">Free</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Admin Notes (internal only)</label>
              <textarea rows={4} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" value={orgEditForm.admin_notes || ""} onChange={(e) => setOrgEditForm({ ...orgEditForm, admin_notes: e.target.value })} data-testid="textarea-org-edit-notes" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">Cancel</button>
              <button onClick={onSave} disabled={isBusy(`org:${editingOrg.id}:save`)} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-1.5" data-testid="button-save-org-edit">
                {isBusy(`org:${editingOrg.id}:save`) && <Loader2 className="w-4 h-4 animate-spin" />}
                {isBusy(`org:${editingOrg.id}:save`) ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
