import React from "react";
import { MapPin, Zap, Star } from "lucide-react";

function SingerCard({ singer }) {
  return (

    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:border-red-300 transition-colors group relative">

      {/* Emergency Badge */}
      {singer.emergency_opt_in && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg z-10 shadow-sm flex items-center gap-1">
          <Zap className="w-3 h-3 fill-currentColor" />
          URGENT READY
        </div>
      )}

    </div>

  );
}

export default SingerCard;