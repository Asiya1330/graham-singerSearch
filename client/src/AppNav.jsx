import React, { useEffect, useState } from "react";
import { CheckCircle, ClipboardList, Heart, Menu, X, Zap } from "lucide-react";
import singerSearchLogo from "@assets/Singer_Search_Logo_May_2026_1777734809747.png";
import { useAppContext } from "./AppContext";
import { logoutAccount } from "./lib/accountAuth";

// Single source of truth for the authenticated navbars. Both the dashboard and
// settings pages for a given role render the same component, so the logo size,
// nav items, and styling can never drift apart between pages.

const NAV_WRAPPER = "bg-[#121212] border-b border-white/10 sticky top-0 z-50";
const LOGO_CLASS = "h-full object-contain brightness-0 invert";
const ITEM_BASE =
  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors";
const ITEM_ACTIVE = `border-[#3B82F6] text-white ${ITEM_BASE}`;
const ITEM_INACTIVE = `border-transparent text-white/40 hover:text-white/80 cursor-pointer ${ITEM_BASE}`;
const MOBILE_ITEM_BASE =
  "w-full text-left px-1 py-3 text-base font-medium transition-colors bg-transparent border-none cursor-pointer border-b border-white/10";
const MOBILE_ITEM_ACTIVE = `${MOBILE_ITEM_BASE} text-white`;
const MOBILE_ITEM_INACTIVE = `${MOBILE_ITEM_BASE} text-white/50 hover:text-white/80`;

// Clears the Supabase session (so no further API call carries a token) and
// tears down any leftover legacy cookie.
async function logout() {
  await logoutAccount();
}

function useCloseOnEscape(open, setOpen) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);
}

function MobileMenuButton({ open, onToggle }) {
  return (
    <button
      type="button"
      className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors bg-transparent border-none cursor-pointer"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onToggle}
    >
      {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
}

export function SingerNav() {
  const { view, setView, currentUser, setCurrentUser, setSelectedSinger, setSearchResults } =
    useAppContext();
  const user = currentUser?.data ?? currentUser ?? {};
  const isPro = user.subscription_tier === "pro";
  const onSettings = view === "singerSettings";
  const [mobileOpen, setMobileOpen] = useState(false);
  useCloseOnEscape(mobileOpen, setMobileOpen);

  const goToSubscription = () => {
    setMobileOpen(false);
    const scroll = () => {
      const el = document.getElementById("singer-subscription-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (onSettings) {
      scroll();
    } else {
      setView("singerSettings");
      setTimeout(scroll, 100);
    }
  };

  const handleSignOut = async () => {
    setMobileOpen(false);
    await logout();
    setView("landing", { replace: true });
    setCurrentUser(null);
    setSearchResults?.([]);
  };

  const go = (nextView, extra) => {
    setMobileOpen(false);
    extra?.();
    setView(nextView);
  };

  return (
    <nav className={NAV_WRAPPER}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex min-w-0">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer pr-6"
              onClick={() => go("singerDashboard")}
            >
              <img src={singerSearchLogo} alt="SingerSearch" className={LOGO_CLASS} />
            </div>
            <div className="hidden sm:flex sm:space-x-6">
              <span
                className={onSettings ? ITEM_INACTIVE : ITEM_ACTIVE}
                onClick={() => setView("singerDashboard")}
              >
                Dashboard
              </span>
              <span
                className={ITEM_INACTIVE}
                onClick={() => {
                  setSelectedSinger?.({ ...user, previewMode: true });
                  setView("profileView");
                }}
                data-testid="link-preview-my-profile"
              >
                Preview My Profile
              </span>
              <span
                className={ITEM_INACTIVE}
                onClick={goToSubscription}
                data-testid="link-my-subscription"
              >
                My Subscription
              </span>
              <span
                className={onSettings ? ITEM_ACTIVE : ITEM_INACTIVE}
                onClick={() => setView("singerSettings")}
              >
                Account &amp; Profile
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {!isPro && (
              <button
                onClick={() => go("pricing")}
                className="hidden sm:inline-flex text-xs font-semibold text-white bg-[#3B82F6] hover:bg-blue-500 px-3 py-1.5 rounded transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
            <div className="hidden sm:flex items-center">
              <span className="text-white/50 text-sm font-medium mr-4">
                {user.first_name} {user.last_name}
              </span>
              <button
                onClick={handleSignOut}
                className="text-white/30 hover:text-white/60 text-sm transition-colors"
              >
                Sign out
              </button>
            </div>
            <MobileMenuButton open={mobileOpen} onToggle={() => setMobileOpen((o) => !o)} />
          </div>
        </div>

        {mobileOpen && (
          <div
            className="sm:hidden flex flex-col pb-4 border-t border-white/10 pt-1"
            data-testid="singer-mobile-nav"
          >
            <button
              type="button"
              className={onSettings ? MOBILE_ITEM_INACTIVE : MOBILE_ITEM_ACTIVE}
              onClick={() => go("singerDashboard")}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={MOBILE_ITEM_INACTIVE}
              onClick={() =>
                go("profileView", () => setSelectedSinger?.({ ...user, previewMode: true }))
              }
              data-testid="link-preview-my-profile-mobile"
            >
              Preview My Profile
            </button>
            <button
              type="button"
              className={MOBILE_ITEM_INACTIVE}
              onClick={goToSubscription}
              data-testid="link-my-subscription-mobile"
            >
              My Subscription
            </button>
            <button
              type="button"
              className={onSettings ? MOBILE_ITEM_ACTIVE : MOBILE_ITEM_INACTIVE}
              onClick={() => go("singerSettings")}
            >
              Account &amp; Profile
            </button>
            {!isPro && (
              <button
                type="button"
                className={`${MOBILE_ITEM_INACTIVE} text-[#3B82F6] hover:text-blue-400`}
                onClick={() => go("pricing")}
              >
                Upgrade to Pro
              </button>
            )}
            <div className="flex items-center justify-between pt-3 px-1">
              <span className="text-white/50 text-sm font-medium">
                {user.first_name} {user.last_name}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-white/40 hover:text-white/70 text-sm transition-colors bg-transparent border-none cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export function OrgNav() {
  const {
    view,
    setView,
    currentUser,
    setCurrentUser,
    orgTab,
    setOrgTab,
    shortlistedIds,
    setShowUpgradeModal,
    setSearchResults,
  } = useAppContext();
  const user = currentUser?.data ?? currentUser ?? {};
  const isPro = user.subscription_tier === "pro";
  const shortlistCount = shortlistedIds?.size ?? 0;
  const onDashboard = view === "orgDashboard";
  const [mobileOpen, setMobileOpen] = useState(false);
  useCloseOnEscape(mobileOpen, setMobileOpen);

  // A tab is highlighted only while on the dashboard showing that tab.
  const tabClass = (tab, extra = "") =>
    `${
      onDashboard && orgTab === tab
        ? "border-[#3B82F6] text-white"
        : "border-transparent text-white/40 hover:text-white/80"
    } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium cursor-pointer ${extra} transition-colors`;

  const mobileTabClass = (tab) =>
    onDashboard && orgTab === tab ? MOBILE_ITEM_ACTIVE : MOBILE_ITEM_INACTIVE;

  const goToTab = (tab) => {
    setMobileOpen(false);
    setOrgTab?.(tab);
    setView("orgDashboard");
  };

  const handleSignOut = async () => {
    setMobileOpen(false);
    await logout();
    setView("landing", { replace: true });
    setCurrentUser(null);
    setSearchResults?.([]);
  };

  return (
    <nav className={NAV_WRAPPER}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex min-w-0">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer pr-6"
              onClick={() => goToTab("search")}
            >
              <img src={singerSearchLogo} alt="SingerSearch" className={LOGO_CLASS} />
            </div>
            <div className="hidden sm:flex sm:space-x-2">
              <span className={tabClass("search")} onClick={() => goToTab("search")}>
                Search
              </span>
              <span
                className={tabClass("contacts", "gap-1.5")}
                onClick={() => goToTab("contacts")}
                data-testid="nav-contacts"
              >
                <ClipboardList className="w-4 h-4" /> Contacts
              </span>
              <span
                className={tabClass("shortlist", "gap-1.5")}
                onClick={() => goToTab("shortlist")}
                data-testid="nav-shortlist"
              >
                <Heart className={`w-4 h-4 ${shortlistCount > 0 ? "fill-current" : ""}`} /> My Shortlist
                {shortlistCount > 0 && (
                  <span
                    className="ml-0.5 text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded-full"
                    data-testid="badge-shortlist-count"
                  >
                    {shortlistCount}
                  </span>
                )}
              </span>
              <button
                onClick={() => (isPro ? setView("emergencySearch") : setShowUpgradeModal?.(true))}
                className="text-white/40 hover:text-red-400 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                Urgent
              </button>
              <span
                className={`${
                  view === "orgSettings"
                    ? "border-[#3B82F6] text-white"
                    : "border-transparent text-white/40 hover:text-white/80"
                } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium cursor-pointer transition-colors`}
                onClick={() => setView("orgSettings")}
              >
                Settings
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {!isPro && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setView("pricing");
                }}
                className="hidden sm:inline-flex text-xs font-semibold text-white bg-[#3B82F6] hover:bg-blue-500 px-3 py-1.5 rounded transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
            <div className="hidden sm:flex items-center">
              <span className="text-white/50 text-sm font-medium mr-4 flex items-center gap-2">
                {user.organization_name}
                {user.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-400" title="Verified Organization" />
                )}
              </span>
              <button
                onClick={handleSignOut}
                className="text-white/30 hover:text-white/60 text-sm transition-colors"
              >
                Sign out
              </button>
            </div>
            <MobileMenuButton open={mobileOpen} onToggle={() => setMobileOpen((o) => !o)} />
          </div>
        </div>

        {mobileOpen && (
          <div
            className="sm:hidden flex flex-col pb-4 border-t border-white/10 pt-1"
            data-testid="org-mobile-nav"
          >
            <button
              type="button"
              className={mobileTabClass("search")}
              onClick={() => goToTab("search")}
            >
              Search
            </button>
            <button
              type="button"
              className={`${mobileTabClass("contacts")} inline-flex items-center gap-2`}
              onClick={() => goToTab("contacts")}
              data-testid="nav-contacts-mobile"
            >
              <ClipboardList className="w-4 h-4" /> Contacts
            </button>
            <button
              type="button"
              className={`${mobileTabClass("shortlist")} inline-flex items-center gap-2`}
              onClick={() => goToTab("shortlist")}
              data-testid="nav-shortlist-mobile"
            >
              <Heart className={`w-4 h-4 ${shortlistCount > 0 ? "fill-current" : ""}`} />
              My Shortlist
              {shortlistCount > 0 && (
                <span
                  className="ml-0.5 text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded-full"
                  data-testid="badge-shortlist-count-mobile"
                >
                  {shortlistCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`${MOBILE_ITEM_INACTIVE} inline-flex items-center gap-2 hover:text-red-400`}
              onClick={() => {
                setMobileOpen(false);
                if (isPro) setView("emergencySearch");
                else setShowUpgradeModal?.(true);
              }}
            >
              <Zap className="w-4 h-4" />
              Urgent
            </button>
            <button
              type="button"
              className={
                view === "orgSettings" ? MOBILE_ITEM_ACTIVE : MOBILE_ITEM_INACTIVE
              }
              onClick={() => {
                setMobileOpen(false);
                setView("orgSettings");
              }}
            >
              Settings
            </button>
            {!isPro && (
              <button
                type="button"
                className={`${MOBILE_ITEM_INACTIVE} text-[#3B82F6] hover:text-blue-400`}
                onClick={() => {
                  setMobileOpen(false);
                  setView("pricing");
                }}
              >
                Upgrade to Pro
              </button>
            )}
            <div className="flex items-center justify-between pt-3 px-1 gap-3">
              <span className="text-white/50 text-sm font-medium flex items-center gap-2 min-w-0 truncate">
                {user.organization_name}
                {user.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" title="Verified Organization" />
                )}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-white/40 hover:text-white/70 text-sm transition-colors bg-transparent border-none cursor-pointer flex-shrink-0"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
