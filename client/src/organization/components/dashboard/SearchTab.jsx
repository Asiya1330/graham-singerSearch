import React from "react";
import { MapPin, Search, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import SingerCard from "../../../singer/components/SingerCard";
import { SearchForm } from "../../../AppShared";
import { useOrgUser } from "../../hooks/useOrgUser";

export function SearchTab({
  performSearch, clearSearch, isSearching, submittedFilters, searchFormKey,
  searchResults, cityFallbackBanner, noResultsDiagnostic, removeFilterAndSearch,
  FILTER_DISPLAY_NAMES, viewProfile, revealContact, toggleShortlist, hasSearched,
}) {
  const { user, isPro, setView, shortlistedIds, setShowUpgradeModal } = useOrgUser();

  return (
    <>
      {/* Emergency Mode Entry Point - Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
            <Zap className="w-6 h-6 text-red-600" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
              Short-Notice Engagement?
            </h3>
            <p className="text-red-800/80 mt-1 max-w-xl">
              Find verified professionals for immediate placement. Ideal for role replacements, concert soloists, pit-singing, or side-stage support.
            </p>
          </div>
        </div>
        <button
          onClick={() => isPro ? setView("emergencySearch") : setShowUpgradeModal(true)}
          className="bg-[#EF4444] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-[#DC2626] transition-colors flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto flex-shrink-0"
        >
          <Zap className="w-4 h-4" fill="currentColor" />
          Find Short-Notice Engagements
        </button>
      </motion.div>

      <SearchForm key={searchFormKey} isPro={isPro} onSearch={performSearch} onClear={clearSearch} onNavigate={setView} isSearching={isSearching} initialFilters={submittedFilters} />

      <div className="space-y-6 mt-4">
        {searchResults.length > 0 && (
          <>
            {cityFallbackBanner && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-amber-800 font-medium text-sm">{cityFallbackBanner}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-blue-900 font-bold text-lg break-words">
                    {searchResults.length} singers match <span className="text-blue-700">"{submittedFilters.role || submittedFilters.workTitle || submittedFilters.voiceType || 'your criteria'}"</span>
                  </p>
                  <p className="text-blue-700 text-sm">
                    {submittedFilters.city && !cityFallbackBanner ? `In ${submittedFilters.city}` : "Available singers"}
                  </p>
                </div>
              </div>
              {submittedFilters.emergencyMode && (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 animate-pulse flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Urgent Mode Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {searchResults.map((singer) => (
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
                  isShortlisted={shortlistedIds.has(singer.id)}
                  onToggleShortlist={toggleShortlist}
                />
              ))}
            </div>
          </>
        )}
        {searchResults.length === 0 && hasSearched && (
          <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 py-14 px-8 text-center" data-testid="empty-search-results">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No singers found matching your search.</h3>
            {noResultsDiagnostic ? (
              <div className="mt-5 flex flex-col items-center gap-3">
                <button
                  onClick={removeFilterAndSearch}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  data-testid="button-remove-filter"
                >
                  Try removing the {FILTER_DISPLAY_NAMES[noResultsDiagnostic.mostRestrictiveFilter] || noResultsDiagnostic.mostRestrictiveFilter} filter
                </button>
                <p className="text-sm text-slate-500 max-w-sm">{noResultsDiagnostic.suggestion}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
