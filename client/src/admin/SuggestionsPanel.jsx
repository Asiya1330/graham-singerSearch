import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { adminFetch } from "../lib/adminApi";
import { describeError, getApiErrorMessage } from "../lib/api";

export function SuggestionsPanel() {
  const [repertoireSuggestions, setRepertoireSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await adminFetch("/api/admin/repertoire-suggestions", { credentials: "include" });
        if (!res.ok) throw new Error(await getApiErrorMessage(res, "OPERATION_FAILED"));
        const data = await res.json();
        if (!cancelled) setRepertoireSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(describeError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8" data-testid="section-repertoire-suggestions">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Repertoire Suggestions</h2>
        <span className="text-sm text-slate-500">{repertoireSuggestions.length} total</span>
      </div>
      {loading ? (
        <div className="p-6 text-sm text-slate-500">Loading…</div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600">{error}</div>
      ) : repertoireSuggestions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No suggestions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Singer</th>
                <th className="text-left px-4 py-2 font-medium">Work Title</th>
                <th className="text-left px-4 py-2 font-medium">Composer</th>
                <th className="text-left px-4 py-2 font-medium">Role</th>
                <th className="text-left px-4 py-2 font-medium">Notes</th>
                <th className="text-left px-4 py-2 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {repertoireSuggestions.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 align-top" data-testid={`row-suggestion-${s.id}`}>
                  <td className="px-4 py-2 text-slate-900">{[s.singer_first_name, s.singer_last_name].filter(Boolean).join(" ") || `Singer #${s.singer_id}`}</td>
                  <td className="px-4 py-2 text-slate-900">{s.work_title}</td>
                  <td className="px-4 py-2 text-slate-700">{s.composer || "—"}</td>
                  <td className="px-4 py-2 text-slate-700">{s.role_name || "—"}</td>
                  <td className="px-4 py-2 text-slate-700 max-w-xs whitespace-pre-wrap">{s.notes || "—"}</td>
                  <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
