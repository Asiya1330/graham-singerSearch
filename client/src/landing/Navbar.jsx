import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAppContext } from "../AppContext";
import { RolePickerModal } from "./RolePickerModal";
import { AccountMenu, dashboardViewFor, accountIdentity } from "./AccountMenu";
import { logoutAccount } from "../lib/accountAuth";

export function Navbar() {
  const { setView, currentUser, setCurrentUser } = useAppContext();
  const identity = accountIdentity(currentUser);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const scrollToHow = () => {
    setMobileOpen(false);
    setView("landing");
    const tryScroll = (attempts) => {
      setTimeout(() => {
        const el = document.getElementById("how");
        if (el) {
          window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
        } else if (attempts < 15) {
          tryScroll(attempts + 1);
        }
      }, 50);
    };
    tryScroll(0);
  };

  const linkClass =
    "text-sm font-medium text-[#5b6470] no-underline hover:text-[#1f2733] hover:bg-black/5 px-2.5 py-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer";
  const mobileLinkClass =
    "w-full text-left px-1 py-3 text-base font-medium text-[#5b6470] hover:text-[#1f2733] transition-colors bg-transparent border-none cursor-pointer border-b border-[#e8eaed]";
  const loginClass =
    "text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors bg-transparent border-none cursor-pointer";

  return (
    <>
      <nav className="relative flex items-center justify-between py-[18px]">
        <button
          onClick={() => {
            setMobileOpen(false);
            setView("landing");
          }}
          className="text-xl font-bold tracking-tight text-[#1f2733] bg-transparent border-none cursor-pointer p-0 hover:opacity-80 transition-opacity"
        >
          Singer<span className="text-[#2563eb]">Search</span>
        </button>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={scrollToHow} className={linkClass}>
            How it works
          </button>
          <button
            onClick={() => setView("pricing")}
            className={linkClass}
          >
            Pricing
          </button>
          {currentUser ? (
            <>
              <button
                onClick={() => setView(dashboardViewFor(currentUser))}
                className={linkClass}
                data-testid="link-nav-dashboard"
              >
                Dashboard
              </button>
              <AccountMenu />
            </>
          ) : (
            <button
              onClick={() => setShowRolePicker(true)}
              className={loginClass}
              data-testid="link-nav-login"
            >
              Log in
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="sm:hidden inline-flex items-center justify-center p-2 -mr-2 rounded-md text-[#5b6470] hover:text-[#1f2733] hover:bg-black/5 transition-colors bg-transparent border-none cursor-pointer"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div
          className="sm:hidden flex flex-col pb-4 -mt-2"
          data-testid="mobile-nav-panel"
        >
          {currentUser && (
            <div className="flex items-center gap-2.5 px-1 py-3 border-b border-[#e8eaed]">
              <span className="w-8 h-8 rounded-full bg-[#2563eb] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {identity.initials}
              </span>
              <span className="flex flex-col leading-tight min-w-0">
                <span className="text-sm font-semibold text-[#1f2733] truncate">
                  {identity.name}
                </span>
                <span className="text-xs text-[#5b6470]">{identity.typeLabel}</span>
              </span>
            </div>
          )}
          <button onClick={scrollToHow} className={mobileLinkClass}>
            How it works
          </button>
          <button
            onClick={() => {
              setMobileOpen(false);
              setView("pricing");
            }}
            className={mobileLinkClass}
          >
            Pricing
          </button>
          {currentUser ? (
            <button
              onClick={() => {
                setMobileOpen(false);
                setView(dashboardViewFor(currentUser));
              }}
              className="w-full text-left px-1 py-3 text-base font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:bg-blue-50 rounded-md transition-colors bg-transparent border-none cursor-pointer"
              data-testid="link-nav-dashboard-mobile"
            >
              Go to dashboard
            </button>
          ) : null}
          {currentUser ? (
            <>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setView(currentUser.type === "organization" ? "orgSettings" : "singerSettings");
                }}
                className={mobileLinkClass}
                data-testid="link-nav-settings-mobile"
              >
                Settings
              </button>
              <button
                onClick={async () => {
                  setMobileOpen(false);
                  await logoutAccount();
                  setCurrentUser(null);
                  setView("landing");
                }}
                className="w-full text-left px-1 py-3 text-base font-medium text-red-600 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer border-b border-[#e8eaed]"
                data-testid="button-nav-logout-mobile"
              >
                Log out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMobileOpen(false);
                setShowRolePicker(true);
              }}
              className="w-full text-left px-1 py-3 text-base font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:bg-blue-50 rounded-md transition-colors bg-transparent border-none cursor-pointer"
              data-testid="link-nav-login-mobile"
            >
              Log in
            </button>
          )}
        </div>
      )}

      <RolePickerModal open={showRolePicker} onClose={() => setShowRolePicker(false)} />
    </>
  );
}
