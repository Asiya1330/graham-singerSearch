import { Loader2 } from "lucide-react";
import { AdminNav } from "../AdminNav";

export function SingerDetailView({
  singer: s,
  onLogoClick,
  onBack,
  onFoundingToggle,
  onGift,
  onAdminAction,
  isBusy,
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav
        onLogoClick={onLogoClick}
        rightContent={
          <button onClick={onBack} className="text-sm text-blue-600 hover:text-blue-800">← Back to List</button>
        }
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-5 bg-slate-50 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  {s.first_name} {s.last_name}
                  {s.founding_artist && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">🌟 FOUNDING</span>}
                  {s.is_gifted && <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full">🎁 GIFTED</span>}
                </h2>
                <p className="text-sm text-slate-500 break-words">{s.primary_voice_type} · {s.city}, {s.state} · {s.email}</p>
                {s.subscription_tier === "pro" && s.pro_expires_at && (
                  <p className="text-xs text-slate-500 mt-0.5">Pro access until {new Date(s.pro_expires_at).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => onFoundingToggle("singer", s.id, `${s.first_name} ${s.last_name}`, !s.founding_artist)}
                  disabled={isBusy(`singer:${s.id}:founding`)}
                  className="px-3 py-1.5 text-sm rounded-md bg-amber-500 text-white hover:bg-amber-600 flex items-center gap-1 disabled:opacity-50"
                  data-testid="button-founding-singer-detail"
                >
                  {isBusy(`singer:${s.id}:founding`) ? <Loader2 className="w-4 h-4 animate-spin" /> : "🌟"}
                  {s.founding_artist ? "Revoke Founding" : "Grant Founding"}
                </button>
                <button
                  onClick={() => onGift({ type: "singer", id: s.id, name: `${s.first_name} ${s.last_name}` })}
                  className="px-3 py-1.5 text-sm rounded-md bg-violet-600 text-white hover:bg-violet-700 flex items-center gap-1"
                  data-testid="button-gift-singer-detail"
                >
                  🎁 Gift Pro
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-6">
            {s.gift_history?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">🎁 Gift History</h4>
                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {s.gift_history.map((g) => (
                    <li key={g.id} className="px-3 py-2 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2" data-testid={`row-gift-singer-${g.id}`}>
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
            {s.short_bio && (
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-1">Bio</h4>
                <p className="text-slate-700">{s.short_bio}</p>
              </div>
            )}
            {s.roles?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Opera Roles ({s.roles.length})</h4>
                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {s.roles.map((r) => (
                    <li key={r.id} className="px-3 py-2 text-sm">
                      <span className="font-medium">{r.role_name}</span> in <span className="italic">{r.work_title}</span> ({r.composer})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {s.works?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Concert Works ({s.works.length})</h4>
                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {s.works.map((w) => (
                    <li key={w.id} className="px-3 py-2 text-sm">
                      <span className="font-medium">{w.work_title}</span> — {w.composer}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {s.availabilities?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Availability Windows</h4>
                <div className="flex flex-wrap gap-2">
                  {s.availabilities.map((a) => (
                    <span key={a.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                      {a.start_date} → {a.end_date}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={async () => {
                  const action = s.admin_approved ? "reject" : "approve";
                  await onAdminAction(s.id, action);
                  onBack();
                }}
                disabled={isBusy(`singer:${s.id}:approve`) || isBusy(`singer:${s.id}:reject`)}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 inline-flex items-center gap-1.5 ${s.admin_approved ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {(isBusy(`singer:${s.id}:approve`) || isBusy(`singer:${s.id}:reject`)) && <Loader2 className="w-4 h-4 animate-spin" />}
                {s.admin_approved ? "Reject" : "Approve"}
              </button>
              <button
                onClick={async () => {
                  await onAdminAction(s.id, "deactivate");
                  onBack();
                }}
                disabled={isBusy(`singer:${s.id}:deactivate`)}
                className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isBusy(`singer:${s.id}:deactivate`) && <Loader2 className="w-4 h-4 animate-spin" />}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
