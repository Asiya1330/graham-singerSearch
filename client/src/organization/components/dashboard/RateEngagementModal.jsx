import React from "react";
import { motion } from "framer-motion";

/**
 * Presentational "Rate Engagement" modal. State and submission are owned by
 * the parent (ContactsTab); this component only renders the form and reports
 * changes through the provided callbacks.
 */
export function RateEngagementModal({ feedbackForm, setFeedbackForm, feedbackMsg, feedbackSubmitting, onSubmit, onCancel }) {
  if (!feedbackForm) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-1">Rate Engagement</h3>
        <p className="text-sm text-slate-500 mb-4">
          {feedbackForm.singer.first_name} {feedbackForm.singer.last_name} · {feedbackForm.singer.primary_voice_type}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role / Production</label>
            <input
              type="text"
              placeholder="e.g. Violetta in La Traviata"
              value={feedbackForm.role_name}
              onChange={e => setFeedbackForm(f => ({ ...f, role_name: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
              data-testid="input-feedback-role"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Engagement Date</label>
            <input
              type="date"
              value={feedbackForm.engagement_date}
              onChange={e => setFeedbackForm(f => ({ ...f, engagement_date: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
              data-testid="input-feedback-date"
            />
          </div>
          <div className="space-y-2 pt-1">
            <p className="text-sm font-medium text-slate-700">How would you rate this singer?</p>
            {[
              { key: 'was_prepared', label: 'Arrived prepared (knew the role/music)' },
              { key: 'was_professional', label: 'Professional and reliable' },
              { key: 'was_accurate', label: 'Accurately represented themselves' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={feedbackForm[key]}
                  onChange={e => setFeedbackForm(f => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  data-testid={`checkbox-${key}`}
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
              </label>
            ))}
          </div>

          {feedbackMsg && (
            <div className={`text-sm px-3 py-2 rounded-lg ${feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {feedbackMsg.text}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={feedbackSubmitting || !feedbackForm.role_name || !feedbackForm.engagement_date}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-submit-feedback"
          >
            {feedbackSubmitting ? 'Submitting…' : 'Submit Feedback'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
