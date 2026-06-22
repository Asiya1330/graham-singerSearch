import React from "react";
import {
  MapPin,
  Zap,
  Star,
  Heart,
  CheckCircle,
  Award,
  Shield,
  Users,
  Mail,
  Globe,
  Eye,
} from "lucide-react";

function SingerCard({
  singer,
  onViewProfile,
  onContact,
  onUpgrade,
  submittedFilters = {},
  orgIsPro = false,
  revealLimit = 3,
  revealsUsed = 0,
  isShortlisted = false,
  onToggleShortlist,
  shortlistMode = false,
}) {
  if (!singer) return null;

  const fullName = `${singer.first_name || ""} ${singer.last_name || ""}`.trim();
  const subtitle = singer.primary_fach || singer.primary_voice_type || "";
  const performanceTypes = Array.isArray(singer.performance_types)
    ? singer.performance_types
    : [];
  const languages = Array.isArray(singer.languages_sung)
    ? singer.languages_sung.filter(Boolean)
    : [];
  const distance =
    typeof singer.distance_miles === "number" ? Math.round(singer.distance_miles) : null;
  const isLocal = distance != null && distance <= 25;
  const showEmergency = singer.emergency_opt_in || singer.is_emergency_ready;

  const matchReasons = Array.isArray(singer.matchReasons)
    ? singer.matchReasons.filter(Boolean)
    : [];
  const attributeChips = matchReasons.length
    ? matchReasons
    : [
        singer.primary_voice_type,
        singer.union_status,
        singer.represented ? "Represented" : null,
        ...languages.slice(0, 3),
      ].filter(Boolean);

  const reachedRevealLimit = !orgIsPro && revealsUsed >= revealLimit;

  const handleReveal = () => {
    if (reachedRevealLimit) {
      if (onUpgrade) onUpgrade();
      return;
    }
    if (onContact) onContact(singer.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:border-blue-300 transition-colors group relative">
      {showEmergency && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg z-10 shadow-sm flex items-center gap-1">
          <Zap className="w-3 h-3" fill="currentColor" />
          URGENT READY
        </div>
      )}

      <div className="md:w-48 h-48 md:h-auto relative bg-slate-100 flex-shrink-0">
        {singer.headshot_url ? (
          <img
            src={singer.headshot_url}
            alt={fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Users className="w-12 h-12" />
          </div>
        )}
        {isLocal && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
            <MapPin className="w-3 h-3 text-green-600" /> Local
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-slate-900 truncate">{fullName}</h3>
              {singer.admin_approved && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
                  <CheckCircle className="w-3 h-3 mr-1" /> Verified
                </span>
              )}
              {singer.subscription_tier === "founding" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                  <Star className="w-3 h-3 fill-amber-500" /> Founding
                </span>
              )}
              {singer.is_managed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-100 text-violet-800">
                  <Users className="w-3 h-3" /> Managed
                </span>
              )}
            </div>
            {subtitle && <p className="text-slate-600 font-medium mt-0.5">{subtitle}</p>}
          </div>

          {onToggleShortlist && (
            <button
              type="button"
              onClick={() => onToggleShortlist(singer.id)}
              aria-pressed={!!isShortlisted}
              title={isShortlisted ? "Saved to shortlist" : "Save to shortlist"}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isShortlisted
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-red-600 hover:border-red-200"
              }`}
              data-testid={`button-card-shortlist-${singer.id}`}
            >
              <Heart className={`w-4 h-4 ${isShortlisted ? "fill-red-500 text-red-500" : ""}`} />
              {isShortlisted ? "Saved" : "Save"}
            </button>
          )}
        </div>

        {(performanceTypes.length > 0 || singer.is_pro_verified || singer.is_management_verified) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {performanceTypes.map((type) => (
              <span
                key={type}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  type === "Opera"
                    ? "bg-purple-100 text-purple-700"
                    : type === "Orchestra"
                    ? "bg-indigo-100 text-indigo-700"
                    : type === "Chorus"
                    ? "bg-teal-100 text-teal-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {type}
              </span>
            ))}
            {singer.is_pro_verified && (
              <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                <Award className="w-3 h-3" /> Verified Pro
              </span>
            )}
            {singer.is_management_verified && (
              <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                <Shield className="w-3 h-3" /> Management Verified
              </span>
            )}
          </div>
        )}

        <div className="mt-3 mb-3">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            {matchReasons.length ? "Match Analysis" : "Profile"}
          </h4>
          <div className="flex flex-wrap gap-2">
            {attributeChips.length ? (
              attributeChips.map((reason, idx) => (
                <span
                  key={`${reason}-${idx}`}
                  className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200"
                >
                  {reason}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Standard match</span>
            )}
          </div>
        </div>

        {(singer.city || singer.state) && (
          <div className="text-sm text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>
              From{" "}
              <span className="font-semibold text-slate-900">
                {[singer.city, singer.state].filter(Boolean).join(", ")}
              </span>
              {distance != null && !isLocal && (
                <span className="text-slate-400"> · {distance} mi away</span>
              )}
            </span>
          </div>
        )}

        <div className="mt-auto pt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 mt-4">
          <button
            onClick={() => onViewProfile && onViewProfile(singer)}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            data-testid={`button-view-profile-${singer.id}`}
          >
            View Profile
          </button>

          {!shortlistMode &&
            (singer.revealed ? (
              <div className="flex flex-col text-sm text-slate-700 min-w-0">
                {singer.email && (
                  <a
                    href={`mailto:${singer.email}`}
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-medium break-all"
                  >
                    <Mail className="w-3.5 h-3.5" /> {singer.email}
                  </a>
                )}
                {singer.agent_email && (
                  <a
                    href={`mailto:${singer.agent_email}`}
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:underline text-xs"
                  >
                    <Users className="w-3 h-3" /> Agent: {singer.agent_email}
                  </a>
                )}
                {singer.website_url && (
                  <a
                    href={singer.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:underline text-xs"
                  >
                    <Globe className="w-3 h-3" /> Website
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={handleReveal}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                  reachedRevealLimit
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                data-testid={`button-reveal-contact-${singer.id}`}
              >
                <Mail className="w-4 h-4 mr-1.5" />
                {reachedRevealLimit ? "Upgrade to Reveal" : "Reveal Contact"}
              </button>
            ))}

          {singer.viewed_count > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-slate-400">
              <Eye className="w-3.5 h-3.5" /> {singer.viewed_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SingerCard;
