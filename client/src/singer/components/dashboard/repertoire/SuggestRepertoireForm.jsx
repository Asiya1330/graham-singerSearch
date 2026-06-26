import React, { useState } from "react";

export function SuggestRepertoireForm() {
  const [isSuggestingRepertoire, setIsSuggestingRepertoire] = useState(false);
  const [suggestForm, setSuggestForm] = useState({ work_title: "", composer: "", role_name: "", notes: "" });
  const [suggestSubmitting, setSuggestSubmitting] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestError, setSuggestError] = useState("");

  const submitRepertoireSuggestion = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSuggestError("");
    if (!suggestForm.work_title.trim()) {
      setSuggestError("Work title is required.");
      return;
    }
    setSuggestSubmitting(true);
    try {
      const res = await fetch("/api/suggest-repertoire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          work_title: suggestForm.work_title.trim(),
          composer: suggestForm.composer.trim() || null,
          role_name: suggestForm.role_name.trim() || null,
          notes: suggestForm.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit suggestion");
      }
      setSuggestForm({ work_title: "", composer: "", role_name: "", notes: "" });
      setSuggestSuccess(true);
      setTimeout(() => setSuggestSuccess(false), 4000);
    } catch (err) {
      setSuggestError(err.message || "Failed to submit suggestion");
    } finally {
      setSuggestSubmitting(false);
    }
  };

  return (
    <div className="px-6 pt-4 pb-2 border-b border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setIsSuggestingRepertoire(v => !v)}
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        data-testid="link-suggest-repertoire"
      >
        Can't find a work or role? Suggest one →
      </button>
      {isSuggestingRepertoire && (
        <form onSubmit={submitRepertoireSuggestion} className="mt-3 p-4 rounded-md border border-slate-200 bg-slate-50" data-testid="form-suggest-repertoire">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Work Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={suggestForm.work_title}
                onChange={(e) => setSuggestForm({ ...suggestForm, work_title: e.target.value })}
                placeholder="e.g. Some Rare Opera"
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-9 border px-3 text-sm"
                data-testid="input-suggest-work-title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Composer</label>
              <input
                type="text"
                value={suggestForm.composer}
                onChange={(e) => setSuggestForm({ ...suggestForm, composer: e.target.value })}
                placeholder="e.g. Composer Name"
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-9 border px-3 text-sm"
                data-testid="input-suggest-composer"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Role Name</label>
              <input
                type="text"
                value={suggestForm.role_name}
                onChange={(e) => setSuggestForm({ ...suggestForm, role_name: e.target.value })}
                placeholder="e.g. Character Name"
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-9 border px-3 text-sm"
                data-testid="input-suggest-role-name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={suggestForm.notes}
                onChange={(e) => setSuggestForm({ ...suggestForm, notes: e.target.value })}
                placeholder="e.g. this is commonly listed as X"
                rows={2}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-sm"
                data-testid="input-suggest-notes"
              />
            </div>
          </div>
          {suggestError && <p className="mt-3 text-sm text-red-600" data-testid="text-suggest-error">{suggestError}</p>}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={suggestSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              data-testid="button-submit-suggestion"
            >
              {suggestSubmitting ? "Submitting…" : "Submit suggestion"}
            </button>
            <button
              type="button"
              onClick={() => { setIsSuggestingRepertoire(false); setSuggestError(""); }}
              className="text-sm text-slate-500 hover:text-slate-700"
              data-testid="button-cancel-suggestion"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {suggestSuccess && (
        <p className="mt-3 text-sm text-green-700" data-testid="text-suggest-success">
          Thanks — we'll review your suggestion.
        </p>
      )}
    </div>
  );
}
