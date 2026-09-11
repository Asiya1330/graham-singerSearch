// client/src/pages/SingersLanding.tsx
//
// Dedicated singer-acquisition landing page for paid traffic.
// Route: /singers   (see route snippet at the bottom of this file)
//
// No new dependencies, no API calls, no backend changes.
// Every CTA links to the existing /register/singer flow.
// Headings use <h1>/<h2>/<h3> so they inherit the site's Outfit font from global CSS.

import { useEffect } from "react";
import { Link } from "wouter";

const REGISTER = "/register/singer";
const LOGIN = "/login/singer";
const PAGE_TITLE = "Get found for your next engagement | SingerSearch";
const PAGE_DESCRIPTION =
  "A free professional profile that helps opera companies, orchestras, choruses, and presenters find you when they're casting.";

const benefits = [
  {
    title: "Searchable by what you actually do",
    body: "Companies search by voice type, repertoire, roles you've performed, location, and when you're free — not by whose list you're on.",
  },
  {
    title: "Built only for professional singers",
    body: "This isn't a general talent site. Every profile belongs to a working classical or crossover singer, which is exactly why casting teams search here.",
  },
  {
    title: "First call when someone drops out",
    body: "Companies lose a singer days before opening more often than anyone admits. Mark yourself available on short notice and be in front of them at the moment it matters.",
  },
  {
    title: "Verified profiles",
    body: "Verification is what makes casting teams trust the results — and what makes your profile worth something once you're in them.",
  },
];

const steps = [
  {
    n: "1",
    title: "Create your profile",
    body: "Voice type, repertoire and roles, training, credits, location, and headshot. Free, and no credit card.",
  },
  {
    n: "2",
    title: "Get verified",
    body: "We confirm you're a working professional. Verification is what casting teams filter on.",
  },
  {
    n: "3",
    title: "Get found",
    body: "Keep your availability current and appear in searches — including urgent cover calls. Companies contact you directly.",
  },
];

const perks = [
  "First in line for urgent cover calls",
  "Priority placement in casting searches",
  "Detailed availability, so the right work finds you",
  "A featured profile that stands out in results",
];

const faqs = [
  {
    q: "What does it cost?",
    a: "A profile is free and stays free — free profiles are fully searchable. Singer Pro is $9.99/month or $99/year and adds priority placement and first access to urgent cover calls. Founding singers get 12 months of Pro at no cost.",
  },
  {
    q: "Do you take a cut of my fee?",
    a: "No. There is no commission and no placement fee. Companies contact you directly and you negotiate as you always have.",
  },
  {
    q: "Who is actually searching?",
    a: "Opera companies, orchestras, choruses, festivals, and presenters — the people casting planned engagements and scrambling to cover last-minute cancellations.",
  },
  {
    q: "I'm not exclusively classical. Should I still join?",
    a: "Yes, if you work professionally in classical or adjacent repertoire — oratorio, concert work, chorus, musical theatre crossover, session and studio singing. Your profile is built around the repertoire you actually sing.",
  },
  {
    q: "How long does it take to set up?",
    a: "Roughly fifteen minutes if you have your credits and headshot handy. You can save and come back.",
  },
];

const attributes = [
  "Voice type & Fach",
  "Repertoire & roles",
  "Location",
  "Availability",
  "Short-notice status",
  "Verified profile",
];

function PrimaryCta({ className = "" }: { className?: string }) {
  return (
    <Link
      href={REGISTER}
      className={
        "inline-block rounded-[9px] bg-blue-600 px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-700 " +
        className
      }
    >
      Create your free profile
    </Link>
  );
}

export default function SingersLanding() {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionTag?.getAttribute("content") ?? "";
    document.title = PAGE_TITLE;
    descriptionTag?.setAttribute("content", PAGE_DESCRIPTION);
    return () => {
      document.title = previousTitle;
      descriptionTag?.setAttribute("content", previousDescription);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* ---------- nav: singer-only, no organization links ---------- */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#f6f7f9]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-[19px] font-bold tracking-tight text-slate-800">
            SingerSearch
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href={LOGIN} className="text-[14.5px] font-medium text-slate-500 hover:text-slate-800">
              Log in
            </Link>
            <Link
              href={REGISTER}
              className="rounded-[9px] bg-blue-600 px-[22px] py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <span className="hidden sm:inline">Create your free profile</span>
              <span className="sm:hidden">Join free</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- hero ---------- */}
        <section className="mx-auto max-w-6xl px-6 pb-14 pt-14 sm:pt-18">
          <span className="mb-5 inline-block rounded-full bg-[#eef2fd] px-[13px] py-1.5 text-[12.5px] font-semibold uppercase tracking-[0.05em] text-blue-600">
            For professional singers
          </span>

          <h1 className="max-w-[20ch] text-[34px] font-extrabold leading-[1.1] tracking-tight text-slate-800 sm:text-5xl">
            Get found for the work you're right for.
          </h1>

          <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-slate-700 sm:text-[19px]">
            A professional profile that helps opera companies, orchestras, choruses, and presenters
            find you when they're casting — and when they need someone by Friday.
          </p>

          <div className="mt-8">
            <PrimaryCta className="w-full text-center sm:w-auto" />
          </div>

          <p className="mt-4 text-[14.5px] text-slate-500">
            Free to join. No credit card.{" "}
            <span className="font-semibold text-slate-800">
              Founding singers receive 12 months of Singer Pro free — a $99 value.
            </span>
          </p>

          <div className="mt-9 flex flex-wrap gap-2 border-t border-slate-200 pt-8">
            {attributes.map((a) => (
              <span
                key={a}
                className="rounded-full border border-slate-200 bg-white px-[15px] py-[7px] text-sm font-medium text-slate-700"
              >
                {a}
              </span>
            ))}
          </div>
        </section>

        {/* ---------- commission band ---------- */}
        <div className="border-y border-slate-200 bg-white py-7">
          <p className="mx-auto max-w-6xl px-6 text-center text-[19px] font-semibold text-slate-800">
            We don't take commissions.{" "}
            <span className="text-base font-normal text-slate-500">
              Your fee is your fee, and your relationships stay yours.
            </span>
          </p>
        </div>

        {/* ---------- benefits ---------- */}
        <section className="mx-auto max-w-6xl px-6 py-14 sm:py-18">
          <div className="max-w-[60ch]">
            <h2 className="text-[26px] font-bold leading-tight tracking-tight text-slate-800 sm:text-[32px]">
              Be found on merit, not just connections.
            </h2>
            <p className="mt-3.5 text-[17px] text-slate-500">
              Casting still runs on who someone happens to know. SingerSearch is built so the right
              singer can be found by what they actually sing.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-xl border border-slate-200 bg-white p-[26px]">
                <h3 className="mb-2 text-lg font-bold tracking-tight text-slate-800">{b.title}</h3>
                <p className="text-[15.5px] leading-relaxed text-slate-500">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- how it works ---------- */}
        <section className="mx-auto max-w-6xl px-6 pb-14 sm:pb-18">
          <div className="max-w-[60ch]">
            <h2 className="text-[26px] font-bold leading-tight tracking-tight text-slate-800 sm:text-[32px]">
              How it works
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-xl border border-slate-200 bg-white p-[26px]">
                <div className="mb-4 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#eef2fd] text-[15px] font-bold text-blue-600">
                  {s.n}
                </div>
                <h3 className="mb-2 text-[17px] font-bold tracking-tight text-slate-800">{s.title}</h3>
                <p className="text-[15.5px] leading-relaxed text-slate-500">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- founding cohort ---------- */}
        <section className="mx-auto max-w-6xl px-6 pb-14 sm:pb-18">
          <div className="rounded-xl border border-slate-200 bg-white p-7 sm:p-10">
            <span className="mb-5 inline-block rounded-full bg-[#fdf6e3] px-[13px] py-1.5 text-[12.5px] font-semibold uppercase tracking-[0.05em] text-[#7a5c14]">
              Founding cohort — limited
            </span>

            <h2 className="max-w-[20ch] text-2xl font-bold leading-tight tracking-tight text-slate-800 sm:text-[29px]">
              Professional singer? Join the founding cohort.
            </h2>

            <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-slate-700">
              Singer Pro is normally $9.99 a month, or $99 a year. Founding singers get their first
              12 months free. Nothing to enter, nothing to cancel — it's applied when your profile is
              verified.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2 sm:gap-x-7">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[15.5px] text-slate-700">
                  <svg
                    className="mt-1 h-4 w-4 shrink-0 text-blue-600"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8.5l3.2 3.2L13 5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-[14.5px] text-slate-500">
              After 12 months you choose: keep Pro, or drop back to a free profile that stays fully
              searchable. No contract, cancel anytime.
            </p>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section className="mx-auto max-w-6xl px-6 pb-14 sm:pb-18">
          <div className="max-w-[800px]">
          <h2 className="text-[26px] font-bold leading-tight tracking-tight text-slate-800 sm:text-[32px]">
            Questions singers ask
          </h2>
          <div className="mt-9 border-t border-slate-200">
            {faqs.map((f) => (
              <div key={f.q} className="border-b border-slate-200 py-6">
                <h3 className="mb-2 text-[17px] font-bold tracking-tight text-slate-800">{f.q}</h3>
                <p className="text-[15.5px] leading-relaxed text-slate-500">{f.a}</p>
              </div>
            ))}
            </div>
          </div>
        </section>

        {/* ---------- final cta ---------- */}
        <section className="border-t border-slate-200 bg-white py-20 text-center">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mx-auto max-w-[24ch] text-[27px] font-bold leading-tight tracking-tight text-slate-800 sm:text-[34px]">
              Be in the search before the call goes out.
            </h2>
            <p className="mt-4 text-[17px] text-slate-500">
              Free profile. No credit card. Twelve months of Pro for founding singers.
            </p>
            <div className="mt-7">
              <PrimaryCta className="w-full text-center sm:w-auto" />
            </div>
            <p className="mt-4 text-[14.5px] text-slate-500">
              Already have an account?{" "}
              <Link href={LOGIN} className="font-medium text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </section>
      </main>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-slate-200 py-9">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3.5 px-6 text-sm text-slate-500">
          <span>SingerSearch · support@singer-search.com</span>
          <span className="flex gap-5">
            <Link href="/terms" className="hover:text-slate-800">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-800">
              Privacy
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   ROUTE SNIPPET — add these two lines to client/src/App.tsx

   import SingersLanding from "@/pages/SingersLanding";

   ...then inside the existing <Switch> block, alongside the other routes:

   <Route path="/singers" component={SingersLanding} />

   Nothing else changes. No API routes, no database, no dependencies.
   ============================================================ */
