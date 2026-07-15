import React from "react";

export function FoundingBanner() {
  return (
    <div className="bg-[#fdf6e3] border border-[#ecd9a6] rounded-[10px] py-[13px] px-[18px] mt-2 flex items-center gap-[10px] text-[13.5px] text-[#8a6d1f]">
      <span>🌟</span>
      <div>
        <b className="font-bold">Founding Member spots are filling fast.</b>{" "}
        Join now to be considered for a free year of Pro.
      </div>
    </div>
  );
}
