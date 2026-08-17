import React from "react";
import {
  Award,
  Edit2,
  Eye,
  Flag,
  Search,
  Shield,
  Star,
  Trash2,
  UserCheck,
  Users,
  UserX,
  Zap,
} from "lucide-react";
import { BusyIcon } from "../BusyIcon";
import { getStatusBadge } from "../utils";

/** Action buttons for one singer — shared by the desktop table row and the mobile card. */
function SingerActions({
  singer,
  onAdminAction,
  onViewSinger,
  onStartEditSinger,
  onFoundingToggle,
  onGift,
  onBadgeToggle,
  isBusy,
  isRowBusy,
  align = "end",
}) {
  const rowBusy = isRowBusy(`singer:${singer.id}:`);
  // The table column is narrow, so there the icons stay on one line and the
  // table scrolls; the mobile card has the full width to wrap into.
  const layout = align === "end" ? "gap-1 justify-end" : "gap-0.5 flex-wrap justify-start";
  return (
    <div className={`flex items-center ${layout} ${rowBusy ? "opacity-70" : ""}`}>
      {!singer.admin_approved && singer.subscription_status !== "inactive" && (
        <button onClick={() => onAdminAction(singer.id, "approve")} disabled={rowBusy} className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded hover:bg-emerald-50 disabled:opacity-50" title="Approve" data-testid={`button-approve-${singer.id}`}>
          <BusyIcon busy={isBusy(`singer:${singer.id}:approve`)}><UserCheck className="w-4 h-4" /></BusyIcon>
        </button>
      )}
      {singer.admin_approved && singer.subscription_status !== "inactive" && (
        <button onClick={() => onAdminAction(singer.id, "reject")} disabled={rowBusy} className="text-amber-600 hover:text-amber-800 p-1.5 rounded hover:bg-amber-50 disabled:opacity-50" title="Reject (Unapprove)" data-testid={`button-reject-${singer.id}`}>
          <BusyIcon busy={isBusy(`singer:${singer.id}:reject`)}><UserX className="w-4 h-4" /></BusyIcon>
        </button>
      )}
      <button onClick={() => onViewSinger(singer.id)} disabled={rowBusy} className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 disabled:opacity-50" title="View Profile" data-testid={`button-view-${singer.id}`}>
        <BusyIcon busy={isBusy(`singer:${singer.id}:view`)}><Eye className="w-4 h-4" /></BusyIcon>
      </button>
      <button onClick={() => onStartEditSinger(singer.id)} disabled={rowBusy} className="text-slate-500 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 disabled:opacity-50" title="Edit" data-testid={`button-edit-singer-${singer.id}`}>
        <BusyIcon busy={isBusy(`singer:${singer.id}:edit`)}><Edit2 className="w-4 h-4" /></BusyIcon>
      </button>
      {singer.subscription_status !== "inactive" ? (
        <button onClick={() => onAdminAction(singer.id, "deactivate")} disabled={rowBusy} className="text-slate-500 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 disabled:opacity-50" title="Deactivate" data-testid={`button-deactivate-${singer.id}`}>
          <BusyIcon busy={isBusy(`singer:${singer.id}:deactivate`)}><Shield className="w-4 h-4" /></BusyIcon>
        </button>
      ) : (
        <button onClick={() => onAdminAction(singer.id, "activate")} disabled={rowBusy} className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded hover:bg-emerald-50 disabled:opacity-50" title="Reactivate" data-testid={`button-activate-${singer.id}`}>
          <BusyIcon busy={isBusy(`singer:${singer.id}:activate`)}><UserCheck className="w-4 h-4" /></BusyIcon>
        </button>
      )}
      <button onClick={() => onFoundingToggle("singer", singer.id, `${singer.first_name} ${singer.last_name}`, !singer.founding_artist)} disabled={rowBusy} className={`p-1.5 rounded transition-colors disabled:opacity-50 ${singer.founding_artist ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" : "text-slate-300 hover:text-slate-400 hover:bg-slate-100"}`} title={singer.founding_artist ? "Revoke Founding" : "Grant Founding"} data-testid={`button-founding-singer-${singer.id}`}>
        <BusyIcon busy={isBusy(`singer:${singer.id}:founding`)}>
          <Star className={`w-4 h-4 ${singer.founding_artist ? "fill-amber-500" : ""}`} />
        </BusyIcon>
      </button>
      <button onClick={() => onGift({ type: "singer", id: singer.id, name: `${singer.first_name} ${singer.last_name}` })} disabled={rowBusy} className="text-violet-600 hover:text-violet-800 p-1.5 rounded hover:bg-violet-50 text-base leading-none disabled:opacity-50" title="Gift Pro Access" data-testid={`button-gift-singer-${singer.id}`}>🎁</button>
      <button onClick={() => onAdminAction(singer.id, "delete")} disabled={rowBusy} className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 disabled:opacity-50" title="Delete" data-testid={`button-delete-singer-${singer.id}`}>
        <BusyIcon busy={isBusy(`singer:${singer.id}:delete`)}><Trash2 className="w-4 h-4" /></BusyIcon>
      </button>
      <span className="w-px h-4 bg-slate-200 mx-0.5" />
      <button onClick={() => onBadgeToggle(singer.id, "is_pro_verified", singer.is_pro_verified)} disabled={rowBusy} className={`p-1.5 rounded text-xs font-bold disabled:opacity-50 ${singer.is_pro_verified ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"}`} title={singer.is_pro_verified ? "Remove Verified Pro" : "Grant Verified Pro"} data-testid={`button-toggle-pro-${singer.id}`}>
        <BusyIcon busy={isBusy(`singer:${singer.id}:badge:is_pro_verified`)}><Award className="w-4 h-4" /></BusyIcon>
      </button>
      <button onClick={() => onBadgeToggle(singer.id, "is_emergency_ready", singer.is_emergency_ready)} disabled={rowBusy} className={`p-1.5 rounded text-xs font-bold relative disabled:opacity-50 ${singer.is_emergency_ready ? "text-red-600 bg-red-50 hover:bg-red-100" : singer.emergency_status_requested ? "text-amber-600 bg-amber-50 hover:bg-red-50 hover:text-red-600 ring-1 ring-amber-400" : "text-slate-400 hover:text-red-600 hover:bg-red-50"}`} title={singer.is_emergency_ready ? "Remove Urgent Ready" : singer.emergency_status_requested ? "Approve Urgent Request" : "Grant Urgent Ready"} data-testid={`button-toggle-emergency-${singer.id}`}>
        <BusyIcon busy={isBusy(`singer:${singer.id}:badge:is_emergency_ready`)}><Zap className="w-4 h-4" /></BusyIcon>
        {singer.emergency_status_requested && !singer.is_emergency_ready && !isBusy(`singer:${singer.id}:badge:is_emergency_ready`) && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
        )}
      </button>
      <button onClick={() => onBadgeToggle(singer.id, "is_management_verified", singer.is_management_verified)} disabled={rowBusy} className={`p-1.5 rounded text-xs font-bold disabled:opacity-50 ${singer.is_management_verified ? "text-violet-600 bg-violet-50 hover:bg-violet-100" : "text-slate-400 hover:text-violet-600 hover:bg-violet-50"}`} title={singer.is_management_verified ? "Remove Management Verified" : "Grant Management Verified"} data-testid={`button-toggle-mgmt-${singer.id}`}>
        <BusyIcon busy={isBusy(`singer:${singer.id}:badge:is_management_verified`)}><Shield className="w-4 h-4" /></BusyIcon>
      </button>
      {singer.flagged_for_review && (
        <button onClick={() => onBadgeToggle(singer.id, "flagged_for_review", true)} disabled={rowBusy} className="p-1.5 rounded text-orange-600 bg-orange-50 hover:bg-orange-100 ring-1 ring-orange-300 disabled:opacity-50" title="Flagged for review — click to clear" data-testid={`button-clear-flag-${singer.id}`}>
          <BusyIcon busy={isBusy(`singer:${singer.id}:badge:flagged_for_review`)}><Flag className="w-4 h-4" /></BusyIcon>
        </button>
      )}
    </div>
  );
}

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";
}

export function SingersPanel({
  allSingers,
  filteredSingers,
  adminTab,
  setAdminTab,
  singerSearchQuery,
  setSingerSearchQuery,
  onAdminAction,
  onViewSinger,
  onStartEditSinger,
  onFoundingToggle,
  onGift,
  onBadgeToggle,
  isBusy,
  isRowBusy,
}) {
  const tabs = [
    { key: "pending", label: "Pending Approval", count: allSingers.filter((s) => !s.admin_approved && !s.admin_rejected && s.subscription_status !== "inactive").length },
    { key: "requests", label: "Urgent Status Requests", count: allSingers.filter((s) => s.emergency_status_requested === true && !s.is_emergency_ready).length },
    { key: "rejected", label: "Rejected", count: allSingers.filter((s) => !s.admin_approved && s.admin_rejected && s.subscription_status !== "inactive").length },
    { key: "approved", label: "Profile Approved", count: allSingers.filter((s) => s.admin_approved && s.subscription_status !== "inactive").length },
    { key: "inactive", label: "Inactive", count: allSingers.filter((s) => s.subscription_status === "inactive").length },
    { key: "founding", label: "Founding", count: allSingers.filter((s) => s.founding_artist).length },
    { key: "all", label: "All", count: allSingers.length },
  ];

  const actionProps = {
    onAdminAction,
    onViewSinger,
    onStartEditSinger,
    onFoundingToggle,
    onGift,
    onBadgeToggle,
    isBusy,
    isRowBusy,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Singer Management</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search singers by name or email…"
              value={singerSearchQuery}
              onChange={(e) => setSingerSearchQuery(e.target.value)}
              className="w-full border border-slate-300 rounded-md h-9 pl-9 pr-3 text-sm"
              data-testid="input-singer-search"
            />
          </div>
          <span className="text-sm text-slate-500 whitespace-nowrap">{allSingers.length} total</span>
        </div>
      </div>

      <div className="border-b border-slate-200 px-4 sm:px-6 overflow-x-auto">
        <div className="flex gap-4 sm:gap-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setAdminTab(tab.key)}
              className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${adminTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
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
        <>
          {/* Mobile: stacked cards */}
          <ul className="divide-y divide-slate-100 lg:hidden" data-testid="admin-singers-cards">
            {filteredSingers.map((singer) => {
              const status = getStatusBadge(singer);
              return (
                <li key={singer.id} className="p-4 space-y-3" data-testid={`admin-singer-card-${singer.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span className="break-words">{singer.first_name} {singer.last_name}</span>
                        {singer.founding_artist && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full" title="Founding Singer">🌟 FOUNDING</span>}
                        {singer.is_gifted && <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full" title="Pro access gifted by admin">🎁 GIFTED</span>}
                      </div>
                      <div className="text-xs text-slate-400 break-all">{singer.email}</div>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div>
                      <dt className="text-slate-400">Voice Type</dt>
                      <dd className="text-slate-700">{singer.primary_voice_type || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">City</dt>
                      <dd className="text-slate-700">{singer.city || "—"}{singer.state ? `, ${singer.state}` : ""}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-400">Date Registered</dt>
                      <dd className="text-slate-700">{formatDate(singer.created_at)}</dd>
                    </div>
                  </dl>
                  <SingerActions singer={singer} align="start" {...actionProps} />
                </li>
              );
            })}
          </ul>

          {/* Desktop: table */}
          <div className="hidden lg:block overflow-x-auto">
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
                {filteredSingers.map((singer) => {
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
                      <td className="px-4 py-3 text-slate-500">{formatDate(singer.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <SingerActions singer={singer} {...actionProps} />
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
