export async function startStripeCheckout(interval = "monthly") {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interval }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to start checkout");
  }
  window.location.href = data.url;
}

export async function openStripeBillingPortal() {
  const res = await fetch("/api/stripe/portal", {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to open billing portal");
  }
  window.location.href = data.url;
}

export async function getStripePricing() {
  const res = await fetch("/api/stripe/prices", {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to load Stripe pricing");
  }
  return data;
}

/** Pull latest subscription state from Stripe after checkout (local dev fallback). */
export async function syncStripeSubscription() {
  const res = await fetch("/api/stripe/sync", {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to sync subscription");
  }
  return data;
}

export async function cancelStripeSubscription() {
  const res = await fetch("/api/stripe/cancel", {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to cancel subscription");
  }
  return data;
}

export async function resumeStripeSubscription() {
  const res = await fetch("/api/stripe/resume", {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to resume subscription");
  }
  return data;
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
    case "unpaid":
      return "Unpaid";
    default:
      return status ? String(status) : null;
  }
}
