import React from "react";
import { CheckCircle, ClipboardList, Heart, Zap } from "lucide-react";
import singerSearchLogo from "@assets/Singer_Search_Logo_May_2026_1777734809747.png";
import { useAppContext } from "./AppContext";

// Single source of truth for the authenticated navbars. Both the dashboard and
// settings pages for a given role render the same component, so the logo size,
// nav items, and styling can never drift apart between pages.

const NAV_WRAPPER = "bg-[#121212] border-b border-white/10 sticky top-0 z-50";
const LOGO_CLASS = "h-full object-contain brightness-0 invert";
const ITEM_BASE =
  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors";
const ITEM_ACTIVE = `border-[#3B82F6] text-white ${ITEM_BASE}`;
const ITEM_INACTIVE = `border-transparent text-white/40 hover:text-white/80 cursor-pointer ${ITEM_BASE}`;

async function logout() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export function SingerNav() {
  const { view, setView, currentUser, setCurrentUser, setSelectedSinger, setSearchResults } =
    useAppContext();
  const user = currentUser?.data ?? currentUser ?? {};
  const isPro = user.subscription_tier === "pro";
  const onSettings = view === "singerSettings";

  const goToSubscription = () => {
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
    await logout();
    setView("landing", { replace: true });
    setCurrentUser(null);
    setSearchResults?.([]);
  };

  return (
    <nav className={NAV_WRAPPER}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer pr-6"
              onClick={() => setView("singerDashboard")}
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
          <div className="flex items-center gap-4">
            {!isPro && (
              <button
                onClick={() => setView("pricing")}
                className="text-xs font-semibold text-white bg-[#3B82F6] hover:bg-blue-500 px-3 py-1.5 rounded transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
            <div className="flex items-center">
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
          </div>
        </div>
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

  // A tab is highlighted only while on the dashboard showing that tab.
  const tabClass = (tab, extra = "") =>
    `${
      onDashboard && orgTab === tab
        ? "border-[#3B82F6] text-white"
        : "border-transparent text-white/40 hover:text-white/80"
    } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium cursor-pointer ${extra} transition-colors`;

  const goToTab = (tab) => {
    setOrgTab?.(tab);
    setView("orgDashboard");
  };

  const handleSignOut = async () => {
    await logout();
    setView("landing", { replace: true });
    setCurrentUser(null);
    setSearchResults?.([]);
  };

  return (
    <nav className={NAV_WRAPPER}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
