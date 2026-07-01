import React from "react";
import { useAppContext } from "./AppContext";
import { Navbar } from "./landing/Navbar";
import { FoundingBanner } from "./landing/FoundingBanner";
import { Hero } from "./landing/Hero";
import { AudienceCards } from "./landing/AudienceCards";
import { UrgentStrip } from "./landing/UrgentStrip";
import { TrustRow } from "./landing/TrustRow";
import { LandingFooter } from "./landing/LandingFooter";

export function LandingView({ setAdminMode }) {
  const { setView } = useAppContext();

  // Hidden admin keyboard trigger: typing "admin" within 2s navigates to admin login.
  React.useEffect(() => {
    const TARGET = ["a", "d", "m", "i", "n"];
    let buffer = [];
    let timer = null;
    const reset = () => { buffer = []; if (timer) { clearTimeout(timer); timer = null; } };
    const onKeyDown = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target && e.target.isContentEditable)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = (e.key || "").toLowerCase();
      if (key.length !== 1) return;
      buffer.push(key);
      if (buffer.length > TARGET.length) buffer = buffer.slice(-TARGET.length);
      if (timer) clearTimeout(timer);
      timer = setTimeout(reset, 2000);
      if (buffer.length === TARGET.length && buffer.every((k, i) => k === TARGET[i])) {
        reset();
        (async () => {
          try {
            const res = await fetch("/api/admin/auth/check", { credentials: "include" });
            const data = await res.json();
            if (data.authenticated) { setAdminMode(true); setView("adminDashboard"); }
            else setView("adminLogin");
          } catch {
            setView("adminLogin");
          }
        })();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); if (timer) clearTimeout(timer); };
  }, []);

  return (
    <div className="bg-[#f6f7f9] text-[#1f2733] min-h-screen" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <div className="max-w-[1080px] mx-auto px-6">
        <Navbar />
        <FoundingBanner />
        <Hero />
        <AudienceCards />
        <UrgentStrip />
        <TrustRow />
        <LandingFooter setAdminMode={setAdminMode} />
      </div>
    </div>
  );
}
