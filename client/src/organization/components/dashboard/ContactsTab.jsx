import React, { useState, useEffect } from "react";
import { BarChart2, Users } from "lucide-react";
import { useOrgUser } from "../../hooks/useOrgUser";
import { RateEngagementModal } from "./RateEngagementModal";

export function ContactsTab({ viewProfile }) {
  const { setOrgTab } = useOrgUser();
  const [revealedSingers, setRevealedSingers] = useState([]);
  const [revealedLoading, setRevealedLoading] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const loadRevealedSingers = async () => {
    setRevealedLoading(true);
    try {
      const res = await fetch("/api/org/revealed-singers", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setRevealedSingers(data);
    } catch (err) {}
    setRevealedLoading(false);
  };

  // Load contact history whenever this tab mounts (i.e. when selected).
  useEffect(() => {
    loadRevealedSingers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFeedbackSubmit = async () => {
    if (!feedbackForm) return;
    setFeedbackSubmitting(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          singer_id: feedbackForm.singer.id,
          role_name: feedbackForm.role_name,
          engagement_date: feedbackForm.engagement_date,
          was_prepared: feedbackForm.was_prepared,
          was_professional: feedbackForm.was_professional,
          was_accurate: feedbackForm.was_accurate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({ type: "error", text: data.message || "Failed to submit feedback" });
      } else {
        setFeedbackMsg({ type: "success", text: "Feedback submitted. Thank you!" });
        setTimeout(() => { setFeedbackForm(null); setFeedbackMsg(null); loadRevealedSingers(); }, 1800);
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Failed to submit feedback" });
    }
    setFeedbackSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Contact History</h2>
          <p className="text-sm text-slate-500 mt-0.5">Singers whose contact details you have revealed</p>
        </div>
      </div>

      {revealedLoading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 mt-3">Loading contacts…</p>
        </div>
      ) : revealedSingers.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No contacts yet</h3>
          <p className="text-sm text-slate-500">Singers you reveal contact details for will appear here.</p>
          <button onClick={() => setOrgTab('search')} className="mt-4 text-blue-600 hover:underline text-sm">Go to Search</button>
        </div>
      ) : (
        <div className="space-y-3">
          {revealedSingers.map((singer) => (
            <div key={singer.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm" data-testid={`contact-row-${singer.id}`}>
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {singer.first_name?.[0]}{singer.last_name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{singer.first_name} {singer.last_name}</p>
                  <p className="text-sm text-slate-500 truncate">{singer.primary_voice_type} · {singer.city}{singer.state ? `, ${singer.state}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                <button
                  onClick={() => viewProfile(singer)}
                  className="text-sm text-blue-600 hover:underline"
                  data-testid={`button-view-contact-${singer.id}`}
                >
                  View Profile
                </button>
                <button
                  onClick={() => setFeedbackForm({ singer, role_name: '', engagement_date: '', was_prepared: false, was_professional: false, was_accurate: false })}
                  className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                  data-testid={`button-rate-${singer.id}`}
                >
                  <BarChart2 className="w-3.5 h-3.5" /> Rate Engagement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RateEngagementModal
        feedbackForm={feedbackForm}
        setFeedbackForm={setFeedbackForm}
        feedbackMsg={feedbackMsg}
        feedbackSubmitting={feedbackSubmitting}
        onSubmit={handleFeedbackSubmit}
        onCancel={() => { setFeedbackForm(null); setFeedbackMsg(null); }}
      />
    </div>
  );
}
