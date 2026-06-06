import React from "react";
import { motion } from "framer-motion";
import { MapPin, Zap, Star, ArrowUpRight } from "lucide-react";

function SearchResults({ results }) {
  return (
    <>
      {results.map(singer => (
        /* PASTE EVERYTHING YOU COPIED HERE */
      ))}
    </>
  );
}

export default SearchResults;
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
                  From <span className="font-semibold text-slate-900">{singer.city}, {singer.state}</span>
              </div>
              <button 
                  onClick={() => {
                      if (currentUser.data.contact_reveal_limit - currentUser.data.contact_reveals_used_this_month < 2) {
                          setShowUpgradeModal(true);
                          return;
                      }
                      if (confirm(`Urgent Contact costs 2 credits. Reveal contact for ${singer.first_name}?`)) {
                          revealContact(singer.id);
                      }
                  }}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                  <Phone className="w-4 h-4" /> 
                  Call Now (2 Credits)
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
};

const OrgDashboard = () => {
const user = currentUser.data;
const isPro = user.subscription_tier === 'pro';

return (
<div className="min-h-screen bg-slate-50 pb-12">
<nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between h-16">
<div className="flex">
<div className="flex-shrink-0 flex items-center">
<img src={singerSearchLogo} alt="Singer Search" className="h-8 object-contain" />
</div>
<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
<span className="border-blue-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
Search
</span>
<button 
onClick={() => isPro ? setView("emergencySearch") : setShowUpgradeModal(true)}
className="text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5"
>
<Zap className="w-4 h-4" />
Urgent Mode
<span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide">New</span>
</button>
</div>
</div>
<div className="flex items-center gap-4">
{!isPro && (
<button 
onClick={() => setView("pricing")}
className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
>
Upgrade to Pro
</button>
)}
<div className="flex items-center">
<span className="text-slate-700 text-sm font-medium mr-4 flex items-center gap-2">
{user.organization_name}
{user.verified && <CheckCircle className="w-4 h-4 text-blue-500" title="Verified Organization" />}
</span>
<button
onClick={async () => {
await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
setCurrentUser(null);
setSearchResults([]);
setView("landing");
}}
className="text-slate-500 hover:text-slate-700"
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
{showWelcome && (
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
className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap"
>
<Zap className="w-4 h-4" fill="currentColor" />
Find Short-Notice Engagements
</button>
</motion.div>

<SearchForm isPro={isPro} onSearch={performSearch} onNavigate={setView} />

<div className="space-y-6">
<div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="bg-blue-100 p-2 rounded-full">
<Users className="w-5 h-5 text-blue-600" />
</div>
<div>
<p className="text-blue-900 font-bold text-lg">
{searchResults.length} singers match <span className="text-blue-700">"{submittedFilters.roleOrWork || submittedFilters.voiceType || 'your criteria'}"</span>
</p>
<p className="text-blue-700 text-sm">
{submittedFilters.city ? `Located within range of ${submittedFilters.city}` : "Available for your dates"}
</p>
</div>
</div>
{submittedFilters.emergencyMode && (
<span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200 animate-pulse flex items-center gap-1">
<Zap className="w-3 h-3" /> Urgent Mode Active
</span>
)}
</div>

<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
{searchResults.map((singer) => (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
key={singer.id}
className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 transition-all duration-300 group cursor-pointer"
onClick={() => viewProfile(singer.id)}
>
<div className="relative h-48 overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={singer.headshot_url} alt="" />
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
<div className="absolute bottom-4 left-4 text-white">
<h3 className="text-xl font-bold leading-tight">
{singer.first_name} {singer.last_name}
</h3>
<p className="text-sm font-medium text-white/90">{singer.primary_fach}</p>
</div>
<div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
{singer.subscription_tier === 'founding' && (
<span className="inline-flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm" data-testid={`badge-founding-${singer.id}`}>
<Star className="w-3 h-3 fill-current" /> Founding Artist 2025
</span>
)}
{singer.emergency_opt_in && (
<span className="inline-flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm animate-pulse">
<Zap className="w-3 h-3 fill-current" /> Urgent Ready
</span>
)}
</div>
</div>

<div className="p-5">
{/* Repertoire Match Highlight */}
{submittedFilters.roleOrWork && singer.matchStrength > 0 ? (
<div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
<div className="flex items-center gap-2 mb-1">
<CheckCircle className="w-4 h-4 text-blue-600" />
<span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Perfect Match</span>
</div>
<p className="text-sm text-blue-900 font-medium line-clamp-2">
Has performed <span className="font-bold">"{submittedFilters.roleOrWork}"</span> {singer.roles.find(r => r.role_name.toLowerCase().includes(submittedFilters.roleOrWork.toLowerCase()) || r.work_title.toLowerCase().includes(submittedFilters.roleOrWork.toLowerCase()))?.experience_depth} times
</p>
</div>
) : singer.bestAvailability ? (
<div className="bg-emerald-50 rounded-lg p-3 mb-4 border border-emerald-100">
<div className="flex items-center gap-2 mb-1">
<Calendar className="w-4 h-4 text-emerald-600" />
<span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Available</span>
</div>
<p className="text-xs text-emerald-700 font-medium">
{new Date(singer.bestAvailability.start_date).toLocaleDateString()} -{" "}
{new Date(singer.bestAvailability.end_date).toLocaleDateString()}
</p>
</div>
) : null}

{singer.performance_types && singer.performance_types.length > 0 && (
<div className="flex flex-wrap gap-1 mb-3" data-testid={`tags-performance-${singer.id}`}>
{singer.performance_types.map(type => (
<span key={type} className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
type === 'Opera' ? 'bg-purple-100 text-purple-700' :
type === 'Orchestra' ? 'bg-indigo-100 text-indigo-700' :
type === 'Chorus' ? 'bg-teal-100 text-teal-700' :
'bg-slate-100 text-slate-600'
}`}>{type}</span>
))}
</div>
)}

<div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
<MapPin className="w-4 h-4 text-slate-400" />
{singer.city}, {singer.state}
<span className="text-slate-300">•</span>
<span className={`text-xs font-medium px-2 py-0.5 rounded ${
singer.distanceType === 'local' ? 'bg-green-100 text-green-700' :
singer.distanceType === 'regional' ? 'bg-yellow-100 text-yellow-700' :
'bg-slate-100 text-slate-600'
}`}>
{singer.city === "New York" ? "Local (Drive-in)" : "National (Flight)"}
</span>
</div>

<div className="flex gap-2">
<button
onClick={(e) => {
e.stopPropagation();
viewProfile(singer.id);
}}
className="flex-1 px-4 py-2 border border-slate-200 shadow-sm text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
>
View Profile
</button>
<button
onClick={(e) => {
e.stopPropagation();
revealContact(singer.id);
}}
className="flex-1 px-4 py-2 bg-blue-600 text-white shadow-sm text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
>
Contact
</button>
</div>
</div>
</motion.div>
))}
</div>
</div>
</div>
</div>
);
};

const ProfileView = () => {
if (!selectedSinger) return null;

const singer = selectedSinger;
const isOrg = currentUser?.type === "organization";
const contactRevealed = isOrg && singer.revealed;

return (
<div className="min-h-screen bg-slate-50 pb-12">
<div className="bg-white shadow">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
<button
onClick={() => {
if (isOrg) setView("orgDashboard");
else if (currentUser?.type === "singer") setView("singerDashboard");
else setView("landing");
}}
className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
>
← Back to results
</button>
<div className="md:flex md:items-start md:justify-between">
<div className="flex items-center">
<img className="h-24 w-24 rounded-full object-cover border-4 border-slate-50 shadow-md" src={singer.headshot_url} alt="" />
<div className="ml-6">
<h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3 flex-wrap">
{singer.first_name} {singer.last_name}
{singer.admin_approved && (
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
<CheckCircle className="w-3 h-3 mr-1" /> Verified Profile
</span>
)}
{singer.subscription_tier === 'founding' && (
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800" data-testid="profile-founding-badge">
<Star className="w-3 h-3 fill-amber-500" /> Founding Artist 2025
</span>
)}
</h1>
<p className="text-lg font-medium text-slate-600">{singer.primary_fach}</p>
{singer.performance_types && singer.performance_types.length > 0 && (
<div className="flex flex-wrap gap-1.5 mt-1.5">
{singer.performance_types.map(type => (
<span key={type} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
type === 'Opera' ? 'bg-purple-100 text-purple-700' :
type === 'Orchestra' ? 'bg-indigo-100 text-indigo-700' :
type === 'Chorus' ? 'bg-teal-100 text-teal-700' :
'bg-slate-100 text-slate-600'
}`}>{type}</span>
))}
</div>
)}
<div className="flex items-center mt-2 text-sm text-slate-500">
<MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
{singer.city}, {singer.state}
</div>
</div>
</div>
<div className="mt-4 flex flex-col md:mt-0 md:ml-4 gap-3">
{isOrg && (
<>
{singer.viewed_count > 0 && (
<div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full self-start md:self-end">
<Eye className="w-4 h-4" />
<span>Viewed by {singer.viewed_count} organization{singer.viewed_count === 1 ? '' : 's'} this week</span>
</div>
)}
{contactRevealed ? (
<div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
<p className="font-semibold text-green-900 mb-2">Contact Information:</p>
<p className="flex items-center gap-2 mb-1">
<Mail className="w-4 h-4" /> {singer.email}
</p>
<p className="flex items-center gap-2">
<Phone className="w-4 h-4" /> {singer.phone}
</p>
</div>
) : (
<button
onClick={() => revealContact(singer.id)}
className="ml-3 inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-blue-200"
>
Reveal Contact Info
</button>
)}
</>
)}
</div>
</div>
</div>
</div>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
{alert && <AlertBanner alert={alert} />}
<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
<div className="lg:col-span-2 space-y-6">
<div className="bg-white shadow sm:rounded-lg">
<div className="px-4 py-5 sm:px-6 border-b border-slate-200">
<h3 className="text-lg leading-6 font-medium text-slate-900">About</h3>
</div>
<div className="px-4 py-5 sm:px-6">
<p className="text-slate-600 leading-relaxed">{singer.short_bio}</p>
</div>
</div>

{/* Roles Section (Staged) */}
<div className="bg-white shadow sm:rounded-lg">
<div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center">
<h3 className="text-lg leading-6 font-medium text-slate-900">Opera / Staged Roles</h3>
<span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{singer.roles.length} roles</span>
</div>
<div className="border-t border-slate-200">
<ul className="divide-y divide-slate-200">
{singer.roles.map((role, idx) => (
<li key={idx} className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
<div className="flex justify-between items-start">
<div>
<p className="text-sm font-bold text-slate-900">{role.role_name}</p>
<p className="text-sm text-slate-500">{role.work_title}</p>
<div className="mt-1 flex gap-2">
{role.languages.map(l => <span key={l} className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{l}</span>)}
</div>
</div>
<div className="text-right">
<p className="text-sm text-slate-600 italic">{role.composer}</p>
<p className="text-xs text-slate-400 mt-1">Last: {role.last_performed_date}</p>
{role.performance_types.includes("fully_staged") && (
<span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
 Fully Staged
</span>
)}
</div>
</div>
</li>
))}
{singer.roles.length === 0 && <li className="px-4 py-8 text-center text-slate-500 text-sm">No staged roles listed.</li>}
</ul>
</div>
</div>

{/* Concert / Orchestra Works */}
{singer.works.filter(w => (w.context || '').toLowerCase() === 'orchestra').length > 0 && (
<div className="bg-white shadow sm:rounded-lg">
<div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center">
<h3 className="text-lg leading-6 font-medium text-slate-900">Concert / Orchestra</h3>
<span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">{singer.works.filter(w => (w.context || '').toLowerCase() === 'orchestra').length} works</span>
</div>
<div className="border-t border-slate-200">
<ul className="divide-y divide-slate-200">
{singer.works.filter(w => (w.context || '').toLowerCase() === 'orchestra').map((work, idx) => (
<li key={idx} className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
<div className="flex justify-between items-start">
<div>
<p className="text-sm font-bold text-slate-900">{work.work_title}</p>
<p className="text-sm text-slate-500">{work.part_name}</p>
</div>
<div className="text-right">
<p className="text-sm text-slate-600 italic">{work.composer}</p>
<p className="text-xs text-slate-400 mt-1">Last: {work.last_performed_date}</p>
</div>
</div>
</li>
))}
</ul>
</div>
</div>
)}

{/* Choral Works */}
{singer.works.filter(w => {
const ctx = (w.context || '').toLowerCase();
const title = (w.work_title || '').toLowerCase();
return ctx.includes('chor') || title.includes('mass') || title.includes('requiem') || title.includes('passion') || title.includes('messiah') || title.includes('carmina') || title.includes('oratorio');
}).length > 0 && (
<div className="bg-white shadow sm:rounded-lg">
<div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center">
<h3 className="text-lg leading-6 font-medium text-slate-900">Choral Works</h3>
<span className="text-xs font-semibold bg-teal-100 text-teal-600 px-2 py-1 rounded-full">{singer.works.filter(w => {
const ctx = (w.context || '').toLowerCase();
const title = (w.work_title || '').toLowerCase();
return ctx.includes('chor') || title.includes('mass') || title.includes('requiem') || title.includes('passion') || title.includes('messiah') || title.includes('carmina') || title.includes('oratorio');
}).length} works</span>
</div>
<div className="border-t border-slate-200">
<ul className="divide-y divide-slate-200">
{singer.works.filter(w => {
const ctx = (w.context || '').toLowerCase();
const title = (w.work_title || '').toLowerCase();
return ctx.includes('chor') || title.includes('mass') || title.includes('requiem') || title.includes('passion') || title.includes('messiah') || title.includes('carmina') || title.includes('oratorio');
}).map((work, idx) => (
<li key={idx} className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
<div className="flex justify-between items-start">
<div>
<p className="text-sm font-bold text-slate-900">{work.work_title}</p>
<p className="text-sm text-slate-500">{work.part_name}</p>
</div>
<div className="text-right">
<p className="text-sm text-slate-600 italic">{work.composer}</p>
<p className="text-xs text-slate-400 mt-1">Last: {work.last_performed_date}</p>
</div>
</div>
</li>
))}
</ul>
</div>
</div>
)}

{/* Other Works (not orchestra, not choral) */}
{singer.works.filter(w => {
const ctx = (w.context || '').toLowerCase();
const title = (w.work_title || '').toLowerCase();
const isOrchestra = ctx === 'orchestra';
const isChoral = ctx.includes('chor') || title.includes('mass') || title.includes('requiem') || title.includes('passion') || title.includes('messiah') || title.includes('carmina') || title.includes('oratorio');
return !isOrchestra && !isChoral;
}).length > 0 && (
<div className="bg-white shadow sm:rounded-lg">
<div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center">
<h3 className="text-lg leading-6 font-medium text-slate-900">Other Engagements</h3>
<span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{singer.works.filter(w => {
const ctx = (w.context || '').toLowerCase();
const title = (w.work_title || '').toLowerCase();
const isOrchestra = ctx === 'orchestra';
const isChoral = ctx.includes('chor') || title.includes('mass') || title.includes('requiem') || title.includes('passion') || title.includes('messiah') || title.includes('carmina') || title.includes('oratorio');
return !isOrchestra && !isChoral;
}).length} works</span>
</div>
<div className="border-t border-slate-200">
<ul className="divide-y divide-slate-200">
{singer.works.filter(w => {
const ctx = (w.context || '').toLowerCase();
const title = (w.work_title || '').toLowerCase();
const isOrchestra = ctx === 'orchestra';
const isChoral = ctx.includes('chor') || title.includes('mass') || title.includes('requiem') || title.includes('passion') || title.includes('messiah') || title.includes('carmina') || title.includes('oratorio');
return !isOrchestra && !isChoral;
}).map((work, idx) => (
<li key={idx} className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
<div className="flex justify-between items-start">
<div>
<p className="text-sm font-bold text-slate-900">{work.work_title}</p>
<p className="text-sm text-slate-500">{work.part_name}</p>
</div>
<div className="text-right">
<p className="text-sm text-slate-600 italic">{work.composer}</p>
<p className="text-xs text-slate-400 mt-1">Last: {work.last_performed_date}</p>
</div>
</div>
</li>
))}
</ul>
</div>
</div>
)}
</div>

<div className="space-y-6">
<div className="bg-white shadow sm:rounded-lg">
<div className="px-4 py-5 sm:px-6 border-b border-slate-200">
<h3 className="text-lg leading-6 font-medium text-slate-900">Details</h3>
</div>
<div className="px-4 py-5 sm:px-6 space-y-4">
<div>
<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Union Status</h4>
<p className="mt-1 text-sm text-slate-900">{singer.union_status}</p>
</div>
<div>
<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Languages</h4>
<div className="mt-1 flex flex-wrap gap-2">
{singer.languages_sung.map((lang) => (
<span
key={lang}
className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
>
{lang}
</span>
))}
</div>
</div>
{singer.represented && (
<div>
<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Representation</h4>
<p className="mt-1 text-sm text-slate-900">{singer.agent_name}</p>
<a href={`mailto:${singer.agent_email}`} className="text-sm text-blue-600 hover:text-blue-500">
{singer.agent_email}
</a>
</div>
)}
</div>
</div>
</div>
</div>
</div>
</div>