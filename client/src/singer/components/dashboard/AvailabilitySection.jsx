import React, { useState } from "react";
import { Calendar, X, Zap } from "lucide-react";
import { useSingerUser } from "../../hooks/useSingerUser";
import { EmergencyAvailabilityPanel } from "./EmergencyAvailabilityPanel";

export function AvailabilitySection() {
  const { user, setView, showAlert, refreshUser } = useSingerUser();
  const userAvails = user.availabilities || [];
  const isPro = user.subscription_tier === 'pro';

  const [availStart, setAvailStart] = useState("");
  const [availEnd, setAvailEnd] = useState("");
  const [availSaving, setAvailSaving] = useState(false);

  const handleAddAvailability = async () => {
    if (!availStart || !availEnd) { showAlert("Please select both start and end dates", "error"); return; }
    if (new Date(availEnd) <= new Date(availStart)) { showAlert("End date must be after start date", "error"); return; }
    setAvailSaving(true);
    try {
      const res = await fetch("/api/singer/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ start_date: availStart, end_date: availEnd }),
      });
      if (!res.ok) { showAlert("Failed to add availability", "error"); setAvailSaving(false); return; }
      await refreshUser();
      setAvailStart("");
      setAvailEnd("");
      showAlert("Availability window added", "success");
    } catch (err) {
      showAlert("Failed to add availability", "error");
    }
    setAvailSaving(false);
  };

  const handleDeleteAvailability = async (availId) => {
    try {
      const res = await fetch(`/api/singer/availability/${availId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) { showAlert("Failed to remove availability", "error"); return; }
      await refreshUser();
      showAlert("Availability removed", "success");
    } catch (err) {
      showAlert("Failed to remove availability", "error");
    }
  };

  const handleRequestEmergency = async () => {
    try {
      const res = await fetch("/api/singer/request-emergency", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await refreshUser();
      showAlert("Urgent availability signal submitted for admin review.", "success");
    } catch (err) {
      showAlert(err.message || "Failed to submit request", "error");
    }
  };

  const handleOptOutEmergency = async () => {
    if (!window.confirm("Opt out of Short-Notice Engagements? Your profile will no longer appear in urgent searches.")) return;
    try {
      const res = await fetch("/api/singer/emergency/opt-out", { method: "POST", credentials: "include" });
      if (!res.ok) { showAlert("Failed to opt out", "error"); return; }
      await refreshUser();
      showAlert("Opted out of Short-Notice Engagements.", "success");
    } catch (err) {
      showAlert("Failed to opt out", "error");
    }
  };

  const handleCancelEmergencyRequest = async () => {
    try {
      const res = await fetch("/api/singer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emergency_status_requested: false }),
      });
      if (!res.ok) { showAlert("Failed to cancel request", "error"); return; }
      await refreshUser();
      showAlert("Urgent request cancelled.", "success");
    } catch (err) {
      showAlert("Failed to cancel request", "error");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg leading-6 font-medium text-slate-900">Availability</h3>
          <p className="mt-1 text-sm text-slate-500">Add date windows when you are available for engagements.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {user.is_emergency_ready ? (
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-xs font-bold">
                <Zap className="w-3.5 h-3.5" /> Available for Short-Notice Engagements
              </span>
              <button
                onClick={handleOptOutEmergency}
                className="text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1 rounded transition-colors"
                data-testid="button-optout-emergency"
              >
                Opt Out
              </button>
            </div>
          ) : user.emergency_status_requested ? (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5" data-testid="status-emergency-pending">
              <span className="inline-flex items-center gap-1 text-amber-800 text-xs font-bold">
                <Zap className="w-3.5 h-3.5" /> Short-Notice Request Pending
              </span>
              <span className="text-[10px] text-amber-700">Awaiting admin review</span>
              <button
                onClick={handleCancelEmergencyRequest}
                className="text-xs font-medium text-amber-700 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded transition-colors"
                data-testid="button-cancel-emergency-request"
              >
                Cancel Request
              </button>
            </div>
          ) : isPro ? (
            <button
              onClick={handleRequestEmergency}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs shadow-sm transition-colors"
              data-testid="button-request-emergency"
            >
              <Zap className="w-3.5 h-3.5" /> Opt In to Short-Notice Engagements
            </button>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2 rounded-full border bg-slate-50 border-slate-200 opacity-75" title="You may be contacted on short notice for last-minute replacements.">
              <div>
                <span className="text-sm font-bold flex items-center gap-1 text-slate-500">
                  <Zap className="w-3 h-3" /> Available for Short-Notice Engagements
                </span>
                <div className="text-[10px] text-blue-600 font-medium cursor-pointer" onClick={() => setView("pricing")}>Upgrade to enable</div>
              </div>
            </label>
          )}
        </div>
      </div>

      {user.is_emergency_ready && <EmergencyAvailabilityPanel />}

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 items-end mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              data-testid="input-avail-start"
              type="date"
              value={availStart}
              onChange={(e) => setAvailStart(e.target.value)}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 px-3 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              data-testid="input-avail-end"
              type="date"
              value={availEnd}
              onChange={(e) => setAvailEnd(e.target.value)}
              className="w-full rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 px-3 text-sm"
            />
          </div>
          <button
            data-testid="button-add-availability"
            onClick={handleAddAvailability}
            disabled={availSaving}
            className="inline-flex items-center px-4 h-10 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {availSaving ? "Adding…" : "+ Add Window"}
          </button>
        </div>

        {userAvails.length > 0 ? (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Windows</h4>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <ul className="divide-y divide-slate-200">
                {userAvails.map((a) => (
                  <li key={a.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50" data-testid={`avail-window-${a.id}`}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900 font-medium">
                        {new Date(a.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-slate-400">—</span>
                      <span className="text-sm text-slate-900 font-medium">
                        {new Date(a.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      {a.status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {a.status}
                        </span>
                      )}
                    </div>
                    <button
                      data-testid={`button-delete-avail-${a.id}`}
                      onClick={() => handleDeleteAvailability(a.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Remove this window"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No availability windows yet. Add dates above to appear in search results.</p>
          </div>
        )}
      </div>
    </div>
  );
}
