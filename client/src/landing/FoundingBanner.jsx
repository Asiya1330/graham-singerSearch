import React, { useState, useEffect } from "react";

export function FoundingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, o] = await Promise.all([
          fetch("/api/public/founding-status?type=singer").then(r => r.json()),
          fetch("/api/public/founding-status?type=org").then(r => r.json()),
        ]);
        if (s?.isAvailable || o?.isAvailable) setVisible(true);
      } catch {}
    })();
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-[#fdf6e3] border border-[#ecd9a6] rounded-[10px] py-[13px] px-[18px] mt-2 flex items-center gap-[10px] text-[13.5px] text-[#8a6d1f]">
      <span>☀️</span>
      <div>
        <b className="font-bold">Founding member program is open.</b>{" "}
        Singers get 12 months of Pro free, organizations 6 months. No cost during the founding period.
      </div>
    </div>
  );
}
