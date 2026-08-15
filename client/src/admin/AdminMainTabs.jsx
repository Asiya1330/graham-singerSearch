import { Building2, Lightbulb, Shield, Users } from "lucide-react";

export function AdminMainTabs({ adminMainTab, allSingersCount, allOrgsCount, onTabChange }) {
  return (
    <div className="border-b border-slate-200 mb-6 flex gap-2">
      <button
        onClick={() => onTabChange("singers")}
        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${adminMainTab === "singers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        data-testid="tab-main-singers"
      >
        <Users className="w-4 h-4 inline mr-1" /> Singers
        <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{allSingersCount}</span>
      </button>
      <button
        onClick={() => onTabChange("orgs")}
        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${adminMainTab === "orgs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        data-testid="tab-main-orgs"
      >
        <Building2 className="w-4 h-4 inline mr-1" /> Organizations
        <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{allOrgsCount}</span>
      </button>
      <button
        onClick={() => onTabChange("suggestions")}
        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${adminMainTab === "suggestions" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        data-testid="tab-main-suggestions"
      >
        <Lightbulb className="w-4 h-4 inline mr-1" /> Repertoire Suggestions
      </button>
      <button
        onClick={() => onTabChange("admins")}
        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${adminMainTab === "admins" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        data-testid="tab-main-admins"
      >
        <Shield className="w-4 h-4 inline mr-1" /> Admins
      </button>
    </div>
  );
}
