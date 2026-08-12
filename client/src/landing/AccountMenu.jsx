import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useAppContext } from "../AppContext";
import { logoutAccount } from "../lib/accountAuth";

/** Display name and initials for either account shape. */
export function accountIdentity(currentUser) {
  if (!currentUser?.data) return { name: "", initials: "?", typeLabel: "" };
  const { type, data } = currentUser;

  if (type === "organization") {
    const name = data.organization_name || data.email || "Organization";
    return {
      name,
      initials: initialsFrom(name),
      typeLabel: "Organization",
      email: data.email,
    };
  }

  const full = `${data.first_name || ""} ${data.last_name || ""}`.trim();
  const name = full || data.email || "Singer";
  return {
    name,
    initials: initialsFrom(full || data.email || ""),
    typeLabel: "Singer",
    email: data.email,
  };
}

function initialsFrom(value) {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function dashboardViewFor(currentUser) {
  return currentUser?.type === "organization" ? "orgDashboard" : "singerDashboard";
}

function settingsViewFor(currentUser) {
  return currentUser?.type === "organization" ? "orgSettings" : "singerSettings";
}

/**
 * Signed-in control for the marketing header. Mirrors the landing page's
 * light palette rather than the dark in-app navbar.
 */
export function AccountMenu() {
  const { currentUser, setCurrentUser, setView } = useAppContext();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!currentUser) return null;
  const { name, initials, typeLabel, email } = accountIdentity(currentUser);

  const go = (view) => {
    setOpen(false);
    setView(view);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logoutAccount();
    setCurrentUser(null);
    setView("landing");
  };

  const itemClass =
    "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#1f2733] hover:bg-black/5 transition-colors bg-transparent border-none cursor-pointer text-left";

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-[#e8eaed] bg-white hover:bg-black/[0.03] transition-colors cursor-pointer"
        data-testid="button-account-menu"
      >
        <span className="w-7 h-7 rounded-full bg-[#2563eb] text-white text-xs font-semibold flex items-center justify-center">
          {initials}
        </span>
        <span className="hidden md:flex flex-col items-start leading-tight">
          <span className="text-xs font-semibold text-[#1f2733] max-w-[140px] truncate">
            {name}
          </span>
          <span className="text-[10px] text-[#5b6470]">{typeLabel}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-[#5b6470]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-lg border border-[#e8eaed] bg-white shadow-lg py-1 z-50"
          data-testid="menu-account"
        >
          <div className="px-3 py-2 border-b border-[#e8eaed]">
            <p className="text-sm font-semibold text-[#1f2733] truncate">{name}</p>
            {email && <p className="text-xs text-[#5b6470] truncate">{email}</p>}
            <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-[#2563eb]">
              {typeLabel}
            </span>
          </div>
          <button
            className={itemClass}
            onClick={() => go(dashboardViewFor(currentUser))}
            data-testid="link-account-dashboard"
          >
            <LayoutDashboard className="w-4 h-4 text-[#5b6470]" />
            Dashboard
          </button>
          <button
            className={itemClass}
            onClick={() => go(settingsViewFor(currentUser))}
            data-testid="link-account-settings"
          >
            <Settings className="w-4 h-4 text-[#5b6470]" />
            Settings
          </button>
          <div className="my-1 border-t border-[#e8eaed]" />
          <button
            className={`${itemClass} text-red-600 hover:bg-red-50`}
            onClick={handleLogout}
            data-testid="button-account-logout"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
