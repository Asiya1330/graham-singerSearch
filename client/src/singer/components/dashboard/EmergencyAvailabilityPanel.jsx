import React, { useState, useEffect } from "react";
import { useSingerUser } from "../../hooks/useSingerUser";

/**
 * Short-Notice / Emergency settings panel. Rendered inside AvailabilitySection
 * only when the singer is emergency-ready. Owns the emergency settings form
 * state and its save handler.
 */
export function EmergencyAvailabilityPanel() {
  const { user, showAlert, refreshUser } = useSingerUser();
  const [emForm, setEmForm] = useState({
    lead_time: user.emergency_lead_time_hours ?? "",
    radius: user.emergency_travel_radius_miles ?? "",
    modes: Array.isArray(user.emergency_travel_modes) ? user.emergency_travel_modes : [],
    notes: user.emergency_notes || "",
  });
  const [emSaving, setEmSaving] = useState(false);

  useEffect(() => {
    setEmForm({
      lead_time: user.emergency_lead_time_hours ?? "",
      radius: user.emergency_travel_radius_miles ?? "",
      modes: Array.isArray(user.emergency_travel_modes) ? user.emergency_travel_modes : [],
      notes: user.emergency_notes || "",
    });
  }, [
    user.emergency_lead_time_hours,
    user.emergency_travel_radius_miles,
    user.emergency_travel_modes,
    user.emergency_notes,
    user.emergency_opt_in,
  ]);

  return (
    <div className="px-6 py-5 border-b border-amber-200 bg-amber-50/40">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Minimum Lead Time</label>
          <select
            data-testid="select-em-lead-time"
            value={emForm.lead_time ?? ""}
            onChange={(e) => setEmForm(f => ({ ...f, lead_time: e.target.value === "" ? "" : parseInt(e.target.value, 10) }))}
            className="w-full rounded-md border border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 h-10 px-3 text-sm"
          >
            <option value="">No minimum</option>
            <option value="6">6 hours</option>
            <option value="12">12 hours</option>
            <option value="24">24 hours (1 day)</option>
            <option value="48">48 hours (2 days)</option>
            <option value="72">72 hours (3 days)</option>
            <option value="168">1 week</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Travel Radius (miles)</label>
          <input
            data-testid="input-em-radius"
            type="number"
            min="0"
            step="10"
            placeholder="e.g. 100"
            value={emForm.radius ?? ""}
            onChange={(e) => setEmForm(f => ({ ...f, radius: e.target.value === "" ? "" : parseInt(e.target.value, 10) }))}
            className="w-full rounded-md border border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 h-10 px-3 text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Travel Modes</label>
          <div className="flex flex-wrap gap-2">
            {["Car", "Train", "Plane"].map(mode => {
              const checked = emForm.modes.includes(mode);
              return (
                <label key={mode} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer ${checked ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setEmForm(f => ({
                      ...f,
                      modes: f.modes.includes(mode) ? f.modes.filter(m => m !== mode) : [...f.modes, mode],
                    }))}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    data-testid={`checkbox-em-mode-${mode.toLowerCase()}`}
                  />
                  {mode}
                </label>
              );
            })}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Notes for Organizations</label>
          <textarea
            data-testid="input-em-notes"
            rows={2}
            placeholder="e.g. Available evenings/weekends; can travel within New England."
            value={emForm.notes}
            onChange={(e) => setEmForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full rounded-md border border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          data-testid="button-save-emergency-settings"
          disabled={emSaving}
          onClick={async () => {
            setEmSaving(true);
            try {
              const res = await fetch("/api/singer/emergency", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  opt_in: true,
                  lead_time: emForm.lead_time === "" ? null : emForm.lead_time,
                  radius: emForm.radius === "" ? null : emForm.radius,
                  modes: emForm.modes,
                  notes: emForm.notes,
                }),
              });
              if (!res.ok) { showAlert("Failed to save settings", "error"); return; }
              await refreshUser();
              showAlert("Short-notice settings saved", "success");
            } catch (err) {
              showAlert("Failed to save settings", "error");
            }
            setEmSaving(false);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
        >
          {emSaving ? "Saving…" : "Save Emergency Settings"}
        </button>
      </div>
    </div>
  );
}
