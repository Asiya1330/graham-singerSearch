import React, { useEffect } from "react";
import { Heart } from "lucide-react";
import SingerCard from "../../../singer/components/SingerCard";
import { useOrgUser } from "../../hooks/useOrgUser";

export function ShortlistTab({
  shortlistLoading, shortlistSingers, loadShortlist,
  viewProfile, revealContact, submittedFilters, toggleShortlist,
}) {
  const { user, isPro, setView, setOrgTab, shortlistedIds } = useOrgUser();

  // Load shortlist data whenever this tab mounts (i.e. when selected).
  useEffect(() => {
    loadShortlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6" data-testid="view-shortlist">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" /> My Shortlist
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Singers you've saved while searching</p>
        </div>
      </div>

      {shortlistLoading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 mt-3">Loading shortlist…</p>
        </div>
      ) : shortlistSingers.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50" data-testid="empty-shortlist">
          <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No singers shortlisted yet</h3>
          <p className="text-sm text-slate-500">Save singers while searching to see them here.</p>
          <button onClick={() => setOrgTab('search')} className="mt-4 text-blue-600 hover:underline text-sm" data-testid="button-shortlist-go-search">
            Go to Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {shortlistSingers.map((singer) => (
            <SingerCard
              key={singer.id}
              singer={singer}
              onViewProfile={viewProfile}
              onContact={revealContact}
              onUpgrade={() => setView("pricing")}
              submittedFilters={submittedFilters}
              orgIsPro={isPro}
              revealLimit={user.contact_reveal_limit ?? 3}
              revealsUsed={user.contact_reveals_used_this_month ?? 0}
              isShortlisted={true}
              onToggleShortlist={toggleShortlist}
              shortlistMode={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
