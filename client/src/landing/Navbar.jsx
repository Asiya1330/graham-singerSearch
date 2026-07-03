import React, { useState } from "react";
import { RolePickerModal } from "./RolePickerModal";

export function Navbar() {
  const [showRolePicker, setShowRolePicker] = useState(false);

  return (
    <>
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
