import React from "react";
import { useAppContext } from "../AppContext";
import { APP_ROUTES, navClick } from "../lib/nav";

export function Navbar() {
  const { setView } = useAppContext();

  return (
    <nav className="flex items-center justify-between py-[18px]">
      <div className="text-xl font-bold tracking-tight text-[#1f2733]">
        Singer<span className="text-[#2563eb]">Search</span>
      </div>
      <div className="flex items-center gap-[18px]">
        <a
          href="#how"
          className="text-sm font-medium text-[#5b6470] no-underline hover:text-[#1f2733] transition-colors"
        >
          How it works
        </a>
        <a
          href={APP_ROUTES.singerLogin}
          onClick={navClick(setView, "singerLogin")}
          className="text-sm font-semibold text-[#2563eb] no-underline hover:text-[#1d4ed8] transition-colors"
          data-testid="link-nav-login"
        >
          Log in
        </a>
      </div>
    </nav>
  );
}
