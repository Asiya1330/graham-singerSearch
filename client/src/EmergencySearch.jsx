import React, { useState, useEffect, useRef } from "react";
import { ArrowUpRight, Clock, MapPin, Phone, Search, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "./AppContext";
import { UpgradeModal, US_STATES } from "./AppShared";
import { useCityStateAutofill } from "./hooks/useCityStateAutofill";
import RepertoireAutocomplete, { VOICE_TYPE_DB_TO_LABEL } from "./RepertoireAutocomplete";
import { getErrorMessageFromBody, API_ERRORS } from "./lib/api";

export function EmergencySearch({ showAlert, revealContact, showUpgradeModal, setShowUpgradeModal }) {
  const { currentUser, setView } = useAppContext();
  const [revealingIds, setRevealingIds] = useState(() => new Set());
  const inFlightRevealsRef = useRef(new Set());

    const URGENCY_OPTIONS = [
      { value: "today", label: "Today", subtitle: "Anytime today" },
      { value: "tomorrow", label: "Tomorrow", subtitle: "Anytime tomorrow" },
      { value: "this_week", label: "This Week", subtitle: "Anytime in the next 7 days" },
      { value: "two_weeks", label: "Within 2 Weeks", subtitle: "Anytime in the next 14 days" },
    ];

    const [filters, setFilters] = useState({
      // Urgency
      dateType: "today",
      leadTime: "24", // 0, 2, 6, 12, 24, 48

      // What you need
      category: "Opera Role", // Opera Role, Concert Work
      roleOrWork: "",
      voiceType: "",
      composer: "",
      language: "Any",

      // Logistics
      city: currentUser?.data?.city || "",
      state: currentUser?.data?.state || "",
      radiusMiles: "50",
      unionStatus: "any",
      represented: "any",
      
      notes: ""
    });
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const { stateAutoFilled, handleCityChange, handleStateChange } = useCityStateAutofill(setFilters);
    const locationIncomplete = (filters.city && !filters.state) || (!filters.city && filters.state);

    const handleSearch = async () => {
      if (locationIncomplete) {
        showAlert("Please enter both city and state to search by location.", "error");
        return;
      }
      try {
        const params = new URLSearchParams();
        if (filters.voiceType) params.set("voiceType", filters.voiceType);
        if (filters.roleOrWork) params.set("roleOrWork", filters.roleOrWork);
        if (filters.composer) params.set("composer", filters.composer);
        if (filters.language && filters.language !== "Any") params.set("language", filters.language);
        if (filters.city) params.set("city", filters.city);
        if (filters.state) params.set("state", filters.state);
        if (filters.radiusMiles) params.set("radius_miles", filters.radiusMiles);
        if (filters.dateType) params.set("urgency_window", filters.dateType);
        params.set("emergencyMode", "true");
        
        const res = await fetch(`/api/search?${params.toString()}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) {
          showAlert(getErrorMessageFromBody(data, "SEARCH_FAILED"), "error");
          return;
        }
        
        const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
        setResults(list);
        setHasSearched(true);
      } catch (err) {
        showAlert(err.message || API_ERRORS.SEARCH_FAILED.message, "error");
      }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-900 to-red-800 text-white shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm animate-pulse">
                                <Zap className="w-5 h-5 text-yellow-400" fill="currentColor" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    Urgent Mode
                                    <span className="bg-red-500/50 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-red-400/50">Live</span>
                                </h1>
                            </div>
                        </div>
                        <button 
                            onClick={() => setView("orgDashboard")}
                            className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all"
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Search Form - centered */}
                    <div className="max-w-2xl mx-auto w-full space-y-6">
                        
                        {/* 1. Urgency */}
                        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                            <div className="bg-red-50/50 px-4 py-3 border-b border-red-100 flex items-center gap-2">
                                <div className="bg-red-100 p-1.5 rounded-md text-red-700 font-bold text-xs">01</div>
                                <h3 className="font-bold text-red-900 text-sm uppercase tracking-wide">Urgency Level</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">When do you need them?</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {URGENCY_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setFilters({...filters, dateType: opt.value})}
                                                className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                                                    filters.dateType === opt.value
                                                    ? "bg-red-50 border-red-200 text-red-700 shadow-sm ring-1 ring-red-200"
                                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                                }`}
                                                data-testid={`button-urgency-${opt.value}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500" data-testid="text-urgency-subtitle">
                                        {(URGENCY_OPTIONS.find(o => o.value === filters.dateType) || URGENCY_OPTIONS[0]).subtitle}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Requirements */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                                <div className="bg-slate-200 p-1.5 rounded-md text-slate-700 font-bold text-xs">02</div>
                                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">The Role</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {/* Category Toggle */}
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    {['Opera Role', 'Concert Work'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilters({...filters, category: cat})}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                                                filters.category === cat
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        {filters.category === 'Opera Role' ? 'Role Name' : 'Work Title'} <span className="text-red-500">*</span>
                                    </label>
                                    <RepertoireAutocomplete
                                        value={filters.roleOrWork}
                                        onChange={(val) => setFilters(prev => ({ ...prev, roleOrWork: val }))}
                                        onSelect={(item) => {
                                          setFilters(prev => {
                                            const isWork = filters.category === 'Concert Work';
                                            const next = { ...prev, roleOrWork: isWork ? item.work_title : item.part_name };
                                            if (item.composer && !prev.composer) next.composer = item.composer;
                                            const mappedVoice = VOICE_TYPE_DB_TO_LABEL[item.voice_type_primary];
                                            if (mappedVoice && !prev.voiceType) next.voiceType = mappedVoice;
                                            return next;
                                          });
                                        }}
                                        placeholder={filters.category === 'Opera Role' ? "e.g. Rodolfo" : "e.g. Messiah"}
                                        inputClassName="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500 font-medium"
                                        showIcon={false}
                                        testId="input-emergency-role-or-work"
                                        searchType={filters.category === 'Concert Work' ? 'work' : 'role'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Voice Type</label>
                                    <select 
                                        className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500 text-sm"
                                        value={filters.voiceType}
                                        onChange={(e) => setFilters({...filters, voiceType: e.target.value})}
                                    >
                                        <option value="">Any / Implied by Role</option>
                                        <option value="Soprano">Soprano</option>
                                        <option value="Mezzo-Soprano">Mezzo-Soprano</option>
                                        <option value="Contralto">Contralto</option>
                                        <option value="Countertenor">Countertenor</option>
                                        <option value="Tenor">Tenor</option>
                                        <option value="Baritone">Baritone</option>
                                        <option value="Bass">Bass</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Composer</label>
                                        <input 
                                            type="text" 
                                            className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500 text-sm"
                                            value={filters.composer}
                                            onChange={(e) => setFilters({...filters, composer: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Language</label>
                                        <select 
                                            className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500 text-sm"
                                            value={filters.language}
                                            onChange={(e) => setFilters({...filters, language: e.target.value})}
                                        >
                                            <option value="Any">Any</option>
                                            <option value="Italian">Italian</option>
                                            <option value="German">German</option>
                                            <option value="French">French</option>
                                            <option value="English">English</option>
                                            <option value="Russian">Russian</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* 3. Logistics */}
                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                                <div className="bg-slate-200 p-1.5 rounded-md text-slate-700 font-bold text-xs">03</div>
                                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Logistics</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="flex-1 rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500 text-sm"
                                            value={filters.city}
                                            onChange={(e) => handleCityChange(e.target.value)}
                                            placeholder="City"
                                            data-testid="input-emergency-city"
                                        />
                                        <select
                                            className={`w-24 rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500 text-sm bg-white ${stateAutoFilled ? 'text-slate-500' : ''}`}
                                            value={filters.state}
                                            onChange={(e) => handleStateChange(e.target.value)}
                                            data-testid="select-emergency-state"
                                        >
                                            <option value="">State</option>
                                            {US_STATES.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
                                        </select>
                                    </div>
                                    <div className="mt-2">
                                        <select
                                            className="w-full rounded-lg border-slate-300 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
                                            value={filters.radiusMiles}
                                            onChange={(e) => setFilters({ ...filters, radiusMiles: e.target.value })}
                                            data-testid="select-emergency-radius"
                                        >
                                            <option value="25">Within 25 miles</option>
                                            <option value="50">Within 50 miles</option>
                                            <option value="100">Within 100 miles</option>
                                            <option value="250">Within 250 miles</option>
                                            <option value="any">Any distance</option>
                                        </select>
                                    </div>
                                    {locationIncomplete && (
                                        <p className="mt-1 text-[11px] text-red-600" data-testid="text-emergency-location-validation">
                                            Please enter both city and state to search by location.
                                        </p>
                                    )}
                                    {stateAutoFilled && !locationIncomplete && (
                                        <p className="mt-1 text-[10px] italic text-slate-400" data-testid="label-state-autofilled">State auto-filled from city</p>
                                    )}
                                </div>
                                
                            </div>
                        </div>

                        <button 
                            onClick={() => { document.activeElement?.blur(); handleSearch(); }}
                            className="w-full bg-[#EF4444] text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 hover:bg-[#DC2626] hover:shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 group"
                        >
                            <Zap className="w-5 h-5 group-hover:animate-pulse" fill="currentColor" />
                            Find Urgent Cover
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-w-5xl mx-auto w-full">
                        {!hasSearched ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-slate-200 border-dashed">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                    <Zap className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Urgent Search Mode</h3>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    This tool searches our "Urgent Ready" roster first. Results are ranked by:
                                </p>
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl w-full">
                                    {[
                                        { icon: Phone, title: "Responsiveness", desc: "Opt-in for urgent calls" },
                                        { icon: MapPin, title: "Proximity", desc: "Local & driving distance" },
                                        { icon: Clock, title: "Readiness", desc: "Role experience" }
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <item.icon className="w-5 h-5 text-slate-400 mb-2" />
                                            <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                                            <div className="text-xs text-slate-500">{item.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No immediate matches found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                    Try widening your role search or removing the location filter.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                        Matches Found
                                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{results.length}</span>
                                    </h3>
                                    <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                                        <ArrowUpRight className="w-3 h-3" />
                                        Sorted by: Urgent Priority
                                    </div>
                                </div>

                                {results.map(singer => (
                                    <div key={singer.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:border-red-300 transition-colors group relative">
                                        {/* Emergency Badge */}
                                        {singer.emergency_opt_in && (
                                            <div className="absolute top-0 left-0 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg z-10 shadow-sm flex items-center gap-1">
                                                <Zap className="w-3 h-3" fill="currentColor" /> 
                                                URGENT READY
                                            </div>
                                        )}

                                        <div className="md:w-56 h-56 md:h-auto relative bg-slate-100 flex-shrink-0">
                                            <img src={singer.headshot_url} alt="" className="w-full h-full object-cover" />
                                            {singer.distanceType === 'local' && (
                                                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-green-600" /> Local
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                        {singer.first_name} {singer.last_name}
                                                        {singer.union_status === 'AGMA' && <span className="text-[10px] border border-slate-200 text-slate-500 px-1 rounded">AGMA</span>}
                                                    </h3>
                                                    <p className="text-slate-600 font-medium">{singer.primary_fach}</p>
                                                </div>
                                                <div className="text-right">
                                                    {singer.emergency_lead_time_hours && (
                                                        <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 mb-1">
                                                            Available in {singer.emergency_lead_time_hours}h
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Match Reasons */}
                                            <div className="mt-4 mb-4">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Match Analysis</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {singer.matchReasons && singer.matchReasons.map((reason, idx) => (
                                                        <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200">
                                                            {reason}
                                                        </span>
                                                    ))}
                                                    {!singer.matchReasons && <span className="text-xs text-slate-400">Standard match</span>}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <div className="text-sm text-slate-500">
                                                    From <span className="font-semibold text-slate-900">{singer.city}{singer.state ? `, ${singer.state}` : ''}</span>
                                                    {typeof singer.distance_miles === 'number' && (
                                                        <span className="ml-2 text-xs text-slate-400">· {Math.round(singer.distance_miles)} miles away</span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    data-testid={`button-reveal-emergency-${singer.id}`}
                                                    disabled={revealingIds.has(singer.id)}
                                                    onClick={async () => {
                                                        if (!singer?.id) {
                                                            showAlert("Singer information is missing — please refresh and try again.", "error");
                                                            return;
                                                        }
                                                        if (inFlightRevealsRef.current.has(singer.id)) return;
                                                        const limit = currentUser?.data?.contact_reveal_limit ?? 0;
                                                        const used = currentUser?.data?.contact_reveals_used_this_month ?? 0;
                                                        if (limit - used < 2) {
                                                            setShowUpgradeModal(true);
                                                            return;
                                                        }
                                                        inFlightRevealsRef.current.add(singer.id);
                                                        setRevealingIds(prev => {
                                                            const next = new Set(prev);
                                                            next.add(singer.id);
                                                            return next;
                                                        });
                                                        try {
                                                            await revealContact(singer.id, "emergency");
                                                        } finally {
                                                            inFlightRevealsRef.current.delete(singer.id);
                                                            setRevealingIds(prev => {
                                                                const next = new Set(prev);
                                                                next.delete(singer.id);
                                                                return next;
                                                            });
                                                        }
                                                    }}
                                                    className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow hover:bg-[#EF4444] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                    {revealingIds.has(singer.id) ? "Revealing…" : "Call Now (2 Credits)"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onUpgrade={() => { setShowUpgradeModal(false); setView("pricing"); }} />}
            </AnimatePresence>
        </div>
    );
}
