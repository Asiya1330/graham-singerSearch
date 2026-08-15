import { useState } from "react";
import { adminFetch } from "../lib/adminApi";

export function DeveloperTools() {
  const [reseedLoading, setReseedLoading] = useState(false);
  const [reseedResult, setReseedResult] = useState(null);
  const [reseedError, setReseedError] = useState("");

  const handleReseedDemo = async () => {
    if (!confirm("This will delete all demo singers (emails ending in @example.com) and the 7 demo organizations, then re-insert 100 demo singers + 7 demo orgs. Real user accounts will NOT be affected. Continue?")) return;
    setReseedLoading(true);
    setReseedError("");
    setReseedResult(null);
    try {
      const res = await adminFetch("/api/admin/seed-demo", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setReseedError(data.message || "Reseed failed");
      } else {
        setReseedResult(data);
      }
    } catch (e) {
      setReseedError(e.message || "Network error");
    } finally {
      setReseedLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-base font-semibold text-slate-800" data-testid="text-developer-tools-title">Developer Tools — Demo Data</h2>
          <p className="text-xs text-slate-500 mt-1">
            For development and testing only. Affects demo accounts (emails ending in <code className="px-1 bg-slate-100 rounded">@example.com</code>) and the 7 demo organizations. Real user accounts are preserved.
          </p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <button
              onClick={handleReseedDemo}
              disabled={reseedLoading}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              data-testid="button-reseed-demo"
            >
              {reseedLoading ? "Reseeding…" : "Reseed Demo Data"}
            </button>
            <p className="text-xs text-slate-500 mt-2">
              Wipes and re-inserts 100 demo singers (incl. <code className="px-1 bg-slate-100 rounded">aisha.williams@example.com</code>) and 7 demo orgs. Idempotent — safe to re-run.
            </p>
          </div>
          {reseedResult && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" data-testid="text-reseed-result">
              <div className="font-semibold">Success</div>
              <div className="mt-1">Demo singers before: <span className="font-mono" data-testid="text-reseed-before">{reseedResult.demoSingersBefore}</span></div>
              <div>Demo singers after: <span className="font-mono" data-testid="text-reseed-after">{reseedResult.demoSingersAfter}</span></div>
            </div>
          )}
          {reseedError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" data-testid="text-reseed-error">
              <div className="font-semibold">Failed</div>
              <div className="mt-1">{reseedError}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
