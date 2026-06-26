import React, { useState, useEffect } from "react";
import { Calendar, Eye, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useSingerUser } from "../../hooks/useSingerUser";

export function StatsGrid() {
  const { user } = useSingerUser();
  const userAvails = user.availabilities || [];
  const [searchAppearances, setSearchAppearances] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/singer/search-appearances", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setSearchAppearances(data.count ?? 0);
      } catch (_) { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white overflow-hidden shadow rounded-lg"
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-6 w-6 text-slate-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Profile Views</dt>
                <dd>
                  <div className="text-lg font-medium text-slate-900" data-testid="text-profile-views">{user.viewed_count}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white overflow-hidden shadow rounded-lg"
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Active Availabilities</dt>
                <dd>
                  <div className="text-lg font-medium text-slate-900">{userAvails.length}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white overflow-hidden shadow rounded-lg"
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-slate-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Search Appearances</dt>
                <dd>
                  {searchAppearances === null ? (
                    <div className="text-sm font-medium text-slate-400">…</div>
                  ) : (
                    <div className="text-lg font-medium text-slate-900" data-testid="text-search-appearances">
                      {searchAppearances}
                      <span className="ml-1 text-xs font-normal text-slate-500">last 30 days</span>
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
