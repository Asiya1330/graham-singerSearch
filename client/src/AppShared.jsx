import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown, ChevronUp, Filter, Info, Mail, MapPin, Search, Star, Users, X, Zap } from "lucide-react";

export function AppFooter() {
  const ctx = (() => { try { return useAppContext(); } catch { return null; } })();
  const navTo = (path, view) => (e) => {
    if (e) e.preventDefault();
    if (ctx?.setView) ctx.setView(view);
  };
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white" data-testid="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Singer Search</span>
          <span className="text-slate-300">·</span>
          <a href="mailto:support@singersearch.com" className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors" data-testid="link-footer-support">
            <Mail className="w-3.5 h-3.5" /> support@singersearch.com
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/terms" onClick={navTo("/terms", "terms")} className="hover:text-slate-700 transition-colors" data-testid="link-footer-terms">Terms of Service</a>
          <a href="/privacy" onClick={navTo("/privacy", "privacy")} className="hover:text-slate-700 transition-colors" data-testid="link-footer-privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

import RepertoireAutocomplete, { VOICE_TYPE_DB_TO_LABEL } from "./RepertoireAutocomplete";
import { useCityStateAutofill } from "./hooks/useCityStateAutofill";
import { useAppContext } from "./AppContext";

export const US_STATES = [
  { code: "", name: "Select state" },
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export function formatMonthYear(value) {
  if (!value) return "";
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{1,2})/);
  if (m) {
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    if (month >= 1 && month <= 12) return `${MONTH_NAMES[month - 1]} ${year}`;
  }
  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) return yearOnly[1];
  return s;
}

export function AlertBanner({ alert }) {
  if (!alert) return null;

  const styles = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    error: "bg-red-50 text-red-800 border-red-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const cls = styles[alert.type] || styles.info;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${cls} border rounded-xl px-4 py-3 mb-6 text-sm font-medium`}
    >
      {alert.message}
    </motion.div>
  );
}

export function WelcomePanel({ userType, onDismiss, revealLimit, revealsUsed }) {
  const isSinger = userType === "singer";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#F9FAFB] border border-slate-200 rounded-xl p-6 mb-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <h3 className="font-semibold text-slate-900">Welcome to Singer Search</h3>
        </div>
        <button onClick={onDismiss} className="text-slate-500 hover:text-slate-700" type="button">
          <X className="w-4 h-4" />
        </button>
      </div>

      {isSinger ? (
        <div className="text-sm text-slate-700 space-y-2">
          <p className="font-semibold">When your profile appears in search:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Your profile must be approved by our team</li>
            <li>You must have active availability dates set</li>
            <li>Your subscription must be active or in trial</li>
          </ul>

          <p className="mt-3 font-semibold">When organizations contact you:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>You will be notified when someone views your profile</li>
            <li>You will be notified when someone reveals your contact information</li>
            <li>Organizations have monthly limits on contact reveals</li>
          </ul>
        </div>
      ) : (
        <div className="text-sm text-slate-700 space-y-2">
          <p className="font-semibold">How search works:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Only approved singers with active availability appear in results</li>
            <li>Results are filtered by voice type, dates, and location</li>
            <li>You can reveal contact info when you are ready to reach out</li>
          </ul>

          <p className="mt-3 font-semibold">Contact reveals:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>You have {revealLimit} contact reveals per month</li>
            <li>Singers are notified when you reveal their contact information</li>
            <li>All reveals are tracked for accountability</li>
            <li>
              You have used {revealsUsed} of {revealLimit} this month
            </li>
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export function UpgradeModal({ onClose, onUpgrade }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative z-10 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
           <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
             <Star className="w-6 h-6 text-yellow-300" fill="currentColor" />
           </div>
           <h3 className="text-2xl font-bold">Upgrade to Pro</h3>
           <p className="text-blue-100 mt-2">Unlock Urgent Mode and priority features.</p>
        </div>
        <div className="p-6 space-y-4">
           <div className="space-y-3">
              <div className="flex items-start gap-3">
                 <Zap className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                 <div>
                    <h4 className="font-bold text-slate-900">Urgent Search</h4>
                    <p className="text-sm text-slate-500">Find singers for last-minute cancellations.</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                 <div>
                    <h4 className="font-bold text-slate-900">National Radius</h4>
                    <p className="text-sm text-slate-500">Search for talent across the country.</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <Users className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                 <div>
                    <h4 className="font-bold text-slate-900">More Contacts</h4>
                    <p className="text-sm text-slate-500">Reveal up to 50 contacts per month.</p>
                 </div>
              </div>
           </div>
           
           <button 
             onClick={onUpgrade}
             className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 mt-4"
           >
             Get Pro Access - $79/mo
           </button>
           <button 
             onClick={onClose}
             className="w-full text-slate-500 font-medium py-2 hover:text-slate-700"
           >
             Maybe Later
           </button>
        </div>
      </motion.div>
    </div>
  );
}

export function AutocompleteInput({ value, onChange, suggestions, placeholder, icon: Icon, inputClassName }) {
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 8);

  const showDropdown = focused && value.length > 0 && filtered.length > 0;

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {Icon && <Icon className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />}
      <input
        type="text"
        placeholder={placeholder}
        className={inputClassName}
        value={value}
        onChange={(e) => { onChange(e.target.value); setFocused(true); }}
        onFocus={() => setFocused(true)}
        autoComplete="off"
      />
      {showDropdown && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((item) => (
            <li
              key={item}
              className="px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
              onMouseDown={(e) => { e.preventDefault(); onChange(item); setFocused(false); }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const BLANK_FILTERS = {
  voiceType: "",
  startDate: "",
  endDate: "",
  emergencyMode: false,
  workTitle: "",
  role: "",
  composer: "",
  language: "",
  experienceLevel: "any",
  hasPerformed: false,
  recency: "any",
  distance: "any",
  city: "",
  state: "",
  radiusMiles: "50",
  travelPref: "any",
  unionStatus: "any",
  represented: "any",
  managedOnly: "any",
  _selectedWork: ""
};

export function SearchForm({ isPro, onSearch, onClear, onNavigate, isSearching, initialFilters }) {
  const [filters, setFilters] = useState(initialFilters ?? BLANK_FILTERS);
  const [options, setOptions] = useState({ cities: [], roles: [] });
  const { handleCityChange } = useCityStateAutofill(setFilters);

  useEffect(() => {
    fetch("/api/search/options")
      .then(r => r.json())
      .then(data => setOptions(data))
      .catch(() => {});
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters(BLANK_FILTERS);
    if (onClear) onClear();
  };

  const hasActiveFilters = filters.voiceType || filters.startDate || filters.endDate ||
    filters.workTitle || filters.role || filters.composer || filters.city || filters.language ||
    (filters.experienceLevel && filters.experienceLevel !== "any") || filters.emergencyMode;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 max-w-5xl mx-auto w-full">
      <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 rounded-t-xl overflow-hidden">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Find Available Singers
        </h2>
        <p className="text-sm text-slate-500 mt-1">Search singers who already know the role or work you need.</p>
      </div>
      
      <div className="p-4 sm:p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           <div className="md:col-span-4 space-y-4">
               <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Talent Criteria</h3>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Voice Type</label>
                  <select
                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3 bg-white"
                    value={filters.voiceType}
                    onChange={(e) => updateFilter("voiceType", e.target.value)}
                    data-testid="select-voice-type"
                  >
                    <option value="">Any Voice Type</option>
                    <option value="Soprano">Soprano</option>
                    <option value="Mezzo-Soprano">Mezzo-Soprano</option>
                    <option value="Contralto">Contralto</option>
                    <option value="Countertenor">Countertenor</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Baritone">Baritone</option>
                    <option value="Bass">Bass</option>
                  </select>
               </div>
               <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Work Title</label>
                     <RepertoireAutocomplete
                       value={filters.workTitle}
                       onChange={(val) => {
                         updateFilter("workTitle", val);
                         if (val !== filters._selectedWork) updateFilter("_selectedWork", "");
                       }}
                       onSelect={(item) => {
                         setFilters((prev) => ({
                           ...prev,
                           workTitle: item.work_title,
                           _selectedWork: item.work_title,
                         }));
                       }}
                       placeholder="e.g. Don Giovanni, Carmina Burana"
                       inputClassName="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border pl-10 pr-3"
                       testId="input-work-title"
                       searchType="work"
                     />
              </div>
              <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                     <RepertoireAutocomplete
                       value={filters.role}
                       onChange={(val) => updateFilter("role", val)}
                       onSelect={(item) => {
                         setFilters((prev) => {
                           const next = { ...prev, role: item.part_name };
                           if (item.composer) next.composer = item.composer;
                           const mappedVoice = VOICE_TYPE_DB_TO_LABEL[item.voice_type_primary];
                           if (mappedVoice && !prev.voiceType) next.voiceType = mappedVoice;
                           return next;
                         });
                       }}
                       placeholder="e.g. Leporello, Violetta"
                       inputClassName="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border pl-10 pr-3"
                       testId="input-role"
                       searchType="role"
                       filterByWork={filters._selectedWork || ""}
                     />
              </div>
              <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Composer</label>
                     <input
                       type="text"
                       placeholder="e.g. Mozart, Verdi"
                       className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3"
                       value={filters.composer}
                       onChange={(e) => updateFilter("composer", e.target.value)}
                       data-testid="input-composer"
                     />
              </div>
           </div>

           <div className="md:col-span-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Availability</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3"
                        value={filters.startDate}
                        onChange={(e) => updateFilter("startDate", e.target.value)}
                        data-testid="input-start-date"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                      <input
                        type="date"
                        className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3"
                        value={filters.endDate}
                        onChange={(e) => updateFilter("endDate", e.target.value)}
                        data-testid="input-end-date"
                      />
                  </div>
              </div>
           </div>

           <div className="md:col-span-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</h3>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Singer's City</label>
                  <AutocompleteInput
                    value={filters.city}
                    onChange={(val) => handleCityChange(val)}
                    suggestions={options.cities}
                    placeholder="e.g. New York"
                    inputClassName="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <select
                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3 bg-white"
                    value={filters.state || ""}
                    onChange={(e) => updateFilter("state", e.target.value)}
                    data-testid="select-state"
                  >
                    <option value="">Select state</option>
                    {US_STATES.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Within</label>
                  <select
                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3 bg-white"
                    value={filters.radiusMiles || "50"}
                    onChange={(e) => updateFilter("radiusMiles", e.target.value)}
                    data-testid="select-radius-miles"
                  >
                    <option value="25">25 miles</option>
                    <option value="50">50 miles</option>
                    <option value="100">100 miles</option>
                    <option value="250">250 miles</option>
                    <option value="any">Any distance</option>
                  </select>
              </div>
              {((filters.city && !filters.state) || (!filters.city && filters.state)) && (
                <p className="text-xs text-red-600" data-testid="text-location-validation">
                  Please enter both city and state to search by location.
                </p>
              )}
           </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                    <select
                       className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3 bg-white"
                       value={filters.language}
                       onChange={(e) => updateFilter("language", e.target.value)}
                    >
                      <option value="">Any Language</option>
                      <option value="Italian">Italian</option>
                      <option value="German">German</option>
                      <option value="French">French</option>
                      <option value="English">English</option>
                      <option value="Latin">Latin</option>
                    </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
                       <select 
                         className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3 bg-white"
                         value={filters.experienceLevel}
                         onChange={(e) => updateFilter("experienceLevel", e.target.value)}
                         data-testid="select-experience-level"
                       >
                          <option value="any">Any Experience</option>
                          <option value="1-2">1-2 Performances</option>
                          <option value="3-5">3+ Performances</option>
                          <option value="6-10">6+ Performances</option>
                          <option value="10+">10+ Performances</option>
                       </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Representation</label>
                       <select 
                         className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3 bg-white"
                         value={filters.managedOnly}
                         onChange={(e) => updateFilter("managedOnly", e.target.value)}
                         data-testid="select-representation"
                       >
                          <option value="any">Any</option>
                          <option value="managed">Managed Only</option>
                          <option value="unmanaged">Unmanaged Only</option>
                       </select>
                  </div>
               </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end items-center">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isSearching}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 font-medium transition-all text-sm"
              data-testid="button-clear-search"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={() => { document.activeElement?.blur(); onSearch(filters); }}
            disabled={isSearching}
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            data-testid="button-search-singers"
          >
            {isSearching ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Searching…
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Available Singers
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

