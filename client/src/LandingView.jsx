import React, { useState, useEffect } from "react";
import { BarChart2, CheckCircle, Clock, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import singerSearchLogo from "@assets/Singer_Search_Logo_May_2026_1777734809747.png";
import logo1 from "./assets/logos/logo_1.png";
import logo2 from "./assets/logos/logo_2.png";
import logo3 from "./assets/logos/logo_3.png";
import logo4 from "./assets/logos/logo_4.png";
import { useAppContext } from "./AppContext";
import { FeaturedSingers } from "./pages/home";
import { APP_ROUTES, navClick, navigateToView } from "./lib/nav";

export function LandingView({ setAdminMode }) {
  const { setView } = useAppContext();

    const [heroVoice, setHeroVoice] = React.useState("");
    const [heroRole, setHeroRole] = React.useState("");
    const [foundingSinger, setFoundingSinger] = React.useState(null);
    const [foundingOrg, setFoundingOrg] = React.useState(null);

    React.useEffect(() => {
      (async () => {
        try {
          const [s, o] = await Promise.all([
            fetch("/api/public/founding-status?type=singer").then(r => r.json()),
            fetch("/api/public/founding-status?type=org").then(r => r.json()),
          ]);
          setFoundingSinger(s); setFoundingOrg(o);
        } catch {}
      })();
    }, []);

    const handleHeroSearch = () => navigateToView(setView, "organizationLogin");

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
      <div className="min-h-screen bg-[#121212] text-white">

        {/* Slim fixed header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-white/5 h-11 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button onClick={() => navigateToView(setView, "landing")} className="flex-shrink-0">
                <img src={singerSearchLogo} alt="SingerSearch" className="h-8 object-contain brightness-0 invert" />
              </button>
              <nav className="hidden md:flex items-center gap-6">
                <button onClick={() => setView("about")} className="text-xs text-white/40 hover:text-white/80 transition-colors">About</button>
                <button onClick={() => setView("pricing")} className="text-xs text-white/40 hover:text-white/80 transition-colors">Pricing</button>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={APP_ROUTES.singerLogin}
                onClick={navClick(setView, "singerLogin")}
                className="border border-white/20 hover:border-white/40 text-white/60 hover:text-white text-xs font-medium px-4 py-1.5 rounded transition-colors"
                data-testid="link-nav-singer-login"
              >
                Singer Login
              </a>
              <a
                href={APP_ROUTES.organizationLogin}
                onClick={navClick(setView, "organizationLogin")}
                className="bg-[#3B82F6] hover:bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded transition-colors"
                data-testid="link-nav-org-login"
              >
                Organization Login
              </a>
            </div>
          </div>
        </header>

        {/* System status bar */}
        <div className="fixed top-11 left-0 right-0 z-40 bg-[#0D1017] border-b border-white/5 h-7 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px] text-white/30 uppercase tracking-widest" data-testid="text-system-status">
              System Online &nbsp;·&nbsp;
              {foundingSinger?.isAvailable
                ? <>🎉 Founding Singer Program — {foundingSinger.spotsRemaining}/{foundingSinger.spotsTotal} spots left (1 yr Pro free)</>
                : <>{foundingSinger ? foundingSinger.spotsTaken : 0} Singers Registered</>}
              &nbsp;·&nbsp;
              {foundingOrg?.isAvailable
                ? <>🎉 Founding Org Program — {foundingOrg.spotsRemaining}/{foundingOrg.spotsTotal} spots left (1 yr Pro free)</>
                : <>Database Current</>}
            </span>
          </div>
        </div>

        {/* Hero — Command Center */}
        <div className="pt-[72px] min-h-[90vh] flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="max-w-3xl">

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="text-6xl md:text-[88px] font-extrabold leading-[1] mb-3 tracking-tight"
                data-testid="heading-brand"
              >
                Singer<span className="text-[#3B82F6]">Search</span>
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-xl md:text-2xl font-medium text-white/70 mb-5 tracking-tight"
                data-testid="heading-tagline"
              >
                Professional Singer Intelligence Platform
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-white/45 text-lg mb-10 max-w-xl leading-relaxed"
              >
                Verified database of professional classical vocalists. Search by role, confirmed availability, and verified performance history.
              </motion.p>

              {/* Embedded search widget */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-[#111520] border border-white/10 rounded-lg overflow-hidden mb-5"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
                  <div className="p-4">
                    <label className="block font-mono text-[10px] text-white/25 uppercase tracking-widest mb-2">Voice Type</label>
                    <select
                      value={heroVoice}
                      onChange={e => setHeroVoice(e.target.value)}
                      className="bg-transparent text-white text-sm font-medium w-full focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#111520]">Any</option>
                      <option value="Soprano" className="bg-[#111520]">Soprano</option>
                      <option value="Mezzo-Soprano" className="bg-[#111520]">Mezzo-Soprano</option>
                      <option value="Tenor" className="bg-[#111520]">Tenor</option>
                      <option value="Baritone" className="bg-[#111520]">Baritone</option>
                      <option value="Bass" className="bg-[#111520]">Bass</option>
                      <option value="Countertenor" className="bg-[#111520]">Countertenor</option>
                    </select>
                  </div>
                  <div className="p-4">
                    <label className="block font-mono text-[10px] text-white/25 uppercase tracking-widest mb-2">Role / Work</label>
                    <input
                      type="text"
                      placeholder="e.g. Carmen"
                      value={heroRole}
                      onChange={e => setHeroRole(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleHeroSearch()}
                      className="bg-transparent text-white text-sm font-medium w-full focus:outline-none placeholder-white/15"
                    />
                  </div>
                  <div className="p-4">
                    <label className="block font-mono text-[10px] text-white/25 uppercase tracking-widest mb-2">Availability</label>
                    <span className="text-white/20 text-sm">Any dates</span>
                  </div>
                  <div className="p-4">
                    <label className="block font-mono text-[10px] text-white/25 uppercase tracking-widest mb-2">Location</label>
                    <span className="text-white/20 text-sm">All markets</span>
                  </div>
                </div>
                <div className="border-t border-white/5 px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/15 uppercase tracking-widest">100 Verified Professionals Indexed</span>
                  <button
                    onClick={handleHeroSearch}
                    className="bg-[#3B82F6] hover:bg-blue-500 text-white text-sm font-bold px-6 py-2 rounded transition-colors flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" /> Search Database
                  </button>
                </div>
              </motion.div>

              <p className="text-white/25 text-xs font-mono">
                Singer?{" "}
                <a
                  href={APP_ROUTES.singerRegister}
                  onClick={navClick(setView, "singerRegister")}
                  className="text-[#3B82F6] hover:text-blue-400 transition-colors"
                >
                  Create your profile →
                </a>
                {"  ·  "}
                Search is free. Confidence data requires a Pro subscription.
              </p>
            </div>
          </div>
        </div>

        {/* Data counters */}
        <div className="border-t border-white/5 bg-[#0D1017]">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { num: "100+", label: "Verified Professionals", sub: "Admin-reviewed" },
                { num: "7", label: "Partner Organizations", sub: "Opera & orchestral" },
                { num: "1,200+", label: "Performances Tracked", sub: "In the database" },
                { num: "3", label: "Confidence Tiers", sub: "Self-Reported → Verified" },
              ].map(({ num, label, sub }) => (
                <div key={label}>
                  <p className="font-mono text-3xl font-bold text-[#3B82F6] mb-1 tabular-nums">{num}</p>
                  <p className="text-sm font-semibold text-white/60">{label}</p>
                  <p className="font-mono text-[10px] text-white/25 uppercase tracking-wider mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust logos */}
        <div className="border-t border-white/5 bg-[#0D1017] py-8">
          <div className="max-w-7xl mx-auto px-6">
            <p className="font-mono text-[10px] text-white/15 uppercase tracking-widest mb-6">Trusted By Opera Companies, Presenters, And Festivals</p>
            <div className="flex flex-wrap items-center gap-12 grayscale brightness-75 opacity-25">
              <img src={logo1} alt="Opera Company" className="h-7 object-contain" />
              <img src={logo2} alt="Festival" className="h-7 object-contain" />
              <img src={logo3} alt="Symphony" className="h-7 object-contain" />
              <img src={logo4} alt="Conservatory" className="h-7 object-contain" />
            </div>
          </div>
        </div>

        {/* Feature panels */}
        <div className="border-t border-white/5 bg-[#121212] py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5 border border-white/5">
              {[
                {
                  icon: <CheckCircle className="w-5 h-5" />,
                  title: "Verified Professionals",
                  body: "Every singer is reviewed and approved by an administrator. No students, no hobbyists. Only career professionals with confirmed credits.",
                  stat: "100% admin-reviewed",
                },
                {
                  icon: <Clock className="w-5 h-5" />,
                  title: "Real Availability",
                  body: "Search by specific production dates. See confirmed availability windows — not just \"contact for availability.\" Direct calendar data from singers.",
                  stat: "Maintained by singers",
                },
                {
                  icon: <BarChart2 className="w-5 h-5" />,
                  title: "Reputation Intelligence",
                  body: "Reliability scores and confidence tiers built from real engagement feedback. Know exactly how verified each singer is before you reach out.",
                  stat: "Pro subscription required",
                },
              ].map(({ icon, title, body, stat }) => (
                <div key={title} className="p-8">
                  <div className="text-[#3B82F6] mb-4">{icon}</div>
                  <h3 className="text-sm font-bold text-white mb-3">{title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed mb-6">{body}</p>
                  <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest">{stat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured singers from live database */}
        <div className="border-t border-white/5 bg-[#0D1017] py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-xl font-bold text-white mb-2">Featured Singers</h2>
            <p className="text-white/35 text-sm font-mono mb-8">
              Admin-approved professionals currently in the database
            </p>
            <FeaturedSingers limit={8} />
          </div>
        </div>

        {/* Final CTA */}
        <div className="border-t border-white/5 bg-[#111520] py-14">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Ready to find your next singer?</h2>
              <p className="text-white/35 text-sm font-mono">Search is free. Confidence and speed are worth paying for.</p>
            </div>
            <div className="flex gap-3">
              <a
                href={APP_ROUTES.organizationLogin}
                onClick={navClick(setView, "organizationLogin")}
                className="bg-[#3B82F6] hover:bg-blue-500 text-white font-bold px-7 py-2.5 rounded text-sm transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Search Database
              </a>
              <a
                href={APP_ROUTES.singerLogin}
                onClick={navClick(setView, "singerLogin")}
                className="border border-white/15 text-white/50 hover:text-white hover:border-white/30 font-medium px-7 py-2.5 rounded text-sm transition-colors"
              >
                Singer Portal
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 bg-[#121212] py-5">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-white/15 uppercase tracking-widest">Singer Search · Professional Casting Intelligence</span>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/admin/auth/check", { credentials: "include" });
                    const data = await res.json();
                    if (data.authenticated) { setAdminMode(true); setView("adminDashboard"); }
                    else setView("adminLogin");
                  } catch {
                    setView("adminLogin");
                  }
                }}
                className="text-[10px] text-white/20 hover:text-white/40 transition-colors font-mono"
                data-testid="link-footer-admin"
              >
                Admin
              </button>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={() => setView("about")} className="text-[10px] text-white/20 hover:text-white/40 transition-colors font-mono uppercase tracking-wide">About</button>
              <button onClick={() => setView("pricing")} className="text-[10px] text-white/20 hover:text-white/40 transition-colors font-mono uppercase tracking-wide">Pricing</button>
            </div>
          </div>
        </div>

      </div>
    );
}
