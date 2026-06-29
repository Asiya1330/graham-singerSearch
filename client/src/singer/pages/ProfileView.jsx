import React, { useState, useEffect } from "react";
import { Award, BarChart2, CheckCircle, Eye, Globe, Heart, Lock, Mail, MapPin, Shield, Star, Users, Video, Zap } from "lucide-react";
import { useAppContext } from "../../AppContext";
import { AlertBanner, formatMonthYear } from "../../AppShared";

function sanitizeHttpUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function getVideoEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return u.toString();
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    if (host === "player.vimeo.com") return u.toString();
    return null;
  } catch {
    return null;
  }
}

export function ProfileView({ revealContact, isShortlisted, onToggleShortlist }) {
  const { currentUser, selectedSinger, setSelectedSinger, setView, alert } = useAppContext();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

    // Fall back to the logged-in singer's own data so a direct load / reload of
    // /singer/profile (no in-memory selection) still renders the preview rather
    // than a blank page.
    const singer =
      selectedSinger ||
      (currentUser?.type === "singer" && currentUser.data
        ? { ...currentUser.data, previewMode: true }
        : null);

    if (!singer) return null;

    const previewMode = !!singer.previewMode && currentUser?.type === "singer";
    const allowOrgActions = !previewMode && currentUser?.type === "organization";
    const isOrg = allowOrgActions || previewMode;
    const contactRevealed = allowOrgActions && singer.revealed;
    const videoTiles = [singer.video_link_1, singer.video_link_2]
      .map(raw => {
        const safeUrl = sanitizeHttpUrl(raw);
        if (!safeUrl) return null;
        return { safeUrl, embedUrl: getVideoEmbedUrl(safeUrl) };
      })
      .filter(Boolean);

    const renderVideoTile = (tile, idx, sizingClass = "aspect-video") => (
      <div key={idx} className={`rounded-lg overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center ${sizingClass}`} data-testid={`section-singer-video-${idx + 1}`}>
        {tile.embedUrl ? (
          <iframe
            src={tile.embedUrl}
            title={`${singer.first_name} ${singer.last_name} — performance video ${idx + 1}`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            data-testid={`iframe-singer-video-${idx + 1}`}
          />
        ) : (
          <a
            href={tile.safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-white text-sm font-medium"
            data-testid={`link-singer-video-external-${idx + 1}`}
          >
            <Video className="w-10 h-10" />
            <span>Open video in new tab</span>
            <span className="text-xs text-slate-500 break-all max-w-xs px-4 text-center">{tile.safeUrl}</span>
          </a>
        )}
      </div>
    );

    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {previewMode ? (
              <button
                onClick={() => { setSelectedSinger(null); setView("singerDashboard"); }}
                className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
                data-testid="button-close-preview"
              >
                × Close Preview
              </button>
            ) : (
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
            )}
            {previewMode && (
              <div className="mb-4 px-3 py-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium" data-testid="text-preview-banner">
                Preview mode — this is exactly how organizations see your profile.
              </div>
            )}
            {(() => {
              const headshotTile = (
                <div className="rounded-lg overflow-hidden bg-slate-100 border border-slate-200 aspect-[4/5]">
                  {singer.headshot_url ? (
                    <img
                      src={singer.headshot_url}
                      alt={`${singer.first_name} ${singer.last_name}`}
                      className="w-full h-full object-cover"
                      data-testid="img-singer-headshot-large"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No headshot on file</div>
                  )}
                </div>
              );
              return (
                <div className="mb-8" data-testid="section-singer-hero">
                  <div className="max-w-xs mx-auto md:mx-0">{headshotTile}</div>
                </div>
              );
            })()}
            <div className="md:flex md:items-start md:justify-between">
              <div className="flex items-center">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3 flex-wrap">
                    {singer.first_name} {singer.last_name}
                    {allowOrgActions && onToggleShortlist && (
                      <button
                        type="button"
                        onClick={() => onToggleShortlist(singer.id)}
                        aria-pressed={!!isShortlisted}
                        aria-label={isShortlisted ? `Remove ${singer.first_name} ${singer.last_name} from shortlist` : `Save ${singer.first_name} ${singer.last_name} to shortlist`}
                        title={isShortlisted ? "Saved to shortlist" : "Save to shortlist"}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          isShortlisted
                            ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                            : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-red-600 hover:border-red-200"
                        }`}
                        data-testid={isShortlisted ? `button-profile-shortlist-remove-${singer.id}` : `button-profile-shortlist-${singer.id}`}
                      >
                        <Heart className={`w-4 h-4 ${isShortlisted ? "fill-red-500 text-red-500" : ""}`} />
                        {isShortlisted ? "Saved" : "Save"}
                      </button>
                    )}
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
                    {singer.is_managed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800" data-testid="profile-managed-badge">
                           <Users className="w-3 h-3" /> Professionally Managed
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
                    {singer.city}{singer.state ? `, ${singer.state}` : ''}
                  </div>
                  {/* Reputation badges in profile */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {singer.is_pro_verified && (
                      <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Award className="w-3.5 h-3.5" /> Verified Pro
                      </span>
                    )}
                    {singer.is_emergency_ready && (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Zap className="w-3.5 h-3.5" /> Urgent Ready
                      </span>
                    )}
                    {singer.is_management_verified && (
                      <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Shield className="w-3.5 h-3.5" /> Management Verified
                      </span>
                    )}
                    {allowOrgActions && currentUser?.data?.subscription_tier === 'pro' ? (
                      (singer.total_gigs || 0) >= 3 ? (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold">
                          <BarChart2 className="w-3.5 h-3.5" /> {singer.reliability_score || 0}% Reliable
                          <span className="font-normal text-blue-600">({singer.total_gigs} verified engagements)</span>
                        </span>
                      ) : (singer.total_gigs > 0) ? (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs">
                          Not enough data yet
                        </span>
                      ) : null
                    ) : (allowOrgActions || previewMode) ? (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full text-xs" title="Upgrade to Pro to see Reputation Data">
                        <Lock className="w-3 h-3" /> <span className="blur-sm">Reliability Score</span> — Pro only
                      </span>
                    ) : null}
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
                        {singer.agent_name && (
                          <p className="flex items-center gap-2 mb-1 text-slate-600">
                            <Users className="w-4 h-4" /> Agent: {singer.agent_name}
                          </p>
                        )}
                        {singer.agent_email && (
                          <p className="flex items-center gap-2 mb-1 text-slate-600">
                            <Mail className="w-4 h-4" /> {singer.agent_email}
                          </p>
                        )}
                        {singer.website_url && (
                          <p className="flex items-center gap-2 text-slate-600">
                            <Globe className="w-4 h-4" />
                            <a href={singer.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{singer.website_url}</a>
                          </p>
                        )}
                      </div>
                    ) : previewMode ? (
                      <button
                        type="button"
                        disabled
                        title="Disabled in preview mode"
                        className="ml-3 inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600/60 cursor-not-allowed"
                        data-testid="button-reveal-contact-preview"
                      >
                        Reveal Contact Info
                      </button>
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
              {videoTiles.length > 0 && (
                <div className="bg-white shadow sm:rounded-lg" data-testid="section-singer-videos">
                  <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
                    <h3 className="text-lg leading-6 font-medium text-slate-900 flex items-center gap-2">
                      <Video className="w-5 h-5 text-slate-500" /> Performance Media
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:px-6">
                    <div className={`grid grid-cols-1 gap-6 ${videoTiles.length > 1 ? 'md:grid-cols-2' : ''}`}>
                      {videoTiles.map(renderVideoTile)}
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
                  <h3 className="text-lg leading-6 font-medium text-slate-900">About</h3>
                </div>
                <div className="px-4 py-5 sm:px-6">
                  <p className="text-slate-600 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{singer.short_bio}</p>
                </div>
              </div>

              {/* Performed Roles Section (Staged) */}
              {(() => {
                const performedRoles = (singer.roles || []).filter(r => (r.status || 'performed') === 'performed');
                return (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-slate-900">Opera / Staged Roles</h3>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{performedRoles.length} roles</span>
                </div>
                <div className="border-t border-slate-200">
                  <ul className="divide-y divide-slate-200">
                    {performedRoles.map((role, idx) => (
                      <li key={idx} className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {role.role_name}
                              <span className="text-slate-400 font-normal"> — </span>
                              <span className="text-slate-700 italic font-medium">{role.work_title}</span>
                              {role.experience_depth && (
                                <span className="ml-1 text-xs font-normal text-slate-500">({role.experience_depth} performances)</span>
                              )}
                            </p>
                            {Array.isArray(role.notable_companies) && role.notable_companies.length > 0 && (
                              <p className="mt-0.5 text-xs text-slate-600">
                                <span className="font-semibold text-slate-500">Companies:</span> {role.notable_companies.join(", ")}
                              </p>
                            )}
                            <div className="mt-1 flex gap-2">
                               {(role.languages || []).map(l => <span key={l} className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{l}</span>)}
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-sm text-slate-600 italic">{role.composer}</p>
                             {role.last_performed_date && <p className="text-xs text-slate-400 mt-1">Last: {formatMonthYear(role.last_performed_date)}</p>}
                             {Array.isArray(role.performance_types) && role.performance_types.includes("fully_staged") && (
                                <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                   Fully Staged
                                </span>
                             )}
                          </div>
                        </div>
                      </li>
                    ))}
                    {performedRoles.length === 0 && <li className="px-4 py-8 text-center text-slate-500 text-sm">No staged roles listed.</li>}
                  </ul>
                </div>
              </div>
                );
              })()}

              {/* Concert / Orchestra Works (Performed) */}
              {(() => {
                const performedWorks = (singer.works || []).filter(w => (w.status || 'performed') === 'performed');
                const orch = performedWorks.filter(w => (w.context || '').toLowerCase() === 'orchestra');
                if (orch.length === 0) return null;
                return (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-slate-900">Concert / Orchestra</h3>
                  <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">{orch.length} works</span>
                </div>
                <div className="border-t border-slate-200">
                  <ul className="divide-y divide-slate-200">
                    {orch.map((work, idx) => (
                      <li key={idx} className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{work.work_title}</p>
                            <p className="text-sm text-slate-500">{work.part_name}</p>
                          </div>
                           <div className="text-right">
                             <p className="text-sm text-slate-600 italic">{work.composer}</p>
                             {work.last_performed_date && <p className="text-xs text-slate-400 mt-1">Last: {formatMonthYear(work.last_performed_date)}</p>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
                );
              })()}

              {/* Choral Works (Performed) */}
              {(() => {
                const isChoralWork = (w) => {
                  const ctx = (w.context || '').toLowerCase();
                  const title = (w.work_title || '').toLowerCase();
                  return ctx.includes('chor') || title.includes('mass') || title.includes('requiem') || title.includes('passion') || title.includes('messiah') || title.includes('carmina') || title.includes('oratorio');
                };
                const choral = (singer.works || []).filter(w => (w.status || 'performed') === 'performed' && isChoralWork(w));
                if (choral.length === 0) return null;
                return (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-slate-900">Choral Works</h3>
                  <span className="text-xs font-semibold bg-teal-100 text-teal-600 px-2 py-1 rounded-full">{choral.length} works</span>
                </div>
                <div className="border-t border-slate-200">
                  <ul className="divide-y divide-slate-200">
                    {choral.map((work, idx) => (
                      <li key={idx} className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{work.work_title}</p>
                            <p className="text-sm text-slate-500">{work.part_name}</p>
                          </div>
                           <div className="text-right">
                             <p className="text-sm text-slate-600 italic">{work.composer}</p>
                             {work.last_performed_date && <p className="text-xs text-slate-400 mt-1">Last: {formatMonthYear(work.last_performed_date)}</p>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
                );
              })()}

              {/* Other Works (Performed, not orchestra, not choral) */}
              {(() => {
                const isChoralWork = (w) => {
                  const ctx = (w.context || '').toLowerCase();
                  const title = (w.work_title || '').toLowerCase();
                  return ctx.includes('chor') || title.includes('mass') || title.includes('requiem') || title.includes('passion') || title.includes('messiah') || title.includes('carmina') || title.includes('oratorio');
                };
                const other = (singer.works || []).filter(w => {
                  if ((w.status || 'performed') !== 'performed') return false;
                  const ctx = (w.context || '').toLowerCase();
                  return ctx !== 'orchestra' && !isChoralWork(w);
                });
                if (other.length === 0) return null;
                return (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-slate-900">Other Engagements</h3>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{other.length} works</span>
                </div>
                <div className="border-t border-slate-200">
                  <ul className="divide-y divide-slate-200">
                    {other.map((work, idx) => (
                      <li key={idx} className="px-4 py-4 sm:px-6 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{work.work_title}</p>
                            <p className="text-sm text-slate-500">{work.part_name}</p>
                          </div>
                           <div className="text-right">
                             <p className="text-sm text-slate-600 italic">{work.composer}</p>
                             {work.last_performed_date && <p className="text-xs text-slate-400 mt-1">Last: {formatMonthYear(work.last_performed_date)}</p>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
                );
              })()}

              {/* In Preparation (subordinate) */}
              {(() => {
                const inPrepRoles = (singer.roles || []).filter(r => r.status === 'in_preparation');
                const inPrepWorks = (singer.works || []).filter(w => w.status === 'in_preparation');
                if (inPrepRoles.length === 0 && inPrepWorks.length === 0) return null;
                return (
              <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-lg" data-testid="section-in-preparation">
                <div className="px-4 py-3 sm:px-5 border-b border-slate-200/70 flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    In Preparation
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-100">Not yet performed</span>
                  </h4>
                  <span className="text-xs font-medium text-slate-500">{inPrepRoles.length + inPrepWorks.length} item{inPrepRoles.length + inPrepWorks.length === 1 ? '' : 's'}</span>
                </div>
                <ul className="divide-y divide-slate-200/70">
                  {inPrepRoles.map((role) => (
                    <li key={`prep-role-${role.id}`} className="px-4 py-2.5 sm:px-5 hover:bg-white/60" data-testid={`prep-role-${role.id}`}>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-slate-700">
                          <span className="font-medium">{role.role_name}</span>
                          <span className="text-slate-400 mx-1">in</span>
                          <span className="italic text-slate-600">{role.work_title}</span>
                        </div>
                        <span className="text-xs text-slate-500 italic">{role.composer}</span>
                      </div>
                    </li>
                  ))}
                  {inPrepWorks.map((work) => (
                    <li key={`prep-work-${work.id}`} className="px-4 py-2.5 sm:px-5 hover:bg-white/60" data-testid={`prep-work-${work.id}`}>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-slate-700">
                          <span className="font-medium">{work.work_title}</span>
                          {work.part_name && <>
                            <span className="text-slate-400 mx-1">•</span>
                            <span className="text-slate-600">{work.part_name}</span>
                          </>}
                        </div>
                        <span className="text-xs text-slate-500 italic">{work.composer}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
                );
              })()}
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
                  {singer.languages_sung && singer.languages_sung.length > 0 && (
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
                  )}
                  {singer.represented && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Representation</h4>
                      <p className="mt-1 text-sm text-slate-900">{singer.agent_name}</p>
                      <a href={`mailto:${singer.agent_email}`} className="text-sm text-blue-600 hover:text-blue-500">
                        {singer.agent_email}
                      </a>
                    </div>
                  )}
                  {singer.is_managed && singer.manager_name && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</h4>
                      <p className="mt-1 text-sm text-slate-900">{singer.manager_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
