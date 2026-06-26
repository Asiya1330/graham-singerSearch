import React from "react";
import { motion } from "framer-motion";
import { useSingerUser } from "../../hooks/useSingerUser";

export function ProfileCompletionBanner() {
  const { user } = useSingerUser();

  const fields = [
    { label: "Voice type", done: !!user.primary_voice_type },
    { label: "Location", done: !!(user.city && user.state) },
    { label: "Bio", done: !!user.short_bio },
    { label: "Headshot", done: !!user.headshot_url },
    { label: "At least one role", done: (user.roles?.length || 0) > 0 },
    { label: "At least one work", done: (user.works?.length || 0) > 0 },
    { label: "Availability", done: (user.availabilities?.length || 0) > 0 },
  ];
  const completed = fields.filter(f => f.done).length;
  const pct = Math.round((completed / fields.length) * 100);
  const incomplete = fields.filter(f => !f.done);
  if (pct >= 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-5 mb-8"
      data-testid="profile-completion-banner"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
          <span className="text-amber-700 font-bold text-sm">{pct}%</span>
        </div>
        <div className="flex-1">
          <h3 className="text-slate-900 font-semibold text-lg mb-1">
            Your profile is {pct}% complete
          </h3>
          <p className="text-slate-600 text-sm mb-3">
            {pct < 50
              ? "Complete your profile to appear in searches. Organizations can't find you without these details."
              : "Almost there! Add the remaining items to maximize your visibility in search results."}
          </p>
          <div className="w-full bg-amber-100 rounded-full h-2 mb-3">
            <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex flex-wrap gap-2">
            {incomplete.map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1 text-xs bg-white border border-amber-200 text-amber-800 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
