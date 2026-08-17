import React from "react";
import { ArrowDown, ArrowUp, Building2, CreditCard, Edit2, Eye, Star, Trash2 } from "lucide-react";
import { BusyIcon } from "../BusyIcon";
import { getOrgBalance } from "../utils";

/** Action buttons for one organization — shared by the desktop table row and the mobile card. */
function OrgActions({
  org,
  isPro,
  onViewOrg,
  onEditOrg,
  onAdjustCredits,
  onToggleSubscription,
  onFoundingToggle,
  onGift,
  onDeleteOrg,
  isBusy,
  isRowBusy,
  align = "end",
}) {
  const rowBusy = isRowBusy(`org:${org.id}:`);
  // The table column is narrow, so there the icons stay on one line and the
  // table scrolls; the mobile card has the full width to wrap into.
  const layout = align === "end" ? "justify-end" : "flex-wrap justify-start";
  return (
    <div className={`flex items-center gap-1 ${layout} ${rowBusy ? "opacity-70" : ""}`}>
      <button onClick={() => onViewOrg(org.id)} disabled={rowBusy} className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 disabled:opacity-50" title="View" data-testid={`button-view-org-${org.id}`}>
        <BusyIcon busy={isBusy(`org:${org.id}:view`)}><Eye className="w-4 h-4" /></BusyIcon>
      </button>
      <button onClick={() => onEditOrg(org)} disabled={rowBusy} className="text-slate-500 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 disabled:opacity-50" title="Edit" data-testid={`button-edit-org-${org.id}`}><Edit2 className="w-4 h-4" /></button>
      <button onClick={() => onAdjustCredits(org.id)} disabled={rowBusy} className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded hover:bg-emerald-50 disabled:opacity-50" title="Adjust Credits" data-testid={`button-adjust-org-${org.id}`}><CreditCard className="w-4 h-4" /></button>
      <button onClick={() => onToggleSubscription(org.id, org.subscription_tier)} disabled={rowBusy} className={`p-1.5 rounded disabled:opacity-50 ${isPro ? "text-amber-600 hover:bg-amber-50" : "text-indigo-600 hover:bg-indigo-50"}`} title={isPro ? "Downgrade to Free" : "Upgrade to Pro"} data-testid={`button-toggle-org-tier-${org.id}`}>
        <BusyIcon busy={isBusy(`org:${org.id}:tier`)}>
          {isPro ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
        </BusyIcon>
      </button>
      <button onClick={() => onFoundingToggle("org", org.id, org.organization_name, !org.founding_org)} disabled={rowBusy} className={`p-1.5 rounded transition-colors disabled:opacity-50 ${org.founding_org ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" : "text-slate-300 hover:text-slate-400 hover:bg-slate-100"}`} title={org.founding_org ? "Revoke Founding" : "Grant Founding"} data-testid={`button-founding-org-${org.id}`}>
        <BusyIcon busy={isBusy(`org:${org.id}:founding`)}>
          <Star className={`w-4 h-4 ${org.founding_org ? "fill-amber-500" : ""}`} />
        </BusyIcon>
      </button>
      <button onClick={() => onGift({ type: "org", id: org.id, name: org.organization_name })} disabled={rowBusy} className="text-violet-600 hover:text-violet-800 p-1.5 rounded hover:bg-violet-50 text-base leading-none disabled:opacity-50" title="Gift Pro Access" data-testid={`button-gift-org-${org.id}`}>🎁</button>
      <button onClick={() => onDeleteOrg(org.id)} disabled={rowBusy} className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 disabled:opacity-50" title="Delete" data-testid={`button-delete-org-${org.id}`}>
        <BusyIcon busy={isBusy(`org:${org.id}:delete`)}><Trash2 className="w-4 h-4" /></BusyIcon>
      </button>
    </div>
  );
}

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";
}

export function OrgsPanel({
  allOrgs,
  onViewOrg,
  onEditOrg,
  onAdjustCredits,
  onToggleSubscription,
  onFoundingToggle,
  onGift,
  onDeleteOrg,
  isBusy,
  isRowBusy,
}) {
  const actionProps = {
    onViewOrg,
    onEditOrg,
    onAdjustCredits,
    onToggleSubscription,
    onFoundingToggle,
    onGift,
    onDeleteOrg,
    isBusy,
    isRowBusy,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Organization Management</h2>
        <span className="text-sm text-slate-500">{allOrgs.length} total organizations</span>
      </div>
      {allOrgs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No organizations yet.</p>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <ul className="divide-y divide-slate-100 lg:hidden" data-testid="admin-orgs-cards">
            {allOrgs.map((org) => {
              const balance = getOrgBalance(org);
              const isPro = org.subscription_tier === "pro";
              return (
                <li key={org.id} className="p-4 space-y-3" data-testid={`admin-org-card-${org.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span className="break-words">{org.organization_name}</span>
                        {org.founding_org && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full" title="Founding Organization">🌟 FOUNDING</span>}
                        {org.is_gifted && <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full" title="Pro access gifted by admin">🎁 GIFTED</span>}
                      </div>
                      <div className="text-xs text-slate-400 break-all">{org.email}</div>
                      {org.organization_type && <div className="text-xs text-slate-400">{org.organization_type}</div>}
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${isPro ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`} data-testid={`badge-org-tier-card-${org.id}`}>
                      {isPro ? "Pro" : "Free"}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div>
                      <dt className="text-slate-400">City</dt>
                      <dd className="text-slate-700">{org.city || "—"}{org.state ? `, ${org.state}` : ""}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Balance</dt>
                      <dd className="font-medium text-emerald-600" data-testid={`text-org-balance-card-${org.id}`}>{balance}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Searches</dt>
                      <dd className="text-slate-700">{org.search_count}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Reveals</dt>
                      <dd className="text-slate-700">{org.reveal_count}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-400">Joined</dt>
                      <dd className="text-slate-700">{formatDate(org.created_at)}</dd>
                    </div>
                  </dl>
                  <OrgActions org={org} isPro={isPro} align="start" {...actionProps} />
                </li>
              );
            })}
          </ul>

          {/* Desktop: table */}
          <div className="hidden lg:block overflow-x-auto">
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
                {allOrgs.map((org) => {
                  const balance = getOrgBalance(org);
                  const isPro = org.subscription_tier === "pro";
                  return (
                    <tr key={org.id} className="hover:bg-slate-50" data-testid={`admin-org-row-${org.id}`}>
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
                      <td className="px-4 py-3 text-slate-500">{formatDate(org.created_at)}</td>
                      <td className="px-4 py-3">
                        <OrgActions org={org} isPro={isPro} {...actionProps} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
