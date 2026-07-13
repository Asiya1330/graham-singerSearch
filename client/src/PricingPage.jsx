import React, { useState } from "react";
import { CheckCircle, Zap } from "lucide-react";
import { useAppContext } from "./AppContext";
import { navigateToView } from "./lib/nav";
import { startStripeCheckout, openStripeBillingPortal } from "./lib/stripe";
import { Navbar } from "./landing/Navbar";
import { AppFooter } from "./AppShared";

export function PricingPage({ showAlert }) {
  const { currentUser, setCurrentUser, setView } = useAppContext();

    const [pricingType, setPricingType] = useState(currentUser?.type || "singer");
    const [billingInterval, setBillingInterval] = useState("annual");
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const isSinger = pricingType === "singer";
    const isPro = currentUser?.data?.subscription_tier === "pro";
    const hasStripeSub = Boolean(currentUser?.data?.stripe_subscription_id);

    const singerMonthlyEquiv = billingInterval === "annual" ? "$8.25" : "$9.99";
    const singerPeriod = "/month";
    const singerBilledNote = billingInterval === "annual" ? "billed annually" : null;

    const orgMonthlyEquiv = "$65.83";
    const orgBilledNote = "billed annually";

    return (
      <div className="bg-[#f6f7f9] text-[#1f2733] min-h-screen" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
        <div className="max-w-[1080px] mx-auto px-6">
          <Navbar />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple pricing for real-world hiring</h1>
            <p className="text-xl text-slate-600 mb-8">Discovery should be free. Urgency, reach, and control are worth paying for.</p>

            <div className="flex justify-center">
                 <div className="bg-white p-1.5 rounded-xl border border-slate-200 inline-flex shadow-sm relative z-10">
                   <button
                     onClick={() => setPricingType("singer")}
                     className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${isSinger ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                   >
                     For Singers
                   </button>
                   <button
                     onClick={() => setPricingType("organization")}
                     className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${!isSinger ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                   >
                     For Organizations
                   </button>
                 </div>
            </div>

            {isSinger && (
              <div className="flex justify-center mt-6">
                <div className="bg-slate-900 p-1 rounded-full inline-flex shadow-md">
                  <button
                    onClick={() => setBillingInterval("monthly")}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                      billingInterval === "monthly"
                        ? "bg-white text-slate-900 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingInterval("annual")}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                      billingInterval === "annual"
                        ? "bg-white text-slate-900 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Annual
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">2 months free</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Free</h3>
                <p className="text-slate-500 mt-2 h-12">
                  {isSinger ? "Perfect for staying discoverable." : "For occasional searches."}
                </p>
                <div className="mt-6 flex items-baseline text-slate-900">
                  <span className="text-5xl font-extrabold tracking-tight">$0</span>
                  <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {isSinger ? (
                  <>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> Profile & availability</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> Repertoire search visibility</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> Profile views & notifications</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> Contacted by organizations</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> Search singers by role, work, and dates</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> View profiles</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> 3 contact reveals per month</li>
                  </>
                )}
              </ul>

              <button
                disabled={currentUser?.data?.subscription_tier === 'free'}
                className="w-full py-3 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                {currentUser?.data?.subscription_tier === 'free' ? "Current Plan" : "Downgrade to Free"}
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-600 p-6 sm:p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Recommended
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">{isSinger ? "Singer Pro" : "Organization Pro"}</h3>
                <p className="text-slate-500 mt-2 h-12">
                  {isSinger ? "Be first in line when companies need someone now." : "Built for real hiring needs."}
                </p>
                <div className="mt-6 flex items-baseline text-slate-900">
                  <span className="text-5xl font-extrabold tracking-tight">{isSinger ? singerMonthlyEquiv : "$79"}</span>
                  <span className="ml-1 text-xl font-semibold text-slate-500">{singerPeriod}</span>
                </div>
                {isSinger && singerBilledNote && (
                  <p className="mt-1 text-sm text-slate-500">{singerBilledNote}</p>
                )}
                <p className="mt-2 text-sm font-medium text-emerald-700">{isSinger ? "No contract · cancel anytime" : "7-day free trial · card required"}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {isSinger ? (
                  <>
                    <li className="flex items-start"><Zap className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> <span className="font-medium text-slate-900">First in line for urgent cover calls</span></li>
                    <li className="flex items-start"><Zap className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> <span className="font-medium text-slate-900">Priority placement in casting searches</span></li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> Detailed availability so the right gigs find you</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> See which organizations view your profile</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> A featured profile that stands out</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start"><Zap className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> <span className="font-medium text-slate-900">Unlimited searches</span></li>
                    <li className="flex items-start"><Zap className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> <span className="font-medium text-slate-900">Priority urgent results</span></li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> 25+ contact reveals/month</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> Distance & logistics filters</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> Team access</li>
                  </>
                )}
              </ul>

              <button
                onClick={async () => {
                    if (!currentUser) {
                        navigateToView(setView, isSinger ? "singerLogin" : "organizationLogin");
                        return;
                    }

                    if (hasStripeSub) {
                        try {
                            await openStripeBillingPortal();
                        } catch (err) {
                            showAlert(err.message || "Failed to open billing portal", "error");
                        }
                        return;
                    }

                    setCheckoutLoading(true);
                    try {
                        await startStripeCheckout(isSinger ? billingInterval : "monthly");
                    } catch (err) {
                        showAlert(err.message || "Upgrade failed", "error");
                        setCheckoutLoading(false);
                    }
                }}
                disabled={(isPro && !hasStripeSub) || checkoutLoading}
                className="w-full py-3 px-4 bg-blue-600 border border-transparent rounded-xl shadow-lg text-white font-bold hover:bg-blue-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[48px]"
              >
                {checkoutLoading
                    ? "Redirecting…"
                    : currentUser
                    ? (hasStripeSub
                        ? "Manage billing"
                        : isPro
                          ? "Plan Active"
                          : isSinger ? "Upgrade to Pro" : "Start free trial")
                    : "Sign in to Upgrade"
                }
              </button>
            </div>
          </div>

          <div className="text-center mt-12 text-slate-500 text-sm">
            <p>No contracts. Cancel anytime. We don't take commissions. Your relationships stay yours.</p>
          </div>
        </div>

        <AppFooter />
      </div>
    );
}
