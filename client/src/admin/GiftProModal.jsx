import { Loader2 } from "lucide-react";
import { DEFAULT_GIFT_FORM } from "./constants";

export function GiftProModal({ giftTarget, giftForm, setGiftForm, giftError, giftSubmitting, onClose, onConfirm }) {
  if (!giftTarget) return null;

  const close = () => {
    onClose();
    setGiftForm(DEFAULT_GIFT_FORM);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={close} data-testid="modal-gift-pro">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">🎁 Gift Pro Access</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              To: <span className="font-medium text-slate-700">{giftTarget.name}</span> ({giftTarget.type === "singer" ? "Singer" : "Organization"})
            </p>
          </div>
          <button onClick={close} className="text-slate-400 hover:text-slate-600" data-testid="button-close-gift">✕</button>
        </div>
        <div className="space-y-3 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
            <select
              value={giftForm.duration}
              onChange={(e) => setGiftForm((f) => ({ ...f, duration: e.target.value }))}
              className="w-full border border-slate-300 rounded-md h-9 px-2 text-sm"
              data-testid="select-gift-duration"
            >
              <option value="1m">1 month</option>
              <option value="3m">3 months</option>
              <option value="6m">6 months</option>
              <option value="1y">1 year</option>
              <option value="custom">Custom date…</option>
            </select>
          </div>
          {giftForm.duration === "custom" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expires On</label>
              <input
                type="date"
                value={giftForm.customDate}
                onChange={(e) => setGiftForm((f) => ({ ...f, customDate: e.target.value }))}
                className="w-full border border-slate-300 rounded-md h-9 px-2 text-sm"
                data-testid="input-gift-custom-date"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Reason (optional)</label>
            <textarea
              value={giftForm.reason}
              onChange={(e) => setGiftForm((f) => ({ ...f, reason: e.target.value }))}
              rows={2}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              placeholder="e.g. Beta tester, Promotional grant, VIP partner"
              data-testid="textarea-gift-reason"
            />
          </div>
          {giftError && <p className="text-sm text-red-600" data-testid="text-gift-error">{giftError}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={close} className="h-9 px-4 rounded-md text-sm text-slate-700 bg-slate-100 hover:bg-slate-200" data-testid="button-cancel-gift">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={giftSubmitting}
            className="h-9 px-4 rounded-md text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50"
            data-testid="button-confirm-gift"
          >
            {giftSubmitting ? "Gifting…" : "Gift Pro Access"}
          </button>
        </div>
      </div>
    </div>
  );
}
