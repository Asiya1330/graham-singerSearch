import { API_ERRORS, getApiErrorMessage } from "./api";

/**
 * Shared billing request. Reads the error body only on failure, so a non-JSON
 * response (a proxy's HTML 502, an empty 504) reports the real problem instead
 * of failing with a JSON parse error.
 */
async function stripeRequest(url, { method = "POST", body, fallbackCode }) {
  let res;
  try {
    res = await fetch(url, {
      method,
      credentials: "include",
      ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(API_ERRORS.NETWORK_ERROR.message);
  }

  if (!res.ok) {
    throw new Error(await getApiErrorMessage(res, fallbackCode));
  }

  try {
    return await res.json();
  } catch {
    throw new Error(API_ERRORS[fallbackCode].message);
  }
}

export async function startStripeCheckout(interval = "monthly") {
  const data = await stripeRequest("/api/stripe/checkout", {
    body: { interval },
    fallbackCode: "CHECKOUT_FAILED",
  });
  if (!data?.url) {
    throw new Error(API_ERRORS.CHECKOUT_FAILED.message);
  }
  window.location.href = data.url;
}

export async function openStripeBillingPortal() {
  const data = await stripeRequest("/api/stripe/portal", {
    fallbackCode: "BILLING_PORTAL_FAILED",
  });
  if (!data?.url) {
    throw new Error(API_ERRORS.BILLING_PORTAL_FAILED.message);
  }
  window.location.href = data.url;
}

export async function getStripePricing() {
  return stripeRequest("/api/stripe/prices", {
    method: "GET",
    fallbackCode: "PRICING_LOAD_FAILED",
  });
}

/** Pull latest subscription state from Stripe after checkout (local dev fallback). */
export async function syncStripeSubscription() {
  return stripeRequest("/api/stripe/sync", { fallbackCode: "SUBSCRIPTION_SYNC_FAILED" });
}

export async function cancelStripeSubscription() {
  return stripeRequest("/api/stripe/cancel", { fallbackCode: "SUBSCRIPTION_UPDATE_FAILED" });
}

export async function resumeStripeSubscription() {
  return stripeRequest("/api/stripe/resume", { fallbackCode: "SUBSCRIPTION_UPDATE_FAILED" });
}

export function stripeStatusLabel(status) {
  switch (status) {
    case "trialing":
      return "Free trial";
    case "active":
      return "Active";
    case "past_due":
      return "Past due";
    case "canceling":
      return "Canceling";
    case "canceled":
      return "Canceled";
    case "incomplete_expired":
      return "Expired";
    case "unpaid":
      return "Unpaid";
    default:
      return status ? String(status) : null;
  }
}
