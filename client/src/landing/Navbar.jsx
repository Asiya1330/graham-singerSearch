import React, { useState } from "react";
import { useAppContext } from "../AppContext";
import { RolePickerModal } from "./RolePickerModal";

export function Navbar() {
  const { setView } = useAppContext();
  const [showRolePicker, setShowRolePicker] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between py-[18px]">
        <button
          onClick={() => setView("landing")}
          className="text-xl font-bold tracking-tight text-[#1f2733] bg-transparent border-none cursor-pointer p-0"
        >
          Singer<span className="text-[#2563eb]">Search</span>
        </button>
        <div className="flex items-center gap-[18px]">
          <button
            onClick={() => {
              setView("landing");
              const tryScroll = (attempts) => {
                setTimeout(() => {
                  const el = document.getElementById("how");
                  if (el) {
                    window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
                  } else if (attempts < 15) {
                    tryScroll(attempts + 1);
                  }
                }, 50);
              };
              tryScroll(0);
            }}
            className="text-sm font-medium text-[#5b6470] no-underline hover:text-[#1f2733] transition-colors bg-transparent border-none cursor-pointer"
          >
            How it works
          </button>
          <button
            onClick={() => setView("pricing")}
            className="text-sm font-medium text-[#5b6470] no-underline hover:text-[#1f2733] transition-colors bg-transparent border-none cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => setShowRolePicker(true)}
            className="text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors bg-transparent border-none cursor-pointer"
            data-testid="link-nav-login"
          >
            Log in
          </button>
        </div>
      </nav>
      <RolePickerModal open={showRolePicker} onClose={() => setShowRolePicker(false)} />
    </>
  );
}
