import React from "react";
import { useOrgUser } from "../../hooks/useOrgUser";

export function OrgStatusBanners() {
  const { user } = useOrgUser();

  return (
    <>
      {user.founding_org && user.subscription_tier === 'pro' && user.pro_expires_at && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-lg p-4 mb-4 flex items-start gap-3" data-testid="banner-founding-org-dashboard">
          <span className="text-2xl leading-none flex-shrink-0">🌟</span>
          <div className="text-sm">
            <p className="font-bold text-amber-900">Founding Organization — Pro access free until {new Date(user.pro_expires_at).toLocaleDateString()}</p>
            <p className="text-amber-800 mt-0.5">Thank you for joining as a founding member. You have full Pro access at no cost.</p>
          </div>
        </div>
      )}

      {user.is_gifted && !user.founding_org && user.subscription_tier === 'pro' && user.pro_expires_at && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-300 rounded-lg p-4 mb-4 flex items-start gap-3" data-testid="banner-gifted-org-dashboard">
          <span className="text-2xl leading-none flex-shrink-0">🎁</span>
          <div className="text-sm">
            <p className="font-bold text-violet-900">Pro access gifted by SingerSearch — active until {new Date(user.pro_expires_at).toLocaleDateString()}</p>
            <p className="text-violet-800 mt-0.5">Enjoy your complimentary Pro features.</p>
          </div>
        </div>
      )}
    </>
  );
}
