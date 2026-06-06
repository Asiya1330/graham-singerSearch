import React, { useState } from "react";

import {
  Search,
  Calendar,
  MapPin,
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
  Users
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import RepertoireAutocomplete, { VOICE_TYPE_DB_TO_LABEL, CATEGORY_DB_TO_PERFTYPE } from "./RepertoireAutocomplete";
import { useCityStateAutofill } from "./hooks/useCityStateAutofill";

function SearchForm({ isPro, onSearch, onNavigate }) {
  const [filters, setFilters] = useState({
    voiceType: "",
    startDate: "",
    endDate: "",
    emergencyMode: false,
    roleOrWork: "",
    composer: "",
    language: "",
    experienceLevel: "any",
    hasPerformed: false,
    recency: "any",
    distance: "any",
    city: "",
    state: "",
    travelPref: "any",
    unionStatus: "any",
    represented: "any",
    performanceTypes: []
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const { handleCityChange } = useCityStateAutofill(setFilters);

  const togglePerformanceType = (type) => {
    setFilters(prev => {
      const current = prev.performanceTypes || [];
      const next = current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type];
      return { ...prev, performanceTypes: next };
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 max-w-5xl mx-auto w-full">
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Find Available Singers
        </h2>
        <p className="text-sm text-slate-500 mt-1">Search singers who already know the role or work you need.</p>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
           <div className="md:col-span-4 space-y-4">
               <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Talent Criteria</h3>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Voice Type</label>
                  <select
                    className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3 bg-white"
                    value={filters.voiceType}
                    onChange={(e) => updateFilter("voiceType", e.target.value)}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Performance Type</label>
                  <div className="flex flex-wrap gap-2">
                    {["Opera", "Orchestra", "Chorus", "Other"].map(type => (
                      <label key={type} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                        (filters.performanceTypes || []).includes(type)
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`} data-testid={`checkbox-performance-${type.toLowerCase()}`}>
                        <input
                          type="checkbox"
                          checked={(filters.performanceTypes || []).includes(type)}
                          onChange={() => togglePerformanceType(type)}
                          className="rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
               </div>
               <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Role or Work Title</label>
                     <RepertoireAutocomplete
                       value={filters.roleOrWork}
                       onChange={(v) => updateFilter("roleOrWork", v)}
                       onSelect={(item) => {
                         setFilters((prev) => {
                           const next = { ...prev, roleOrWork: item.part_name };
                           if (item.composer) next.composer = item.composer;
                           const mappedVoice = VOICE_TYPE_DB_TO_LABEL[item.voice_type_primary];
                           if (mappedVoice) next.voiceType = mappedVoice;
                           const mappedPerf = CATEGORY_DB_TO_PERFTYPE[item.category];
                           if (mappedPerf) {
                             const current = prev.performanceTypes || [];
                             if (!current.includes(mappedPerf)) {
                               next.performanceTypes = [...current, mappedPerf];
                             }
                           }
                           return next;
                         });
                       }}
                       placeholder="e.g. Don Giovanni"
                       inputClassName="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border pl-10 pr-3"
                       testId="input-role-or-work"
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
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                      <input
                        type="date"
                        className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3"
                        value={filters.endDate}
                        onChange={(e) => updateFilter("endDate", e.target.value)}
                      />
                  </div>
              </div>
           </div>

           <div className="md:col-span-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</h3>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Production City</label>
                  <input
                     type="text"
                     placeholder="City"
                     className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3"
                     value={filters.city}
                     onChange={(e) => handleCityChange(e.target.value)}
                  />
              </div>
              <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Search Radius</label>
                    <div className="relative">
                        <select 
                          disabled={!isPro}
                          className={`w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 border px-3 bg-white ${!isPro ? 'opacity-70' : ''}`}
                        >
                          <option value="50">Local (50 mi)</option>
                          <option value="200" disabled={!isPro}>Regional (200 mi) {isPro ? '' : '🔒'}</option>
                          <option value="any" disabled={!isPro}>National (Fly-in) {isPro ? '' : '🔒'}</option>
                        </select>
                        {!isPro && (
                          <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none">
                              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">Pro Only</span>
                          </div>
                        )}
                    </div>
              </div>
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
                          <option value="3-5">3+ Performances</option>
                          <option value="6-10">6+ Performances</option>
                          <option value="10+">10+ Performances</option>
                       </select>
                  </div>
               </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => onSearch(filters)}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            data-testid="button-search-singers"
          >
            <Search className="w-5 h-5" />
            Search Available Singers
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchForm;