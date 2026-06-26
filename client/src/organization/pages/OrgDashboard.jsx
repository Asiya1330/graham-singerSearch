import React from "react";
import { AnimatePresence } from "framer-motion";
import { useAppContext } from "../../AppContext";
import { OrgNav } from "../../AppNav";
import { AlertBanner, WelcomePanel, UpgradeModal } from "../../AppShared";
import { OrgStatusBanners } from "../components/dashboard/OrgStatusBanners";
import { SearchTab } from "../components/dashboard/SearchTab";
import { ShortlistTab } from "../components/dashboard/ShortlistTab";
import { ContactsTab } from "../components/dashboard/ContactsTab";

export function OrgDashboard({
  setShowUpgradeModal, setShowWelcome, showUpgradeModal, showWelcome,
  performSearch, clearSearch, viewProfile, revealContact, removeFilterAndSearch,
  FILTER_DISPLAY_NAMES, searchFormKey, searchResults, hasSearched, isSearching,
  cityFallbackBanner, noResultsDiagnostic, submittedFilters,
  shortlistSingers, shortlistLoading, loadShortlist, toggleShortlist,
}) {
  const { currentUser, setView, alert, orgTab } = useAppContext();
  const user = currentUser?.data || {};

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <OrgNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence>
          {showWelcome && (user.login_count || 0) <= 2 && (
            <WelcomePanel
              userType="organization"
              onDismiss={() => setShowWelcome(false)}
              revealLimit={user.contact_reveal_limit}
              revealsUsed={user.contact_reveals_used_this_month}
            />
          )}
          {alert && <AlertBanner alert={alert} />}
          {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onUpgrade={() => { setShowUpgradeModal(false); setView("pricing"); }} />}
        </AnimatePresence>

        <OrgStatusBanners />

        {orgTab === 'search' && (
          <SearchTab
            performSearch={performSearch}
            clearSearch={clearSearch}
            isSearching={isSearching}
            submittedFilters={submittedFilters}
            searchFormKey={searchFormKey}
            searchResults={searchResults}
            hasSearched={hasSearched}
            cityFallbackBanner={cityFallbackBanner}
            noResultsDiagnostic={noResultsDiagnostic}
            removeFilterAndSearch={removeFilterAndSearch}
            FILTER_DISPLAY_NAMES={FILTER_DISPLAY_NAMES}
            viewProfile={viewProfile}
            revealContact={revealContact}
            toggleShortlist={toggleShortlist}
          />
        )}

        {orgTab === 'shortlist' && (
          <ShortlistTab
            shortlistLoading={shortlistLoading}
            shortlistSingers={shortlistSingers}
            loadShortlist={loadShortlist}
            viewProfile={viewProfile}
            revealContact={revealContact}
            submittedFilters={submittedFilters}
            toggleShortlist={toggleShortlist}
          />
        )}

        {orgTab === 'contacts' && (
          <ContactsTab viewProfile={viewProfile} />
        )}
      </div>
    </div>
  );
}
