import { Loader2 } from "lucide-react";
import { AdminNav } from "../AdminNav";
import { CreditAdjustModal } from "../CreditAdjustModal";
import { getOrgBalance } from "../utils";

export function OrgDetailView({
  org: o,
  onLogoClick,
  onBack,
  onFoundingToggle,
  onGift,
  onToggleSubscription,
  onEdit,
  onAdjustCredits,
  creditAdjustOrgId,
  creditAdjustForm,
  setCreditAdjustForm,
  creditAdjustError,
  setCreditAdjustError,
  onCloseCreditModal,
  onConfirmCreditAdjust,
  isBusy,
}) {
  const balance = getOrgBalance(o);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav
        onLogoClick={onLogoClick}
        rightContent={
          <button onClick={onBack} className="text-sm text-blue-600 hover:text-blue-800" data-testid="link-back-org-list">← Back to List</button>
        }
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap break-words" data-testid="text-org-name">
                {o.organization_name}
                {o.founding_org && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">🌟 FOUNDING</span>}
                {o.is_gifted && <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full">🎁 GIFTED</span>}
              </h2>
              <p className="text-sm text-slate-500 break-words">{o.email} · {o.city || "—"}{o.state ? `, ${o.state}` : ""}</p>
              {o.contact_person_name && <p className="text-xs text-slate-500 mt-1 break-words">Contact: {o.contact_person_name} {o.contact_person_email ? `<${o.contact_person_email}>` : ""}</p>}
              {o.subscription_tier === "pro" && o.pro_expires_at && (
                <p className="text-xs text-slate-500 mt-1">Pro access until {new Date(o.pro_expires_at).toLocaleDateString()}</p>
              )}
            </div>
            <div className="sm:text-right space-y-2 shrink-0">
              <div>
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${o.subscription_tier === "pro" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>{(o.subscription_tier || "free").toUpperCase()}</span>
                <p className="text-xs text-slate-500 mt-1">Joined {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</p>
              </div>
              <div className="flex items-center flex-wrap gap-2 sm:ml-auto">
                <button
                  onClick={() => onFoundingToggle("org", o.id, o.organization_name, !o.founding_org)}
                  disabled={isBusy(`org:${o.id}:founding`)}
                  className="px-3 py-1.5 text-sm rounded-md bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1 disabled:opacity-50"
                  data-testid="button-founding-org-detail"
                >
                  {isBusy(`org:${o.id}:founding`) ? <Loader2 className="w-4 h-4 animate-spin" /> : "🌟"}
                  {o.founding_org ? "Revoke Founding" : "Grant Founding"}
                </button>
                <button onClick={() => onGift({ type: "org", id: o.id, name: o.organization_name })} className="px-3 py-1.5 text-sm rounded-md bg-violet-600 text-white hover:bg-violet-700 flex items-center gap-1" data-testid="button-gift-org-detail">🎁 Gift Pro</button>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Credit Balance</p><p className="text-lg font-bold text-emerald-600" data-testid="text-org-balance">{balance}</p></div>
            <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Limit</p><p className="text-lg font-bold text-slate-900">{o.contact_reveal_limit ?? 0}</p></div>
            <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Used This Month</p><p className="text-lg font-bold text-slate-900">{o.contact_reveals_used_this_month ?? 0}</p></div>
            <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Total Reveals</p><p className="text-lg font-bold text-slate-900">{o.reveal_history?.length ?? 0}</p></div>
          </div>
          {o.admin_notes && (
            <div className="px-4 sm:px-6 pb-5">
              <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">Admin Notes</h4>
              <p className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded p-3 whitespace-pre-wrap">{o.admin_notes}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-900">Contact Reveal History (last 50)</h3></div>
          {o.reveal_history?.length === 0 ? <div className="p-6 text-sm text-slate-500">No contact reveals yet.</div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]">
              <thead><tr className="text-left bg-slate-50 text-xs"><th className="px-4 py-2 text-slate-500">Singer</th><th className="px-4 py-2 text-slate-500">Voice Type</th><th className="px-4 py-2 text-slate-500">Date</th><th className="px-4 py-2 text-slate-500">Type</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {o.reveal_history?.map((r) => (
                  <tr key={r.id} data-testid={`row-reveal-${r.id}`}>
                    <td className="px-4 py-2 text-slate-900">{r.first_name} {r.last_name}</td>
                    <td className="px-4 py-2 text-slate-600">{r.primary_voice_type || "—"}</td>
                    <td className="px-4 py-2 text-slate-500">{r.revealed_at ? new Date(r.revealed_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-2">{r.is_emergency ? <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Urgent</span> : <span className="text-xs text-slate-500">Standard</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-900">Search History (last 20)</h3></div>
          {o.search_history?.length === 0 ? <div className="p-6 text-sm text-slate-500">No searches logged.</div> : (
            <ul className="divide-y divide-slate-100">
              {o.search_history?.map((s) => (
                <li key={s.id} className="px-4 py-3 text-sm" data-testid={`row-search-${s.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{s.created_at ? new Date(s.created_at).toLocaleString() : "—"}</span>
                  </div>
                  <pre className="text-xs text-slate-600 mt-1 whitespace-pre-wrap font-mono bg-slate-50 rounded p-2 break-all">{JSON.stringify(s.search_filters, null, 0)}</pre>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-900">Engagement Feedback Submitted</h3></div>
          {o.feedback_history?.length === 0 ? <div className="p-6 text-sm text-slate-500">No feedback submitted.</div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]">
              <thead><tr className="text-left bg-slate-50 text-xs"><th className="px-4 py-2 text-slate-500">Singer</th><th className="px-4 py-2 text-slate-500">Role</th><th className="px-4 py-2 text-slate-500">Date</th><th className="px-4 py-2 text-slate-500">Marks</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {o.feedback_history?.map((f) => (
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
            </table></div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-900">🎁 Gift History</h3></div>
          {(!o.gift_history || o.gift_history.length === 0) ? <div className="p-6 text-sm text-slate-500">No Pro gifts recorded.</div> : (
            <ul className="divide-y divide-slate-100">
              {o.gift_history.map((g) => (
                <li key={g.id} className="px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2" data-testid={`row-gift-org-${g.id}`}>
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
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200"><h3 className="text-sm font-bold text-slate-900">Credit Adjustment History</h3></div>
          {o.credit_adjustments?.length === 0 ? <div className="p-6 text-sm text-slate-500">No adjustments recorded.</div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]">
              <thead><tr className="text-left bg-slate-50 text-xs"><th className="px-4 py-2 text-slate-500">Date</th><th className="px-4 py-2 text-slate-500">Reason</th><th className="px-4 py-2 text-slate-500 text-right">Amount</th><th className="px-4 py-2 text-slate-500 text-right">Prev</th><th className="px-4 py-2 text-slate-500 text-right">New</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {o.credit_adjustments?.map((a) => (
                  <tr key={a.id} data-testid={`row-adjustment-${a.id}`}>
                    <td className="px-4 py-2 text-slate-500">{a.created_at ? new Date(a.created_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-2 text-slate-700">{a.admin_action}</td>
                    <td className={`px-4 py-2 text-right font-medium ${a.amount > 0 ? "text-emerald-600" : "text-red-600"}`}>{a.amount > 0 ? "+" : ""}{a.amount}</td>
                    <td className="px-4 py-2 text-right text-slate-500">{a.previous_balance}</td>
                    <td className="px-4 py-2 text-right text-slate-900 font-medium">{a.new_balance}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 sm:justify-end">
          <button
            onClick={() => onToggleSubscription(o.id, o.subscription_tier)}
            disabled={isBusy(`org:${o.id}:tier`)}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            data-testid="button-toggle-org-tier-detail"
          >
            {isBusy(`org:${o.id}:tier`) && <Loader2 className="w-4 h-4 animate-spin" />}
            {o.subscription_tier === "pro" ? "Downgrade to Free" : "Upgrade to Pro"}
          </button>
          <button onClick={() => onEdit(o)} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700" data-testid="button-edit-org-detail">Edit</button>
          <button onClick={() => onAdjustCredits(o.id)} className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200" data-testid="button-adjust-credits-detail">Adjust Credits</button>
        </div>
      </div>
      <CreditAdjustModal
        creditAdjustOrgId={creditAdjustOrgId}
        targetOrg={o}
        creditAdjustForm={creditAdjustForm}
        setCreditAdjustForm={setCreditAdjustForm}
        creditAdjustError={creditAdjustError}
        setCreditAdjustError={setCreditAdjustError}
        isBusy={isBusy}
        onClose={onCloseCreditModal}
        onConfirm={onConfirmCreditAdjust}
      />
    </div>
  );
}
