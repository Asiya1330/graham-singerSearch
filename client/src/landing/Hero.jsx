import React from "react";
import { useAppContext } from "../AppContext";
import { accountIdentity, dashboardViewFor } from "./AccountMenu";

export function Hero() {
  const { setView, currentUser } = useAppContext();
  const identity = accountIdentity(currentUser);

  return (
    <header className="py-14 md:py-[56px] text-center max-w-[760px] mx-auto">
      <div className="text-xs font-semibold tracking-[0.12em] uppercase text-[#2563eb] mb-[18px]">
        {currentUser
          ? `Welcome back, ${identity.name}`
          : "Casting intelligence for the classical field"}
      </div>
      <h1 className="text-[clamp(32px,5.2vw,52px)] leading-[1.08] font-extrabold tracking-tight">
        Find the right voice, exactly when you need it.
      </h1>
      <p className="text-[clamp(16px,2vw,18px)] text-[#5b6470] mt-5 mx-auto max-w-[56ch] leading-relaxed">
        SingerSearch connects opera companies, orchestras, and performing arts
        organizations with verified professional singers, for planned seasons
        and for the call you have to make in the next hour.
      </p>
      {currentUser ? (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setView(dashboardViewFor(currentUser))}
            className="text-[15px] font-semibold rounded-[9px] bg-[#2563eb] text-white px-6 py-3 hover:bg-[#1d4ed8] transition-colors border-none cursor-pointer"
            data-testid="button-hero-dashboard"
          >
            Go to your dashboard
          </button>
          <button
            onClick={() => setView("pricing")}
            className="text-[15px] font-semibold text-[#2563eb] px-4 py-3 rounded-md hover:text-[#1d4ed8] hover:bg-blue-50 transition-colors bg-transparent border-none cursor-pointer"
          >
            See pricing
          </button>
        </div>
      ) : (
        <p className="text-[clamp(14px,1.6vw,16px)] text-[#5b6470] mt-4">
          Free to join. Free to search. No credit card. Upgrade when you need urgency and reach.{" "}
          <button
            onClick={() => setView("pricing")}
            className="text-[#2563eb] hover:text-[#1d4ed8] font-semibold bg-transparent border-none cursor-pointer underline underline-offset-2 text-[inherit]"
          >
            See pricing
          </button>
        </p>
      )}
    </header>
  );
}
