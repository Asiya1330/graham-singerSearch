import React from "react";
import { useAppContext } from "../AppContext";
import { APP_ROUTES, navClick } from "../lib/nav";

export function UrgentStrip() {
  const { setView } = useAppContext();

  return (
    <section className="bg-[#fdeceb] border border-[#f6cfcb] rounded-[14px] py-6 px-7 mt-5 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      <div className="flex items-center gap-4">
        <div className="flex-none w-[42px] h-[42px] rounded-full bg-white border border-[#f6cfcb] flex items-center justify-center text-xl">
          ⚡
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-[#dc2626]">Need someone on short notice?</h3>
          <p className="text-sm text-[#a4524c] mt-[3px] max-w-[60ch]">
            Search the Short-Notice Ready roster first, ranked by responsiveness, proximity, and role readiness. Built for replacements, concert soloists, and side-stage cover.
          </p>
        </div>
      </div>
      <a
        href={APP_ROUTES.organizationLogin}
        onClick={navClick(setView, "organizationLogin")}
        className="text-[14.5px] font-semibold rounded-[9px] bg-[#ef4444] text-white px-[22px] py-3 no-underline hover:bg-[#dc2626] transition-colors whitespace-nowrap inline-flex items-center justify-center gap-[7px]"
        data-testid="link-urgent-cta"
      >
        ⚡ Find short-notice cover
      </a>
    </section>
  );
}
