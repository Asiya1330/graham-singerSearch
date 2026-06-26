import React from "react";
import { Info } from "lucide-react";
import { useSingerUser } from "../../hooks/useSingerUser";

export function StatusBanners() {
  const { user, refreshUser } = useSingerUser();

  return (
    <>
      {!user.admin_approved && user.admin_rejected && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-8 flex items-start gap-3" data-testid="rejected-banner">
          <Info className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">
            Your profile was not approved. Please contact us for assistance.
          </p>
        </div>
      )}

      {!user.admin_approved && !user.admin_rejected && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-8 flex items-start gap-3" data-testid="pending-approval-banner">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Your profile is pending approval. You will appear in search once an administrator approves your account.
          </p>
        </div>
      )}

      {user.founding_artist && user.subscription_tier === 'pro' && user.pro_expires_at && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-lg p-4 mb-4 flex items-start gap-3" data-testid="banner-founding-singer-dashboard">
          <span className="text-2xl leading-none flex-shrink-0">🌟</span>
          <div className="text-sm">
            <p className="font-bold text-amber-900">Founding Singer — Pro access free until {new Date(user.pro_expires_at).toLocaleDateString()}</p>
            <p className="text-amber-800 mt-0.5">Thank you for joining as a founding member. You have full Pro access at no cost.</p>
          </div>
        </div>
      )}

      {user.is_gifted && !user.founding_artist && user.subscription_tier === 'pro' && user.pro_expires_at && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-300 rounded-lg p-4 mb-4 flex items-start gap-3" data-testid="banner-gifted-singer-dashboard">
          <span className="text-2xl leading-none flex-shrink-0">🎁</span>
          <div className="text-sm">
            <p className="font-bold text-violet-900">Pro access gifted by SingerSearch — active until {new Date(user.pro_expires_at).toLocaleDateString()}</p>
            <p className="text-violet-800 mt-0.5">Enjoy your complimentary Pro features.</p>
          </div>
        </div>
      )}

      {user.admin_approved && !user.approval_seen && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 mb-8 flex items-start gap-3" data-testid="approval-banner">
          <span className="text-2xl leading-none flex-shrink-0">🎉</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-900">Your profile has been approved — you are now visible in search results</p>
          </div>
          <button
            onClick={async () => {
              try {
                await fetch("/api/singer/approval-seen", { method: "PUT", credentials: "include" });
                await refreshUser();
              } catch (err) { /* silent */ }
            }}
            className="text-emerald-700 hover:text-emerald-900 text-sm font-medium px-3 py-1 rounded hover:bg-emerald-100 transition-colors flex-shrink-0"
            data-testid="button-dismiss-approval"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
