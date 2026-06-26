import React from "react";
import { Award, BarChart2, Shield, Zap } from "lucide-react";
import { useSingerUser } from "../../hooks/useSingerUser";

export function ReputationStatsCard() {
  const { user } = useSingerUser();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-blue-500" /> How Organizations See You
      </h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[120px]">
          {(user.total_gigs || 0) >= 3 ? (
            <>
              <p className="text-3xl font-bold text-blue-600">{user.reliability_score || 0}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Reliability Score</p>
              <p className="text-xs text-slate-400">Based on {user.total_gigs} verified engagements</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-slate-400">No data yet</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(user.total_gigs || 0) > 0 ? `${user.total_gigs} engagement${user.total_gigs === 1 ? '' : 's'} — need 3 minimum` : 'Reliability score appears after 3 verified engagements'}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-start">
          {user.is_pro_verified ? (
            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full text-xs font-bold">
              <Award className="w-3.5 h-3.5" /> Verified Pro
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full text-xs">
              Verified Pro (not yet)
            </span>
          )}
          {user.is_emergency_ready && (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-bold">
              <Zap className="w-3.5 h-3.5" /> Short-Notice Ready
            </span>
          )}
          {user.is_management_verified ? (
            <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 px-2.5 py-1 rounded-full text-xs font-bold">
              <Shield className="w-3.5 h-3.5" /> Management Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full text-xs">
              Management Verified (not yet)
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-2">
        {[
          { tier: 1, label: "Self-Reported", color: "bg-slate-100 text-slate-500" },
          { tier: 2, label: "Partially Verified", color: "bg-blue-100 text-blue-700" },
          { tier: 3, label: "Verified", color: "bg-emerald-100 text-emerald-700" },
        ].map(({ tier, label, color }) => (
          <span key={tier} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${(user.confidence_tier || 1) === tier ? color : 'bg-slate-50 text-slate-300 line-through'}`}>
            {label}
          </span>
        ))}
        <span className="text-xs text-slate-400 ml-auto">Confidence Tier {user.confidence_tier || 1} of 3</span>
      </div>
      <p className="text-xs text-slate-400 mt-2">Badges and scores are verified by SingerSearch administrators.</p>
    </div>
  );
}
