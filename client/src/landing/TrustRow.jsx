import React from "react";

const items = [
  { icon: "✓", title: "Verified network", desc: "Every profile is reviewed, so a search result is someone you can actually call." },
  { icon: "⚡", title: "Built for urgency", desc: "Availability and short-notice status are first-class, not an afterthought." },
  { icon: "♪", title: "The full field", desc: "Principal and chorus, planned casting and last-minute replacement." },
];

export function TrustRow() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-[18px] pt-[34px] pb-[10px]">
      {items.map(({ icon, title, desc }) => (
        <div key={title} className="bg-white border border-[#e6e9ee] rounded-xl p-[22px_20px]">
          <div className="w-[30px] h-[30px] rounded-lg bg-[#eef2fd] flex items-center justify-center mb-3 text-[15px]">
            {icon}
          </div>
          <strong className="block text-[14.5px] font-bold mb-[5px]">{title}</strong>
          <span className="text-[13.5px] text-[#5b6470] leading-[1.55]">{desc}</span>
        </div>
      ))}
    </section>
  );
}
