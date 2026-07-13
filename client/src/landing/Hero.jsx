import React from "react";
import { useAppContext } from "../AppContext";

export function Hero() {
  const { setView } = useAppContext();

  return (
    <header className="py-14 md:py-[56px] text-center max-w-[760px] mx-auto">
      <div className="text-xs font-semibold tracking-[0.12em] uppercase text-[#2563eb] mb-[18px]">
        Casting intelligence for the classical field
      </div>
      <h1 className="text-[clamp(32px,5.2vw,52px)] leading-[1.08] font-extrabold tracking-tight">
        Find the right voice, exactly when you need it.
      </h1>
      <p className="text-[clamp(16px,2vw,18px)] text-[#5b6470] mt-5 mx-auto max-w-[56ch] leading-relaxed">
        SingerSearch connects opera companies, orchestras, and performing arts
        organizations with verified professional singers, for planned seasons
        and for the call you have to make in the next hour.
      </p>
      <p className="text-[clamp(14px,1.6vw,16px)] text-[#5b6470] mt-4">
        Free to join. Free to search. No credit card. Upgrade when you need urgency and reach.{" "}
        <button
          onClick={() => setView("pricing")}
          className="text-[#2563eb] hover:text-[#1d4ed8] font-semibold bg-transparent border-none cursor-pointer underline underline-offset-2 text-[inherit]"
        >
          See pricing
        </button>
      </p>
    </header>
  );
}
