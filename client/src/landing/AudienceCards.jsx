import React from "react";
import { useAppContext } from "../AppContext";
import { APP_ROUTES, navClick } from "../lib/nav";

export function AudienceCards() {
  const { setView } = useAppContext();

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-[14px] pb-2" id="how">
      {/* Organizations */}
      <div className="bg-white border border-[#e6e9ee] rounded-[14px] p-8 shadow-[0_1px_2px_rgba(31,39,51,0.04)] flex flex-col hover:shadow-[0_10px_30px_rgba(31,39,51,0.08)] hover:-translate-y-0.5 transition-all">
        <div className="text-xs font-semibold tracking-[0.08em] uppercase text-[#8a93a0] mb-[14px]">
          For organizations
        </div>
        <h2 className="text-[23px] font-bold tracking-tight leading-[1.2]">
          Search and contact verified singers
        </h2>
        <p className="text-[14.5px] text-[#5b6470] mt-3 mb-[26px] flex-1 leading-relaxed">
          Filter by voice type, repertoire, location, and availability. Reach
          professionals directly when a role opens or a last-minute replacement
          is needed.
        </p>
        <div className="flex items-center gap-[14px]">
          <a
            href={APP_ROUTES.orgRegister}
            onClick={navClick(setView, "orgRegister")}
            className="text-[14.5px] font-semibold rounded-[9px] bg-[#2563eb] text-white px-[22px] py-3 no-underline hover:bg-[#1d4ed8] transition-colors inline-flex items-center justify-center"
            data-testid="link-org-signup"
          >
            Find singers
          </a>
          <a
            href={APP_ROUTES.organizationLogin}
            onClick={navClick(setView, "organizationLogin")}
            className="text-[14.5px] font-semibold text-[#2563eb] px-1 py-3 no-underline hover:text-[#1d4ed8] transition-colors"
            data-testid="link-org-login"
          >
            Log in
          </a>
        </div>
      </div>

      {/* Singers */}
      <div className="bg-white border border-[#e6e9ee] rounded-[14px] p-8 shadow-[0_1px_2px_rgba(31,39,51,0.04)] flex flex-col hover:shadow-[0_10px_30px_rgba(31,39,51,0.08)] hover:-translate-y-0.5 transition-all">
        <div className="text-xs font-semibold tracking-[0.08em] uppercase text-[#8a93a0] mb-[14px]">
          For singers
        </div>
        <h2 className="text-[23px] font-bold tracking-tight leading-[1.2]">
          Be found on merit, not just connections
        </h2>
        <p className="text-[14.5px] text-[#5b6470] mt-3 mb-[26px] flex-1 leading-relaxed">
          Build a verified profile with your repertoire, roles, and availability,
          and become discoverable to the organizations casting your voice type.
        </p>
        <div className="flex items-center gap-[14px]">
          <a
            href={APP_ROUTES.singerRegister}
            onClick={navClick(setView, "singerRegister")}
            className="text-[14.5px] font-semibold rounded-[9px] bg-[#2563eb] text-white px-[22px] py-3 no-underline hover:bg-[#1d4ed8] transition-colors inline-flex items-center justify-center"
            data-testid="link-singer-signup"
          >
            Create your profile
          </a>
          <a
            href={APP_ROUTES.singerLogin}
            onClick={navClick(setView, "singerLogin")}
            className="text-[14.5px] font-semibold text-[#2563eb] px-1 py-3 no-underline hover:text-[#1d4ed8] transition-colors"
            data-testid="link-singer-login"
          >
            Log in
          </a>
        </div>
      </div>
    </section>
  );
}
