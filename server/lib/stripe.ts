import Stripe from "stripe";
import type { Organization, Singer } from "@shared/schema";
import {
  getStripePriceOrgPro,
  getStripePriceSingerPro,
  getStripePriceSingerProAnnual,
  getStripeReturnBaseUrl,
  getStripeSecretKey,
  getStripeWebhookSecret,
} from "./env";
import { pool, storage } from "../storage";

export const STRIPE_TRIAL_DAYS = 7;

export type StripeUserType = "singer" | "organization";

const ACTIVE_STRIPE_STATUSES = new Set(["trialing", "active", "past_due", "canceling"]);

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getStripeSecretKey());
  }
  return stripeInstance;
}

export function hasActiveStripeSubscription(
  user: Pick<Singer | Organization, "stripe_subscription_id" | "stripe_subscription_status">,
): boolean {
  return Boolean(
    user.stripe_subscription_id &&
      user.stripe_subscription_status &&
      ACTIVE_STRIPE_STATUSES.has(user.stripe_subscription_status),
  );
}

function getPriceId(userType: StripeUserType, interval?: "monthly" | "annual"): string {
  if (userType === "singer" && interval === "annual") {
    const annualPrice = getStripePriceSingerProAnnual();
    if (!annualPrice) {
      throw new Error("Annual billing is not configured yet. Please choose monthly billing.");
    }
    return annualPrice;
  }
  return userType === "singer" ? getStripePriceSingerPro() : getStripePriceOrgPro();
}

function getDisplayName(userType: StripeUserType, user: Singer | Organization): string {
  if (userType === "singer") {
    const singer = user as Singer;
    return `${singer.first_name} ${singer.last_name}`.trim();
  }
  return (user as Organization).organization_name;
}

export async function getOrCreateStripeCustomer(
  userType: StripeUserType,
  userId: number,
  email: string,
  name: string,
  existingCustomerId?: string | null,
): Promise<string> {
  if (existingCustomerId) return existingCustomerId;

  const customer = await getStripe().customers.create({
    email,
    name,
    metadata: { userId: String(userId), userType },
  });

  if (userType === "singer") {
    await storage.updateSinger(userId, { stripe_customer_id: customer.id });
  } else {
    await storage.updateOrganization(userId, { stripe_customer_id: customer.id });
  }

  return customer.id;
}

export async function createCheckoutSession(
  userType: StripeUserType,
  userId: number,
  email: string,
  user: Singer | Organization,
  interval?: "monthly" | "annual",
): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(
    userType,
    userId,
    email,
    getDisplayName(userType, user),
    user.stripe_customer_id,
  );

  const siteUrl = getStripeReturnBaseUrl();
  const settingsView = userType === "singer" ? "singerSettings" : "orgSettings";

  const subscriptionData: Record<string, unknown> = {
    metadata: { userId: String(userId), userType },
  };
  if (userType === "organization") {
    subscriptionData.trial_period_days = STRIPE_TRIAL_DAYS;
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: getPriceId(userType, interval), quantity: 1 }],
    subscription_data: subscriptionData as Stripe.Checkout.SessionCreateParams["subscription_data"],
    allow_promotion_codes: true,
    metadata: { userId: String(userId), userType },
    success_url: `${siteUrl}/?checkout=success&view=${settingsView}`,
    cancel_url: `${siteUrl}/?checkout=cancel&view=pricing`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return session.url;
}

export async function createPortalSession(
  userType: StripeUserType,
  customerId: string,
): Promise<string> {
  const siteUrl = getStripeReturnBaseUrl();
  const settingsView = userType === "singer" ? "singerSettings" : "orgSettings";

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl}/?view=${settingsView}`,
  });

  return session.url;
}

export async function cancelSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function resumeSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export function constructWebhookEvent(rawBody: Buffer, signature: string | string[] | undefined): Stripe.Event {
  if (!signature || Array.isArray(signature)) {
    throw new Error("Missing Stripe signature header");
  }
  return getStripe().webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
}

function subscriptionExpiresAt(sub: Stripe.Subscription): Date | null {
  const endTs = sub.trial_end ?? sub.current_period_end;
  if (!endTs) return null;
  return new Date(endTs * 1000);
}

function hasNonStripeProAccess(user: Singer | Organization): boolean {
  if (user.is_gifted) {
    if (!user.pro_expires_at || new Date(user.pro_expires_at) > new Date()) {
      return true;
    }
  }

  const singer = user as Singer;
  if ("founding_artist" in user && singer.founding_artist) {
    if (!user.pro_expires_at || new Date(user.pro_expires_at) > new Date()) {
      return true;
    }
  }

  const org = user as Organization;
  if ("founding_org" in user && org.founding_org) {
    if (!user.pro_expires_at || new Date(user.pro_expires_at) > new Date()) {
      return true;
    }
  }

  if (
    user.subscription_tier === "pro" &&
    user.pro_expires_at &&
    !user.stripe_subscription_id &&
    new Date(user.pro_expires_at) > new Date()
  ) {
    return true;
  }

  return false;
}

export function mapSubscriptionToDbUpdate(sub: Stripe.Subscription): {
  stripe_subscription_id: string;
  stripe_subscription_status: string;
  stripe_billing_interval: string | null;
  subscription_tier: "free" | "pro";
  pro_expires_at: Date | null;
  contact_reveal_limit?: number;
} {
  const status = sub.cancel_at_period_end && sub.status === "active"
    ? "canceling"
    : sub.status;
  const expiresAt = subscriptionExpiresAt(sub);
  const interval = sub.items?.data?.[0]?.plan?.interval ?? null;

  const base = {
    stripe_subscription_id: sub.id,
    stripe_subscription_status: status,
    stripe_billing_interval: interval,
  };

  if (ACTIVE_STRIPE_STATUSES.has(status)) {
    return {
      ...base,
      subscription_tier: "pro",
      pro_expires_at: expiresAt,
    };
  }

  if (expiresAt && expiresAt > new Date() && (status === "canceled" || status === "active")) {
    return {
      ...base,
      subscription_tier: "pro",
      pro_expires_at: expiresAt,
    };
  }

  return {
    ...base,
    subscription_tier: "free",
    pro_expires_at: null,
    contact_reveal_limit: 3,
  };
}

async function resolveUserFromSubscription(
  sub: Stripe.Subscription,
  userTypeHint?: StripeUserType,
  userIdHint?: number,
): Promise<{ userType: StripeUserType; userId: number; user: Singer | Organization } | null> {
  const meta = sub.metadata ?? {};
  let userType = userTypeHint ?? (meta.userType as StripeUserType | undefined);
  let userId = userIdHint ?? (meta.userId ? parseInt(meta.userId, 10) : undefined);

  if (userType && userId) {
    const user =
      userType === "singer"
        ? await storage.getSinger(userId)
        : await storage.getOrganization(userId);
    if (user) return { userType, userId, user };
  }

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return null;

  const singerResult = await pool.query(
    "SELECT id FROM singers WHERE stripe_customer_id = $1 LIMIT 1",
    [customerId],
  );
  if (singerResult.rows[0]) {
    const singer = await storage.getSinger(singerResult.rows[0].id);
    if (singer) return { userType: "singer", userId: singer.id, user: singer };
  }

  const orgResult = await pool.query(
    "SELECT id FROM organizations WHERE stripe_customer_id = $1 LIMIT 1",
    [customerId],
  );
  if (orgResult.rows[0]) {
    const org = await storage.getOrganization(orgResult.rows[0].id);
    if (org) return { userType: "organization", userId: org.id, user: org };
  }

  return null;
}

export async function applySubscriptionUpdate(
  sub: Stripe.Subscription,
  userTypeHint?: StripeUserType,
  userIdHint?: number,
): Promise<void> {
  const resolved = await resolveUserFromSubscription(sub, userTypeHint, userIdHint);
  if (!resolved) {
    console.warn(`[stripe] Could not resolve user for subscription ${sub.id}`);
    return;
  }

  const { userType, userId, user } = resolved;
  const update = mapSubscriptionToDbUpdate(sub);

  if (update.subscription_tier === "free" && hasNonStripeProAccess(user)) {
    await (userType === "singer"
      ? storage.updateSinger(userId, {
          stripe_subscription_id: update.stripe_subscription_id,
          stripe_subscription_status: update.stripe_subscription_status,
          stripe_billing_interval: update.stripe_billing_interval,
        })
      : storage.updateOrganization(userId, {
          stripe_subscription_id: update.stripe_subscription_id,
          stripe_subscription_status: update.stripe_subscription_status,
          stripe_billing_interval: update.stripe_billing_interval,
        }));
    return;
  }

  if (userType === "singer") {
    await storage.updateSinger(userId, {
      stripe_subscription_id: update.stripe_subscription_id,
      stripe_subscription_status: update.stripe_subscription_status,
      stripe_billing_interval: update.stripe_billing_interval,
      subscription_tier: update.subscription_tier,
      pro_expires_at: update.pro_expires_at,
    });
    return;
  }

  await storage.updateOrganization(userId, {
    stripe_subscription_id: update.stripe_subscription_id,
    stripe_subscription_status: update.stripe_subscription_status,
    stripe_billing_interval: update.stripe_billing_interval,
    subscription_tier: update.subscription_tier,
    pro_expires_at: update.pro_expires_at,
    contact_reveal_limit: update.subscription_tier === "pro" ? 50 : 3,
  });
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userType = session.metadata?.userType as StripeUserType | undefined;
  const userId = session.metadata?.userId ? parseInt(session.metadata.userId, 10) : undefined;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;

  if (userType && userId && customerId) {
    if (userType === "singer") {
      await storage.updateSinger(userId, { stripe_customer_id: customerId });
    } else {
      await storage.updateOrganization(userId, { stripe_customer_id: customerId });
    }
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (!subscriptionId) return;

  const sub = await getStripe().subscriptions.retrieve(subscriptionId);
  await applySubscriptionUpdate(sub, userType, userId);
}

const SUBSCRIPTION_STATUS_PRIORITY = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
];

export async function syncSubscriptionForUser(
  userType: StripeUserType,
  userId: number,
): Promise<Singer | Organization | undefined> {
  const user =
    userType === "singer"
      ? await storage.getSinger(userId)
      : await storage.getOrganization(userId);
  if (!user?.stripe_customer_id) return user;

  const { data } = await getStripe().subscriptions.list({
    customer: user.stripe_customer_id,
    status: "all",
    limit: 20,
  });

  if (data.length === 0) return user;

  const sub = [...data].sort(
    (a, b) =>
      SUBSCRIPTION_STATUS_PRIORITY.indexOf(a.status) -
      SUBSCRIPTION_STATUS_PRIORITY.indexOf(b.status),
  )[0];

  await applySubscriptionUpdate(sub, userType, userId);

  return userType === "singer"
    ? await storage.getSinger(userId)
    : await storage.getOrganization(userId);
}

export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await applySubscriptionUpdate(event.data.object as Stripe.Subscription);
      break;
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;
      if (!subscriptionId) break;
      const sub = await getStripe().subscriptions.retrieve(subscriptionId);
      await applySubscriptionUpdate(sub);
      break;
    }
    default:
      break;
  }
}
