export async function startStripeCheckout() {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    credentials: "include",
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

export function stripeStatusLabel(status) {
  switch (status) {
    case "trialing":
      return "Free trial";
    case "active":
      return "Active";
    case "past_due":
      return "Past due";
    case "canceled":
      return "Canceled";
    case "unpaid":
      return "Unpaid";
    default:
      return status ? String(status) : null;
  }
}
