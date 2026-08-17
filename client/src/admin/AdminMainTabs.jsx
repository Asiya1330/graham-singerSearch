import { Building2, Lightbulb, Shield, Users } from "lucide-react";

const TABS = [
  { key: "singers", label: "Singers", Icon: Users, testId: "tab-main-singers" },
  { key: "orgs", label: "Organizations", Icon: Building2, testId: "tab-main-orgs" },
  { key: "suggestions", label: "Repertoire Suggestions", Icon: Lightbulb, testId: "tab-main-suggestions" },
  { key: "admins", label: "Admins", Icon: Shield, testId: "tab-main-admins" },
];

export function AdminMainTabs({ adminMainTab, allSingersCount, allOrgsCount, onTabChange }) {
  const counts = { singers: allSingersCount, orgs: allOrgsCount };

  return (
    <div className="border-b border-slate-200 mb-6 overflow-x-auto">
      <div className="flex gap-1 sm:gap-2 min-w-max">
        {TABS.map(({ key, label, Icon, testId }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`px-3 sm:px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${adminMainTab === key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            data-testid={testId}
          >
            <Icon className="w-4 h-4 inline mr-1" /> {label}
            {counts[key] !== undefined && (
              <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{counts[key]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
