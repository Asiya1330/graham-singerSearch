import React from "react";
import {
  startStripeCheckout,
  openStripeBillingPortal,
  cancelStripeSubscription,
  resumeStripeSubscription,
  syncStripeSubscription,
  stripeStatusLabel,
} from "../lib/stripe";

export function SubscriptionSection({ user, setCurrentUser, setProfileMsg, userType }) {
  const [stripeLoading, setStripeLoading] = React.useState(null);
  const [billingInterval, setBillingInterval] = React.useState("annual");

  React.useEffect(() => {
    if (!user.stripe_subscription_id) return;
    let cancelled = false;
    syncStripeSubscription()
      .then((data) => {
        if (cancelled) return;
        const { userType: ut, ...userData } = data;
        setCurrentUser(prev => prev?.data
          ? { ...prev, data: { ...prev.data, ...userData } }
          : { type: ut || userType, data: userData });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user.stripe_subscription_id]);

  const isSinger = userType === "singer";
  const tier = user.subscription_tier;
  const isFounding = isSinger
    ? user.founding_artist && tier === "pro" && user.pro_expires_at
    : user.founding_org && (!user.pro_expires_at || new Date(user.pro_expires_at) > new Date());
  const isPro = tier === "pro";
  const hasStripeSub = Boolean(user.stripe_subscription_id);
  const stripeStatus = stripeStatusLabel(user.stripe_subscription_status);
  const cancelAtPeriodEnd = user.stripe_subscription_status === "canceling";

  const foundingDate = isFounding && user.pro_expires_at
    ? new Date(user.pro_expires_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const trialEndDate = user.pro_expires_at && user.stripe_subscription_status === "trialing"
    ? new Date(user.pro_expires_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const cancelDate = cancelAtPeriodEnd && user.pro_expires_at
    ? new Date(user.pro_expires_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const isAnnualSub = isSinger && isPro && hasStripeSub && user.stripe_billing_interval === "year";

  const planLabel = isFounding ? (isSinger ? "Founding Artist" : "Founding Organization") : isPro ? "Pro" : "Free";
  const planColor = isFounding
    ? "bg-amber-100 text-amber-800"
    : isPro
      ? "bg-blue-100 text-blue-700"
      : "bg-slate-100 text-slate-600";
  const priceDisplay = isSinger
    ? (billingInterval === "annual" ? "$8.25/month" : "$9.99/month")
    : "$79/month";
  const billedNote = isSinger && billingInterval === "annual" ? "billed annually" : null;
  const suffix = isSinger ? "singer" : "org";

  const withLoading = (key, fn) => async () => {
    setStripeLoading(key);
    try {
      await fn();
    } catch (e) {
      setProfileMsg({ type: "error", text: e.message || "Something went wrong." });
    } finally {
      setStripeLoading(null);
    }
  };

  const handleCheckout = withLoading("checkout", () => startStripeCheckout(isSinger ? billingInterval : "monthly"));
  const handleBilling = withLoading("billing", () => openStripeBillingPortal());

  const handleCancel = async () => {
    if (!window.confirm("Cancel your subscription? You'll keep Pro access until the end of your current billing period.")) {
      return;
    }
    setStripeLoading("cancel");
    try {
      const data = await cancelStripeSubscription();
      const { userType: ut, ...userData } = data;
      setCurrentUser(prev => prev?.data
        ? { ...prev, data: { ...prev.data, ...userData } }
        : { type: ut || userType, data: userData });
      setProfileMsg({ type: "success", text: `Subscription canceled. Pro access continues until ${data.cancelAt || "end of period"}.` });
    } catch (e) {
      setProfileMsg({ type: "error", text: e.message || "Failed to cancel subscription." });
    } finally {
      setStripeLoading(null);
    }
  };

  const handleResume = withLoading("resume", async () => {
    const data = await resumeStripeSubscription();
    const { userType: ut, ...userData } = data;
    setCurrentUser(prev => prev?.data
      ? { ...prev, data: { ...prev.data, ...userData } }
      : { type: ut || userType, data: userData });
    setProfileMsg({ type: "success", text: "Subscription resumed!" });
  });

  return (
    <div id={`${suffix}-subscription-section`} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 scroll-mt-20" data-testid={`section-${suffix}-subscription`}>
      <h2 className="text-lg font-semibold text-slate-800">{isSinger ? "My Subscription" : "Subscription"}</h2>

      <div className="flex items-center gap-3 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${planColor}`} data-testid={`text-subscription-tier-${suffix}`}>
          {planLabel}
        </span>
        {isPro && !isFounding && hasStripeSub && (
          <span className="text-sm text-slate-600">
            {isSinger ? (isAnnualSub ? "$8.25/month, billed annually" : "$9.99/month") : "$79/month"}
          </span>
        )}
        {stripeStatus && (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full" data-testid={`text-stripe-status-${suffix}`}>
            {stripeStatus}
          </span>
        )}
      </div>

      {isFounding && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3" data-testid={`text-founding-${suffix}-info`}>
          <p className="text-sm text-amber-900 font-medium">{planLabel} — Pro access free{foundingDate ? ` until ${foundingDate}` : ""}</p>
          <p className="text-xs text-amber-700 mt-1">Enjoy full Pro features at no charge as one of our earliest {isSinger ? "members" : "partners"}.</p>
        </div>
      )}

      {user.stripe_subscription_status === "past_due" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-900 font-medium">Your payment is past due.</p>
          <p className="text-xs text-red-700 mt-1">Update your payment method in billing settings to keep Pro access.</p>
        </div>
      )}

      {cancelAtPeriodEnd && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm text-yellow-900 font-semibold">Your subscription has been canceled</p>
            <p className="text-sm text-yellow-800 mt-1">
              {cancelDate
                ? `You'll continue to have Pro access until ${cancelDate}. After that, your account will switch to the Free plan.`
                : "You'll keep Pro access until the end of your current billing period, then your account will switch to the Free plan."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResume}
              disabled={stripeLoading !== null}
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {stripeLoading === "resume" ? "Resuming…" : "Resume subscription"}
            </button>
            {hasStripeSub && (
              <button
                onClick={handleBilling}
                disabled={stripeLoading !== null}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {stripeLoading === "billing" ? "Redirecting…" : "Manage billing"}
              </button>
            )}
          </div>
        </div>
      )}

      {isPro && !isFounding && !cancelAtPeriodEnd && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900 font-medium">
              {user.stripe_subscription_status === "trialing"
                ? `Free trial active — billing starts ${trialEndDate || "after trial"}`
                : isSinger
                  ? `You are on the Pro plan — ${isAnnualSub ? "$8.25/month, billed annually" : "$9.99/month"}`
                  : "You are on the Pro plan — unlimited contact reveals and urgent search access."}
            </p>
            {hasStripeSub ? (
              <p className="text-xs text-blue-700 mt-1">Manage your subscription, payment method, and invoices in the billing portal.</p>
            ) : (
              <p className="text-xs text-blue-700 mt-1">To manage your subscription contact <a href="mailto:support@singersearch.net" className="underline font-medium">support@singersearch.net</a></p>
            )}
          </div>
          {hasStripeSub && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleBilling}
                disabled={stripeLoading !== null}
                className="text-sm font-medium text-blue-700 hover:text-blue-900 border border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                data-testid={`button-manage-billing-${suffix}`}
              >
                {stripeLoading === "billing" ? "Redirecting…" : "Manage billing"}
              </button>
              <button
                onClick={handleCancel}
                disabled={stripeLoading !== null}
                className="text-sm font-medium text-slate-600 hover:text-red-700 border border-slate-300 hover:border-red-300 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                data-testid={`button-cancel-${suffix}`}
              >
                {stripeLoading === "cancel" ? "Canceling…" : "Cancel subscription"}
              </button>
            </div>
          )}
        </div>
      )}

      {!isPro && !isFounding && (
        <div className="space-y-4">
          {!isSinger && (
            <p className="text-sm text-slate-600">
              {`${user.contact_reveals_used_this_month ?? 0} of ${user.contact_reveal_limit ?? 3} free contact reveals used this month.`}
            </p>
          )}
          <p className="text-sm text-slate-600">
            {isSinger
              ? "Upgrade to Pro for expedited Short-Notice Engagement access, profile view analytics, and the Castability Score."
              : "Upgrade to Pro for unlimited contact reveals, urgent search access, and priority support. Start with a 7-day free trial."}
          </p>

          {isSinger && (
            <div className="inline-flex bg-slate-900 p-1 rounded-full shadow-md">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${
                  billingInterval === "monthly"
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval("annual")}
                className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  billingInterval === "annual"
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Annual
                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">2 months free</span>
              </button>
            </div>
          )}

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {isSinger ? (billingInterval === "annual" ? "$8.25" : "$9.99") : "$79"}
            </span>
            <span className="text-sm text-slate-500">/month</span>
          </div>
          {billedNote && <p className="text-xs text-slate-500">{billedNote}</p>}

          <button
            onClick={handleCheckout}
            disabled={stripeLoading !== null}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            data-testid={`button-upgrade-pro-${suffix}`}
          >
            {stripeLoading === "checkout" ? "Redirecting…" : isSinger ? "Upgrade to Pro" : "Start free trial"}
          </button>
        </div>
      )}
    </div>
  );
}
