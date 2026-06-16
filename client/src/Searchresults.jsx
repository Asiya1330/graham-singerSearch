import React from "react";
import { MapPin, Zap } from "lucide-react";

function SearchResults({ results = [] }) {
  if (!results.length) {
    return <p className="text-sm text-slate-500">No results to display.</p>;
  }

  return (
    <>
      {results.map((singer) => (
        <div
          key={singer.id}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:border-red-300 transition-colors group relative"
        >
          {singer.emergency_opt_in && (
            <div className="absolute top-0 left-0 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg z-10 shadow-sm flex items-center gap-1">
              <Zap className="w-3 h-3" fill="currentColor" />
              URGENT READY
            </div>
          )}

          <div className="md:w-56 h-56 md:h-auto relative bg-slate-100 flex-shrink-0">
            <img src={singer.headshot_url} alt="" className="w-full h-full object-cover" />
            {singer.distanceType === "local" && (
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                <MapPin className="w-3 h-3 text-green-600" /> Local
              </div>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {singer.first_name} {singer.last_name}
                </h3>
                <p className="text-slate-600 font-medium">{singer.primary_fach}</p>
              </div>
            </div>

            <div className="mt-4 mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Match Analysis</h4>
              <div className="flex flex-wrap gap-2">
                {singer.matchReasons?.map((reason, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200"
                  >
                    {reason}
                  </span>
                ))}
                {!singer.matchReasons?.length && (
                  <span className="text-xs text-slate-400">Standard match</span>
                )}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 text-sm text-slate-500">
              From{" "}
              <span className="font-semibold text-slate-900">
                {singer.city}, {singer.state}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default SearchResults;
