export function AdminStats({ stats, extStats, onNavigateSingers, onNavigateOrgs }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
      <button
        type="button"
        onClick={onNavigateSingers}
        className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
        data-testid="card-stat-singers"
      >
        <p className="text-xs font-medium text-slate-500 mb-1">Total Singers →</p>
        <p className="text-2xl font-bold text-slate-900" data-testid="stat-total-singers">{stats.total_singers}</p>
      </button>
      <button
        type="button"
        onClick={onNavigateSingers}
        className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
        data-testid="card-stat-founding"
      >
        <p className="text-xs font-medium text-slate-500 mb-1">Founding Artists →</p>
        <p className="text-2xl font-bold text-amber-600" data-testid="stat-founding-count">{stats.founding_count}</p>
      </button>
      <button
        type="button"
        onClick={onNavigateOrgs}
        className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
        data-testid="card-stat-orgs"
      >
        <p className="text-xs font-medium text-slate-500 mb-1">Organizations →</p>
        <p className="text-2xl font-bold text-slate-900" data-testid="stat-total-orgs">{stats.total_orgs}</p>
      </button>
      <button
        type="button"
        onClick={onNavigateOrgs}
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
  );
}
