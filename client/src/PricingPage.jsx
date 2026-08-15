import React, { useState } from "react";
import { CheckCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useAppContext } from "./AppContext";
import { navigateToView } from "./lib/nav";
import { logoutAccount } from "./lib/accountAuth";
import { getStripePricing, startStripeCheckout, openStripeBillingPortal } from "./lib/stripe";
import { describeError } from "./lib/api";
import { Navbar } from "./landing/Navbar";
import { AppFooter } from "./AppShared";
import { getBillingDisplay } from "./components/BillingIntervalPicker";

function FeatureItem({ children, accent = "emerald" }) {
  const Icon = accent === "blue" ? Zap : CheckCircle;
  const iconClass = accent === "blue" ? "text-blue-600" : "text-emerald-500";
  return (
    <li className="flex items-start gap-2">
      <Icon className={`w-5 h-5 ${iconClass} mr-0.5 flex-shrink-0 mt-0.5`} />
      <span>{children}</span>
    </li>
  );
}

/** Browse-only CTA when the signed-in role does not match the pricing tab. */
function AudienceMismatchNotice({ pricingType, onLogoutAndGo, busy }) {
  const forSingers = pricingType === "singer";
  const planAudience = forSingers ? "singers" : "organizations";
  const accountNoun = forSingers ? "singer" : "organization";
  const signedInAs = forSingers ? "an organization" : "a singer";
  const registerView = forSingers ? "singerRegister" : "orgRegister";
  const loginView = forSingers ? "singerLogin" : "organizationLogin";

  return (
    <div
      className="mt-8 mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-left"
      role="status"
      data-testid="pricing-audience-mismatch"
    >
      <p className="text-sm font-semibold text-amber-950">
        This plan is for {planAudience}
      </p>
      <p className="mt-1 text-sm text-amber-900/90 leading-relaxed">
        You&apos;re signed in as {signedInAs}. To subscribe here, log out and create{" "}
        {forSingers ? "a singer" : "an organization"} account, or sign in to an existing{" "}
        {accountNoun} account.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => onLogoutAndGo(registerView)}
          className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="button-pricing-mismatch-register"
        >
          {busy ? "Logging out…" : `Log out & create ${forSingers ? "a singer" : "an organization"} account`}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onLogoutAndGo(loginView)}
          className="px-4 py-2.5 rounded-lg border border-amber-300 bg-white text-amber-950 text-sm font-bold hover:bg-amber-100/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="button-pricing-mismatch-login"
        >
          {busy ? "Logging out…" : `Log out & sign in as ${forSingers ? "a singer" : "an organization"}`}
        </button>
      </div>
    </div>
  );
}

export function PricingPage({ showAlert }) {
  const { currentUser, setCurrentUser, setView } = useAppContext();

  const [pricingType, setPricingType] = useState(currentUser?.type || "singer");
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [accountSwitchLoading, setAccountSwitchLoading] = useState(false);
  const [pricingData, setPricingData] = useState(null);

  const isSinger = pricingType === "singer";
  // Only reflect subscription state on the tab that matches the signed-in role.
  const isOwnAudience = Boolean(currentUser) && currentUser.type === pricingType;
  const isWrongAudience = Boolean(currentUser) && currentUser.type !== pricingType;
  const isPro = isOwnAudience && currentUser?.data?.subscription_tier === "pro";
  const isFree = isOwnAudience && currentUser?.data?.subscription_tier === "free";
  const hasStripeSub = isOwnAudience && Boolean(currentUser?.data?.stripe_subscription_id);
  const billing = getBillingDisplay(isSinger, "annual", pricingData);

  React.useEffect(() => {
    let cancelled = false;
    getStripePricing()
      .then((data) => {
        if (!cancelled) setPricingData(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const freeFeatures = isSinger
    ? ["Profile & availability", "Repertoire search visibility", "Profile views & notifications", "Contacted by organizations"]
    : ["Search singers by role, work, and dates", "View profiles", "3 contact reveals per month"];

  const proFeatures = isSinger
    ? [
        { text: "First in line for urgent cover calls", accent: "blue" },
        { text: "Priority placement in casting searches", accent: "blue" },
        { text: "Detailed availability so the right gigs find you", accent: "blue" },
        { text: "See which organizations view your profile", accent: "blue" },
        { text: "A featured profile that stands out", accent: "blue" },
      ]
    : [
        { text: "Unlimited searches", accent: "blue" },
        { text: "Priority urgent results", accent: "blue" },
        { text: "25+ contact reveals/month", accent: "blue" },
        { text: "Distance & logistics filters", accent: "blue" },
        { text: "Team access", accent: "blue" },
      ];

  const trialNote = isSinger ? "No contract · cancel anytime" : "7-day free trial · card required";
  const proTitle = isSinger ? "Singer Pro" : "Organization Pro";
  const wrongAudienceLabel = isSinger
    ? "Requires a singer account"
    : "Requires an organization account";

  async function logoutAndGo(view) {
    setAccountSwitchLoading(true);
    try {
      await logoutAccount();
      setCurrentUser(null);
      navigateToView(setView, view);
    } catch (err) {
      showAlert(describeError(err, "LOGOUT_FAILED"), "error");
      setAccountSwitchLoading(false);
    }
  }

  async function handleCheckout(interval) {
    if (isWrongAudience) return;
    if (!currentUser) {
      navigateToView(setView, isSinger ? "singerLogin" : "organizationLogin");
      return;
    }
    if (hasStripeSub) {
      try {
        await openStripeBillingPortal();
      } catch (err) {
        showAlert(describeError(err, "BILLING_PORTAL_FAILED"), "error");
      }
      return;
    }
    setCheckoutLoading(interval);
    try {
      await startStripeCheckout(interval);
    } catch (err) {
      showAlert(err.message || "Upgrade failed", "error");
      setCheckoutLoading(null);
    }
  }

  function freeButtonLabel() {
    if (isWrongAudience) return wrongAudienceLabel;
    if (isFree) return "Current plan";
    return "Downgrade to Free";
  }

  function proButtonLabel(interval) {
    if (isWrongAudience) return wrongAudienceLabel;
    if (checkoutLoading === interval) return "Redirecting…";
    if (!currentUser) return "Sign in to upgrade";
    if (hasStripeSub) return "Manage billing";
    if (isPro) return "Plan active";
    if (interval === "annual") return isSinger ? "Get yearly Pro" : "Start yearly trial";
    return isSinger ? "Get monthly Pro" : "Start monthly trial";
  }

  const cardBase =
    "bg-white rounded-2xl border flex flex-col h-full transition-shadow";

  return (
    <div
      className="bg-[#f6f7f9] text-[#1f2733] min-h-screen"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div className="sticky top-0 z-50 bg-[#f6f7f9]/95 backdrop-blur-md border-b border-[#e8eaed]/80">
        <div className="max-w-[1080px] mx-auto px-6">
          <Navbar />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple pricing for real-world hiring
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Discovery should be free. Urgency, reach, and control are worth paying for.
          </p>

          <div className="flex justify-center">
            <div className="bg-white p-1.5 rounded-xl border border-slate-200 inline-flex shadow-sm relative z-10">
              <button
                type="button"
                onClick={() => setPricingType("singer")}
                className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  isSinger
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                For Singers
              </button>
              <button
                type="button"
                onClick={() => setPricingType("organization")}
                className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  !isSinger
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                For Organizations
              </button>
            </div>
          </div>

          {isWrongAudience && (
            <AudienceMismatchNotice
              pricingType={pricingType}
              onLogoutAndGo={logoutAndGo}
              busy={accountSwitchLoading}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-4 max-w-6xl mx-auto items-stretch lg:items-center">
          {/* Free */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`${cardBase} border-slate-200 shadow-sm p-6 sm:p-7 lg:my-4`}
          >
            <div className="mb-5">
              <h3 className="text-xl font-bold text-slate-900">Free</h3>
              <p className="text-slate-500 mt-2 text-sm min-h-[40px]">
                {isSinger ? "Perfect for staying discoverable." : "For occasional searches."}
              </p>
              <div className="mt-5 flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold tracking-tight">$0</span>
                <span className="ml-1 text-base font-semibold text-slate-500">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-7 flex-1 text-sm text-slate-700">
              {freeFeatures.map((f) => (
                <FeatureItem key={f}>{f}</FeatureItem>
              ))}
            </ul>

            <button
              type="button"
              disabled={isWrongAudience || isFree}
              className="w-full py-3 px-4 border border-slate-300 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {freeButtonLabel()}
            </button>
          </motion.div>

          {/* Yearly — featured */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className={`${cardBase} border-blue-600 border-2 shadow-xl p-7 sm:p-9 relative overflow-visible lg:scale-[1.04] lg:z-10`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap">
              <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                Recommended
              </span>
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                2 months free
              </span>
            </div>

            <div className="mb-5 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
                Yearly
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{proTitle}</h3>
              <p className="text-slate-500 mt-2 text-sm min-h-[40px]">
                {isSinger
                  ? "Be first in line when companies need someone now."
                  : "Built for real hiring needs — best value."}
              </p>
              <div className="mt-5 flex items-baseline text-slate-900">
                <span className="text-5xl font-extrabold tracking-tight">
                  {billing.annualMonthlyEquiv}
                </span>
                <span className="ml-1 text-lg font-semibold text-slate-500">/month</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                billed {billing.annualTotal}/year
              </p>
              {billing.annualDiscountLabel && (
                <p className="mt-1 text-xs font-medium text-emerald-700">{billing.annualDiscountLabel}</p>
              )}
              <p className="mt-2 text-sm font-medium text-emerald-700">{trialNote}</p>
            </div>

            <ul className="space-y-3.5 mb-8 flex-1 text-sm text-slate-800">
              {proFeatures.map((f) => (
                <FeatureItem key={f.text} accent={f.accent}>
                  <span className="font-medium">{f.text}</span>
                </FeatureItem>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleCheckout("annual")}
              disabled={
                isWrongAudience ||
                (isPro && !hasStripeSub) ||
                checkoutLoading !== null ||
                accountSwitchLoading
              }
              className="w-full py-3.5 px-4 bg-blue-600 border border-transparent rounded-xl text-white font-bold hover:bg-blue-700 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[52px]"
            >
              {proButtonLabel("annual")}
            </button>
          </motion.div>

          {/* Monthly */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className={`${cardBase} border-slate-200 shadow-sm p-6 sm:p-7 lg:my-4`}
          >
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Monthly
              </p>
              <h3 className="text-xl font-bold text-slate-900">{proTitle}</h3>
              <p className="text-slate-500 mt-2 text-sm min-h-[40px]">
                {isSinger
                  ? "Full Pro access, billed month to month."
                  : "Full Pro access with flexible monthly billing."}
              </p>
              <div className="mt-5 flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold tracking-tight">
                  {billing.monthlyPrice}
                </span>
                <span className="ml-1 text-base font-semibold text-slate-500">/month</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">billed monthly</p>
              <p className="mt-2 text-sm font-medium text-emerald-700">{trialNote}</p>
            </div>

            <ul className="space-y-3 mb-7 flex-1 text-sm text-slate-700">
              {proFeatures.map((f) => (
                <FeatureItem key={f.text} accent={f.accent}>
                  {f.text}
                </FeatureItem>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleCheckout("monthly")}
              disabled={
                isWrongAudience ||
                (isPro && !hasStripeSub) ||
                checkoutLoading !== null ||
                accountSwitchLoading
              }
              className="w-full py-3 px-4 border border-slate-300 rounded-xl bg-white text-slate-800 font-bold hover:bg-slate-50 hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {proButtonLabel("monthly")}
            </button>
          </motion.div>
        </div>

        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>
            No contracts. Cancel anytime. We don&apos;t take commissions. Your relationships stay
            yours.
          </p>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
