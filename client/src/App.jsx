import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Eye,
  Mail,
  Phone,
  Award,
  Globe,
  CheckCircle,
  X,
  Info,
  Clock,
  TrendingUp,
  Zap,
  Filter,
  ChevronDown,
  ArrowUpRight,
  Star,
  ChevronRight,
  Edit2,
  Trash2,
  FileText,
  Shield,
  UserCheck,
  UserX,
  BarChart2,
  ClipboardList,
  Lock,
  Camera,
  ChevronUp,
  Flag,
  Building2,
  CreditCard,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SingerCard from "./SingerCard";
import RepertoireAutocomplete, { VOICE_TYPE_DB_TO_LABEL, CATEGORY_DB_TO_PERFTYPE } from "./RepertoireAutocomplete";
import { AppProvider } from "./AppContext";
import { AdminDashboard } from "./AdminDashboard";
import { SingerDashboard } from "./SingerDashboard";
import { SingerSettings } from "./SingerSettings";
import { OrgSettings } from "./OrgSettings";
import { LandingView } from "./LandingView";
import { EmergencySearch } from "./EmergencySearch";
import { OrgDashboard } from "./OrgDashboard";
import { ProfileView } from "./ProfileView";
import { PricingPage } from "./PricingPage";
import { AboutPage } from "./AboutPage";
import { TermsPage } from "./TermsPage";
import { PrivacyPage } from "./PrivacyPage";
import { SingerLogin, OrganizationLogin, SingerRegistration, OrgRegistration, ResetPasswordPage } from "./AuthPages";
import { BLANK_FILTERS, AlertBanner, AppFooter } from "./AppShared";
import { navigateToView, viewFromPath, PUBLIC_PATHS } from "./lib/nav";
import { apiFetch, getErrorMessageFromBody, API_ERRORS } from "./lib/api";
import { ApiErrorText } from "./components/ApiErrorText";
// Assets
import heroVideo from "./assets/hero-opera.mp4";
import singerBanner from "@assets/singer-banner_1771276151336.gif";
import singerSearchLogo from "@assets/Singer_Search_Logo_May_2026_1777734809747.png";
import logo1 from "./assets/logos/logo_1.png";
import logo2 from "./assets/logos/logo_2.png";
import logo3 from "./assets/logos/logo_3.png";
import logo4 from "./assets/logos/logo_4.png";

const RESULTS_PER_PAGE = 20;

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }, "ADMIN_INVALID_PASSWORD");
      onSuccess();
    } catch (err) {
      setError(err.message || API_ERRORS.ADMIN_INVALID_PASSWORD.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin Access</h1>
          <p className="text-sm text-slate-500 mt-1">Enter the admin password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter admin password"
              autoFocus
              data-testid="input-admin-password"
            />
          </div>
          {error && (
            <ApiErrorText message={error} testId="admin-login-error" />
          )}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full h-10 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            data-testid="button-admin-login"
          >
            {loading ? "Verifying…" : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("landing");
  const [currentUser, setCurrentUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [selectedSinger, setSelectedSinger] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [submittedFilters, setSubmittedFilters] = useState(BLANK_FILTERS);

  const [searchResults, setSearchResults] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState(() => new Set());
  const [shortlistSingers, setShortlistSingers] = useState([]);
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cityFallbackBanner, setCityFallbackBanner] = useState(null);
  const [noResultsDiagnostic, setNoResultsDiagnostic] = useState(null);
  const [searchFormKey, setSearchFormKey] = useState(0);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    window.clearTimeout(showAlert._t);
    showAlert._t = window.setTimeout(() => setAlert(null), 4000);
  };

  useEffect(() => {
    const syncFromUrl = () => {
      const path = window.location.pathname;
      const matchedView = viewFromPath(path);
      if (matchedView) {
        setView(matchedView);
      } else if (path === "/") {
        setView((v) =>
          ["terms", "privacy", "resetPassword", "singerLogin", "organizationLogin", "singerRegister", "orgRegister"].includes(v)
            ? "landing"
            : v,
        );
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    const onPublicPage = PUBLIC_PATHS.includes(window.location.pathname);
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.userType === "singer") {
            setCurrentUser({ type: "singer", data });
            if (!onPublicPage) setView("singerDashboard");
          } else if (data.userType === "organization") {
            setCurrentUser({ type: "organization", data });
            if (!onPublicPage) setView("orgDashboard");
          }
        }
      })
      .catch(() => {});
  }, []);

  const performSearch = async (filters) => {
    setIsSearching(true);
    setSubmittedFilters(filters);

    try {
      const params = new URLSearchParams();
      if (filters.voiceType) params.set("voiceType", filters.voiceType);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.workTitle) params.set("workTitle", filters.workTitle);
      if (filters.role) params.set("role", filters.role);
      if (filters.composer) params.set("composer", filters.composer);
      if (filters.city) params.set("city", filters.city);
      if (filters.state) params.set("state", filters.state);
      if (filters.radiusMiles) params.set("radius_miles", filters.radiusMiles);
      if (filters.language) params.set("language", filters.language);
      if (filters.experienceLevel && filters.experienceLevel !== "any") params.set("experienceLevel", filters.experienceLevel);
      if (filters.unionStatus && filters.unionStatus !== "any") params.set("unionStatus", filters.unionStatus);
      if (filters.represented && filters.represented !== "any") params.set("represented", filters.represented);
      if (filters.managedOnly && filters.managedOnly !== "any") params.set("managedOnly", filters.managedOnly);
      if (filters.emergencyMode) params.set("emergencyMode", "true");

      const res = await fetch(`/api/search?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        showAlert(getErrorMessageFromBody(data, "SEARCH_FAILED"), "error");
        return;
      }

      const results = data.results || [];
      setSearchResults(results);
      setHasSearched(true);
      setCurrentPage(1);
      if (data.cityFallback && data.searchedCity) {
        setCityFallbackBanner(`No singers found in ${data.searchedCity} — showing all available singers instead`);
        setNoResultsDiagnostic(null);
      } else {
        setCityFallbackBanner(null);
        if (results.length === 0 && data.noResultsDiagnostic) {
          setNoResultsDiagnostic(data.noResultsDiagnostic);
        } else {
          setNoResultsDiagnostic(null);
          showAlert(`Found ${data.totalCount ?? results.length} singer${(data.totalCount ?? results.length) === 1 ? "" : "s"}`, "success");
        }
      }
    } catch (err) {
      showAlert(err.message || API_ERRORS.SEARCH_FAILED.message, "error");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
    setCurrentPage(1);
    setSubmittedFilters(BLANK_FILTERS);
    setCityFallbackBanner(null);
    setNoResultsDiagnostic(null);
  };

  const FILTER_DISPLAY_NAMES = {
    city: "city",
    voiceType: "voice type",
    role: "role",
    roleNames: "work/role",
    experienceLevel: "experience level",
    unionStatus: "union status",
    represented: "representation",
    startDate: "availability",
    endDate: "availability",
    language: "language",
  };

  const removeFilterAndSearch = () => {
    const filter = noResultsDiagnostic?.mostRestrictiveFilter;
    if (!filter) return;
    const newFilters = { ...submittedFilters };
    if (filter === "city") newFilters.city = "";
    else if (filter === "voiceType") newFilters.voiceType = "";
    else if (filter === "role") newFilters.role = "";
    else if (filter === "roleNames") { newFilters.workTitle = ""; newFilters.role = ""; }
    else if (filter === "experienceLevel") newFilters.experienceLevel = "any";
    else if (filter === "unionStatus") newFilters.unionStatus = "any";
    else if (filter === "represented") newFilters.represented = "any";
    else if (filter === "startDate" || filter === "endDate") { newFilters.startDate = ""; newFilters.endDate = ""; }
    else if (filter === "language") newFilters.language = "";
    setSubmittedFilters(newFilters);
    setSearchFormKey(k => k + 1);
    performSearch(newFilters);
  };

  const viewProfile = (singerOrId) => {
    let singer = null;
    if (singerOrId && typeof singerOrId === "object") {
      singer = singerOrId;
    } else {
      singer =
        searchResults.find((s) => s.id === singerOrId) ||
        shortlistSingers.find((s) => s.id === singerOrId) ||
        null;
    }
    setSelectedSinger(singer || null);
    setView("profileView");
  };

  const revealContact = async (singerId, type = "standard", cost = 1) => {
    if (!currentUser || currentUser.type !== "organization") {
      showAlert("Please log in as an organization to view contact information.", "error");
      navigateToView(setView, "organizationLogin");
      return;
    }
    try {
      const res = await fetch("/api/contact-reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ singerId, isEmergency: type === "emergency" }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(getErrorMessageFromBody(data, "CONTACT_REVEAL_FAILED"), "error");
        return;
      }
      
      showAlert("Contact information revealed.", "success");
      
      const { data: profile } = await apiFetch("/api/auth/me", {}, "PROFILE_LOAD_FAILED");
      setCurrentUser({ type: "organization", data: profile });
      
      setSearchResults(prev => prev.map(s => s.id === singerId ? { ...s, revealed: true, email: data.email, agent_name: data.agent_name, agent_email: data.agent_email, website_url: data.website_url } : s));
      if (selectedSinger && selectedSinger.id === singerId) {
        setSelectedSinger(prev => ({ ...prev, revealed: true, email: data.email, agent_name: data.agent_name, agent_email: data.agent_email, website_url: data.website_url }));
      }
    } catch (err) {
      showAlert(err.message || API_ERRORS.CONTACT_REVEAL_FAILED.message, "error");
    }
  };

  // ── Shortlist (org-only) ─────────────────────────────────────────────────

  const loadShortlist = async () => {
    setShortlistLoading(true);
    try {
      const res = await fetch("/api/shortlist", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setShortlistSingers(Array.isArray(data) ? data : []);
        setShortlistedIds(new Set((data || []).map(s => s.id)));
      }
    } catch {}
    setShortlistLoading(false);
  };

  useEffect(() => {
    if (currentUser?.type === "organization") {
      loadShortlist();
    } else {
      setShortlistedIds(new Set());
      setShortlistSingers([]);
    }
  }, [currentUser?.type, currentUser?.data?.id]);

  const toggleShortlist = async (singerId) => {
    if (currentUser?.type !== "organization") return;
    const wasShortlisted = shortlistedIds.has(singerId);
    setShortlistedIds(prev => {
      const next = new Set(prev);
      if (wasShortlisted) next.delete(singerId); else next.add(singerId);
      return next;
    });
    if (wasShortlisted) {
      setShortlistSingers(prev => prev.filter(s => s.id !== singerId));
    }
    try {
      const res = await fetch(`/api/shortlist/${singerId}`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setShortlistedIds(prev => {
        const next = new Set(prev);
        if (data.shortlisted) next.add(singerId); else next.delete(singerId);
        return next;
      });
      if (!data.shortlisted) {
        setShortlistSingers(prev => prev.filter(s => s.id !== singerId));
      } else if (!shortlistSingers.some(s => s.id === singerId)) {
        loadShortlist();
      }
    } catch {
      setShortlistedIds(prev => {
        const next = new Set(prev);
        if (wasShortlisted) next.add(singerId); else next.delete(singerId);
        return next;
      });
      if (wasShortlisted) loadShortlist();
    }
  };

  const __appContextValue = {
    view, setView,
    currentUser, setCurrentUser,
    alert, setAlert,
    selectedSinger, setSelectedSinger,
  };

  const renderView = () => {
    switch (view) {
      case "landing":
        return <><LandingView setAdminMode={setAdminMode} /><AppFooter /></>;
      case "terms":
        return <><TermsPage /><AppFooter /></>;
      case "privacy":
        return <><PrivacyPage /><AppFooter /></>;
      case "resetPassword":
        return <ResetPasswordPage showAlert={showAlert} />;
      case "singerLogin":
        return <SingerLogin showAlert={showAlert} setShowWelcome={setShowWelcome} />;
      case "organizationLogin":
        return <OrganizationLogin showAlert={showAlert} setShowWelcome={setShowWelcome} />;
      case "singerRegister":
        return <SingerRegistration showAlert={showAlert} setShowWelcome={setShowWelcome} />;
      case "orgRegister":
        return <OrgRegistration showAlert={showAlert} setShowWelcome={setShowWelcome} />;
      case "singerDashboard":
        return <><SingerDashboard setSearchResults={setSearchResults} showAlert={showAlert} /><AppFooter /></>;
      case "orgDashboard":
        if (currentUser?.type === "singer") return <><SingerDashboard setSearchResults={setSearchResults} showAlert={showAlert} /><AppFooter /></>;
        return <><OrgDashboard
          setSearchResults={setSearchResults}
          setShowUpgradeModal={setShowUpgradeModal}
          setShowWelcome={setShowWelcome}
          showUpgradeModal={showUpgradeModal}
          showWelcome={showWelcome}
          performSearch={performSearch}
          clearSearch={clearSearch}
          viewProfile={viewProfile}
          revealContact={revealContact}
          removeFilterAndSearch={removeFilterAndSearch}
          FILTER_DISPLAY_NAMES={FILTER_DISPLAY_NAMES}
          searchFormKey={searchFormKey}
          searchResults={searchResults}
          hasSearched={hasSearched}
          isSearching={isSearching}
          cityFallbackBanner={cityFallbackBanner}
          noResultsDiagnostic={noResultsDiagnostic}
          submittedFilters={submittedFilters}
          shortlistedIds={shortlistedIds}
          shortlistSingers={shortlistSingers}
          shortlistLoading={shortlistLoading}
          loadShortlist={loadShortlist}
          toggleShortlist={toggleShortlist}
        /><AppFooter /></>;
      case "singerSettings":
        return <SingerSettings />;
      case "orgSettings":
        return <OrgSettings />;
      case "profileView":
        return <ProfileView
          revealContact={revealContact}
          isShortlisted={selectedSinger ? shortlistedIds.has(selectedSinger.id) : false}
          onToggleShortlist={toggleShortlist}
        />;
      case "adminLogin":
        return <AdminLogin onSuccess={() => { setAdminMode(true); setView("adminDashboard"); }} />;
      case "adminDashboard":
        return <><AdminDashboard setAdminMode={setAdminMode} showAlert={showAlert} /><AppFooter /></>;
      case "emergencySearch":
        if (currentUser?.type === "singer") return <SingerDashboard setSearchResults={setSearchResults} showAlert={showAlert} />;
        return <EmergencySearch
          showAlert={showAlert}
          revealContact={revealContact}
          showUpgradeModal={showUpgradeModal}
          setShowUpgradeModal={setShowUpgradeModal}
        />;
      case "pricing":
        return <PricingPage showAlert={showAlert} />;
      case "about":
        return <AboutPage />;
      default:
        return <LandingView setAdminMode={setAdminMode} />;
    }
  };

  return (
    <AppProvider value={__appContextValue}>
      <AlertBanner alert={alert} />
      {renderView()}
    </AppProvider>
  );
}