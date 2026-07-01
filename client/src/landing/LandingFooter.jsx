import React from "react";
import { useAppContext } from "../AppContext";
import { APP_ROUTES, navClick } from "../lib/nav";

export function LandingFooter({ setAdminMode }) {
  const { setView } = useAppContext();

  const handleAdminClick = async () => {
    try {
      const res = await fetch("/api/admin/auth/check", { credentials: "include" });
      const data = await res.json();
      if (data.authenticated) {
        setAdminMode(true);
        setView("adminDashboard");
      } else {
        setView("adminLogin");
      }
    } catch {
      setView("adminLogin");
    }
  };

  return (
    <footer className="border-t border-[#e6e9ee] mt-[46px] py-[22px] pb-11 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[13px] text-[#8a93a0]">
      <div>© 2026 SingerSearch · Vocal Fold LLC</div>
      <div className="flex items-center">
        <button
          onClick={handleAdminClick}
          className="text-[#5b6470] hover:text-[#1f2733] transition-colors bg-transparent border-none cursor-pointer text-[13px] ml-[18px]"
          data-testid="link-footer-admin"
        >
          Admin
        </button>
        <a
          href={APP_ROUTES.terms}
          onClick={navClick(setView, "terms")}
          className="text-[#5b6470] no-underline hover:text-[#1f2733] transition-colors ml-[18px]"
          data-testid="link-footer-terms"
        >
          Terms
        </a>
        <a
          href={APP_ROUTES.privacy}
          onClick={navClick(setView, "privacy")}
          className="text-[#5b6470] no-underline hover:text-[#1f2733] transition-colors ml-[18px]"
          data-testid="link-footer-privacy"
        >
          Privacy
        </a>
        <a
          href={APP_ROUTES.singerLogin}
          onClick={navClick(setView, "singerLogin")}
          className="text-[#5b6470] no-underline hover:text-[#1f2733] transition-colors ml-[18px]"
          data-testid="link-footer-login"
        >
          Log in
        </a>
      </div>
    </footer>
  );
}
