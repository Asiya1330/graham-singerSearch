import { Loader2 } from "lucide-react";
import { CREDIT_REASONS } from "./constants";
import { getOrgBalance } from "./utils";

export function CreditAdjustModal({
  creditAdjustOrgId,
  targetOrg,
  creditAdjustForm,
  setCreditAdjustForm,
  creditAdjustError,
  setCreditAdjustError,
  isBusy,
  onClose,
  onConfirm,
}) {
  if (creditAdjustOrgId === null || !targetOrg) return null;

  const balance = getOrgBalance(targetOrg);
  const close = () => onClose();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={close} data-testid="modal-credit-adjust-overlay">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()} data-testid="modal-credit-adjust">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Adjust Credits</h3>
        <p className="text-sm text-slate-600 mb-4">{targetOrg.organization_name}</p>
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
          <p className="text-xs text-slate-500">Current Balance</p>
          <p className="font-bold text-emerald-700 text-2xl" data-testid="text-credit-current-balance">{balance}</p>
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-600 mb-1">Amount (positive = add, negative = subtract)</label>
          <input
            type="number"
            className="border border-slate-300 rounded-md h-10 px-3 text-sm w-full"
            value={creditAdjustForm.amount}
            onChange={(e) => {
              setCreditAdjustForm({ ...creditAdjustForm, amount: e.target.value });
              if (creditAdjustError) setCreditAdjustError("");
            }}
            placeholder="e.g. 5 or -2"
            data-testid={`input-credit-amount-${creditAdjustOrgId}`}
          />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
          <select
            className="border border-slate-300 rounded-md h-10 px-3 text-sm w-full"
            value={creditAdjustForm.reason}
            onChange={(e) => setCreditAdjustForm({ ...creditAdjustForm, reason: e.target.value })}
            data-testid={`select-credit-reason-${creditAdjustOrgId}`}
          >
            {CREDIT_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        {creditAdjustError && (
          <p className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2" data-testid="text-credit-error">
            {creditAdjustError}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={close} className="h-9 px-4 rounded-md text-sm text-slate-700 bg-slate-100 hover:bg-slate-200" data-testid="button-cancel-credit">Cancel</button>
          <button
            onClick={() => onConfirm(creditAdjustOrgId)}
            disabled={isBusy(`org:${creditAdjustOrgId}:credits`)}
            className="h-9 px-4 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            data-testid={`button-confirm-credit-${creditAdjustOrgId}`}
          >
            {isBusy(`org:${creditAdjustOrgId}:credits`) && <Loader2 className="w-4 h-4 animate-spin" />}
            {isBusy(`org:${creditAdjustOrgId}:credits`) ? "Saving…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
