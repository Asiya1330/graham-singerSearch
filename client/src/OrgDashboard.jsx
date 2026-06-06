import React, { useState, useEffect } from "react";
import { BarChart2, CheckCircle, ClipboardList, Heart, MapPin, Search, Users, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import singerSearchLogo from "@assets/Singer_Search_Logo_May_2026_1777734809747.png";
import SingerCard from "./SingerCard";
import { useAppContext } from "./AppContext";
import { AlertBanner, WelcomePanel, UpgradeModal, SearchForm, AppFooter } from "./AppShared";

export function OrgDashboard({
  setSearchResults, setShowUpgradeModal, setShowWelcome, showUpgradeModal, showWelcome,
  performSearch, clearSearch, viewProfile, revealContact, removeFilterAndSearch,
  FILTER_DISPLAY_NAMES, searchFormKey, searchResults, hasSearched, isSearching,
  cityFallbackBanner, noResultsDiagnostic, submittedFilters,
  shortlistedIds, shortlistSingers, shortlistLoading, loadShortlist, toggleShortlist
}) {
  const { currentUser, setCurrentUser, setView, alert } = useAppContext();

    const user = currentUser.data;
    const isPro = user.subscription_tier === 'pro';
    const [orgView, setOrgView] = React.useState('search');
    const [revealedSingers, setRevealedSingers] = React.useState([]);
    const [revealedLoading, setRevealedLoading] = React.useState(false);
    const [feedbackForm, setFeedbackForm] = React.useState(null);
    const [feedbackSubmitting, setFeedbackSubmitting] = React.useState(false);
    const [feedbackMsg, setFeedbackMsg] = React.useState(null);

    const handleShortlistTab = () => {
      setOrgView('shortlist');
      loadShortlist();
    };

    const loadRevealedSingers = async () => {
      setRevealedLoading(true);
      try {
        const res = await fetch("/api/org/revealed-singers", { credentials: "include" });
        const data = await res.json();
        if (res.ok) setRevealedSingers(data);
      } catch (err) {}
      setRevealedLoading(false);
    };

    const handleContactsTab = () => {
      setOrgView('contacts');
      loadRevealedSingers();
    };

    const handleFeedbackSubmit = async () => {
      if (!feedbackForm) return;
      setFeedbackSubmitting(true);
      setFeedbackMsg(null);
      try {
        const res = await fetch("/api/feedback/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            singer_id: feedbackForm.singer.id,
            role_name: feedbackForm.role_name,
            engagement_date: feedbackForm.engagement_date,
            was_prepared: feedbackForm.was_prepared,
            was_professional: feedbackForm.was_professional,
            was_accurate: feedbackForm.was_accurate,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFeedbackMsg({ type: "error", text: data.message || "Failed to submit feedback" });
        } else {
          setFeedbackMsg({ type: "success", text: "Feedback submitted. Thank you!" });
          setTimeout(() => { setFeedbackForm(null); setFeedbackMsg(null); loadRevealedSingers(); }, 1800);
        }
      } catch (err) {
        setFeedbackMsg({ type: "error", text: "Failed to submit feedback" });
      }
      setFeedbackSubmitting(false);
    };

    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <nav className="bg-[#121212] border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center pr-6">
                  <img src={singerSearchLogo} alt="SingerSearch" className="h-10 object-contain brightness-0 invert" />
                </div>
                <div className="hidden sm:flex sm:space-x-2">
                  <span
                    className={`${orgView === 'search' ? 'border-[#3B82F6] text-white' : 'border-transparent text-white/40 hover:text-white/80'} inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium cursor-pointer transition-colors`}
                    onClick={() => setOrgView('search')}
                  >
                    Search
                  </span>
                  <span
                    className={`${orgView === 'contacts' ? 'border-[#3B82F6] text-white' : 'border-transparent text-white/40 hover:text-white/80'} inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium cursor-pointer gap-1.5 transition-colors`}
                    onClick={handleContactsTab}
                    data-testid="nav-contacts"
                  >
                    <ClipboardList className="w-4 h-4" /> Contacts
                  </span>
                  <span
                    className={`${orgView === 'shortlist' ? 'border-[#3B82F6] text-white' : 'border-transparent text-white/40 hover:text-white/80'} inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium cursor-pointer gap-1.5 transition-colors`}
                    onClick={handleShortlistTab}
                    data-testid="nav-shortlist"
                  >
                    <Heart className={`w-4 h-4 ${shortlistedIds.size > 0 ? 'fill-current' : ''}`} /> My Shortlist
                    {shortlistedIds.size > 0 && (
                      <span className="ml-0.5 text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded-full" data-testid="badge-shortlist-count">
                        {shortlistedIds.size}
                      </span>
                    )}
                  </span>
                  <button 
                    onClick={() => isPro ? setView("emergencySearch") : setShowUpgradeModal(true)}
                    className="text-white/40 hover:text-red-400 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    Urgent
                  </button>
                  <span className="text-white/40 hover:text-white/80 inline-flex items-center px-3 pt-1 border-b-2 border-transparent text-sm font-medium cursor-pointer transition-colors" onClick={() => setView("orgSettings")}>
                    Settings
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isPro && (
                    <button 
                        onClick={() => setView("pricing")}
                        className="text-xs font-semibold text-white bg-[#3B82F6] hover:bg-blue-500 px-3 py-1.5 rounded transition-colors"
                    >
                        Upgrade to Pro
                    </button>
                )}
                <div className="flex items-center">
                    <span className="text-white/50 text-sm font-medium mr-4 flex items-center gap-2">
                        {user.organization_name}
                        {user.verified && <CheckCircle className="w-4 h-4 text-blue-400" title="Verified Organization" />}
                    </span>
                    <button
                      onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                        setCurrentUser(null);
                        setSearchResults([]);
                        setView("landing");
                      }}
                      className="text-white/30 hover:text-white/60 text-sm transition-colors"
                    >
                      Sign out
                    </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

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

          {orgView === 'search' && (
            <>
              {/* Emergency Mode Entry Point - Primary CTA */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-6 mb-8 flex items-center justify-between shadow-sm"
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
                    className="bg-[#EF4444] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-[#DC2626] transition-colors flex items-center gap-2 whitespace-nowrap"
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

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                              <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                              <p className="text-blue-900 font-bold text-lg">
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
          )}

          {orgView === 'shortlist' && (
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
                  <button onClick={() => setOrgView('search')} className="mt-4 text-blue-600 hover:underline text-sm" data-testid="button-shortlist-go-search">
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
          )}

          {orgView === 'contacts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Contact History</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Singers whose contact details you have revealed</p>
                </div>
              </div>

              {revealedLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-slate-500 mt-3">Loading contacts…</p>
                </div>
              ) : revealedSingers.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">No contacts yet</h3>
                  <p className="text-sm text-slate-500">Singers you reveal contact details for will appear here.</p>
                  <button onClick={() => setOrgView('search')} className="mt-4 text-blue-600 hover:underline text-sm">Go to Search</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {revealedSingers.map((singer) => (
                    <div key={singer.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm" data-testid={`contact-row-${singer.id}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {singer.first_name?.[0]}{singer.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{singer.first_name} {singer.last_name}</p>
                          <p className="text-sm text-slate-500">{singer.primary_voice_type} · {singer.city}{singer.state ? `, ${singer.state}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => viewProfile(singer)}
                          className="text-sm text-blue-600 hover:underline"
                          data-testid={`button-view-contact-${singer.id}`}
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => setFeedbackForm({ singer, role_name: '', engagement_date: '', was_prepared: false, was_professional: false, was_accurate: false })}
                          className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                          data-testid={`button-rate-${singer.id}`}
                        >
                          <BarChart2 className="w-3.5 h-3.5" /> Rate Engagement
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rate Engagement Modal */}
              {feedbackForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Rate Engagement</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {feedbackForm.singer.first_name} {feedbackForm.singer.last_name} · {feedbackForm.singer.primary_voice_type}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role / Production</label>
                        <input
                          type="text"
                          placeholder="e.g. Violetta in La Traviata"
                          value={feedbackForm.role_name}
                          onChange={e => setFeedbackForm(f => ({ ...f, role_name: e.target.value }))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                          data-testid="input-feedback-role"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Engagement Date</label>
                        <input
                          type="date"
                          value={feedbackForm.engagement_date}
                          onChange={e => setFeedbackForm(f => ({ ...f, engagement_date: e.target.value }))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                          data-testid="input-feedback-date"
                        />
                      </div>
                      <div className="space-y-2 pt-1">
                        <p className="text-sm font-medium text-slate-700">How would you rate this singer?</p>
                        {[
                          { key: 'was_prepared', label: 'Arrived prepared (knew the role/music)' },
                          { key: 'was_professional', label: 'Professional and reliable' },
                          { key: 'was_accurate', label: 'Accurately represented themselves' },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={feedbackForm[key]}
                              onChange={e => setFeedbackForm(f => ({ ...f, [key]: e.target.checked }))}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600"
                              data-testid={`checkbox-${key}`}
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
                          </label>
                        ))}
                      </div>

                      {feedbackMsg && (
                        <div className={`text-sm px-3 py-2 rounded-lg ${feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {feedbackMsg.text}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => { setFeedbackForm(null); setFeedbackMsg(null); }}
                        className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleFeedbackSubmit}
                        disabled={feedbackSubmitting || !feedbackForm.role_name || !feedbackForm.engagement_date}
                        className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="button-submit-feedback"
                      >
                        {feedbackSubmitting ? 'Submitting…' : 'Submit Feedback'}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
}
