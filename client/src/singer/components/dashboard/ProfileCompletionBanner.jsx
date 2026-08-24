import React from "react";
import { motion } from "framer-motion";
import { useSingerUser } from "../../hooks/useSingerUser";

const SETTINGS_KEYS = new Set(["voice", "location"]);

function hasMediaLink(user) {
  return !!(
    (user.video_link_1 && user.video_link_1.trim()) ||
    (user.video_link_2 && user.video_link_2.trim()) ||
    (user.audio_link_1 && user.audio_link_1.trim())
  );
}

export function ProfileCompletionBanner() {
  const { user, setView } = useSingerUser();

  const fields = [
    { key: "voice", label: "Voice type", done: !!user.primary_voice_type, sectionId: "section-personal-info" },
    { key: "location", label: "Location", done: !!(user.city && user.state), sectionId: "section-personal-info" },
    { key: "bio", label: "Bio", done: !!user.short_bio, sectionId: "section-bio" },
    { key: "headshot", label: "Headshot", done: !!user.headshot_url, sectionId: "section-headshot" },
    { key: "media", label: "YouTube or media", done: hasMediaLink(user), sectionId: "section-media-links" },
    { key: "role", label: "At least one role", done: (user.roles?.length || 0) > 0, sectionId: "section-repertoire" },
    { key: "work", label: "At least one work", done: (user.works?.length || 0) > 0, sectionId: "section-repertoire" },
    { key: "availability", label: "Availability", done: (user.availabilities?.length || 0) > 0, sectionId: "section-availability" },
  ];
  const completed = fields.filter((f) => f.done).length;
  const pct = Math.round((completed / fields.length) * 100);
  const incomplete = fields.filter((f) => !f.done);
  if (pct >= 100) return null;

  const goToField = (field) => {
    const scroll = () => {
      document.getElementById(field.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (SETTINGS_KEYS.has(field.key)) {
      setView("singerSettings");
      setTimeout(scroll, 150);
    } else {
      scroll();
    }
  };

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
              <button
                key={f.key}
                type="button"
                onClick={() => goToField(f)}
                data-testid={`chip-complete-${f.key}`}
                className="inline-flex items-center gap-1 text-xs bg-white border border-amber-200 text-amber-800 px-2 py-1 rounded-full hover:bg-amber-100 hover:border-amber-300 cursor-pointer transition-colors"
              >
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
