import Stripe from "stripe";
import type { Organization, Singer } from "@shared/schema";
import {
  getStripePriceOrgPro,
  getStripePriceOrgProAnnual,
  getStripePriceSingerPro,
  getStripePriceSingerProAnnual,
  getStripeReturnBaseUrl,
  getStripeSecretKey,
  getStripeWebhookSecret,
} from "./env";
import { pool, storage } from "../storage";
import { HttpApiError } from "./api-response";

export const STRIPE_TRIAL_DAYS = 7;
export const STRIPE_SYNC_INTERVAL_MS = 5 * 60 * 1000;
export const CUSTOMER_CREATE_IDEMPOTENCY_WINDOW_MS = 10_000;
const PAST_DUE_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export type StripeUserType = "singer" | "organization";

const ACTIVE_STRIPE_STATUSES = new Set(["trialing", "active", "canceling"]);
const SYNC_PRIORITY = ["trialing", "active", "past_due", "incomplete", "unpaid", "canceled", "incomplete_expired", "paused"];

export class StripeWebhookProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeWebhookProcessingError";
  }
}

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

function getStripeCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

function getStripeSubscriptionId(
  subscription: string | Stripe.Subscription | null | undefined,
): string | null {
  if (!subscription) return null;
  return typeof subscription === "string" ? subscription : subscription.id;
}

function isStripeResourceMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "resource_missing";
}

function isDeletedStripeCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer,
): customer is Stripe.DeletedCustomer {
  return "deleted" in customer && customer.deleted === true;
}

/**
 * A subscription only updates a user that is already bound to its customer.
 * Binding happens at checkout (getOrCreateStripeCustomer, then
 * checkout.session.completed), never here — otherwise a stale event, which still
 * carries the old userId in its metadata, would re-attach a customer the operator
 * just cleared from Stripe and from the row.
 */
export function shouldApplyLiveSubscription(args: {
  userCustomerId: string | null | undefined;
  subscriptionCustomerId: string | null;
  status: string | null;
}): boolean {
  if (!args.status || !args.subscriptionCustomerId) return false;
  return args.userCustomerId === args.subscriptionCustomerId;
}

async function retrieveUsableStripeCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await getStripe().customers.retrieve(customerId);
    if (isDeletedStripeCustomer(customer)) return null;
    return customer;
  } catch (error) {
    if (isStripeResourceMissing(error)) return null;
    throw error;
  }
}

async function retrieveUsableStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await getStripe().subscriptions.retrieve(subscriptionId);
  } catch (error) {
    if (isStripeResourceMissing(error)) return null;
    throw error;
  }
}

function getPriceId(userType: StripeUserType, interval?: "monthly" | "annual"): string {
  if (interval === "annual") {
    const annualPrice =
      userType === "singer" ? getStripePriceSingerProAnnual() : getStripePriceOrgProAnnual();
    if (!annualPrice) {
      // Thrown as a catalog error so the reason survives the route's generic
      // CHECKOUT_FAILED fallback — this one is worth telling the buyer.
      throw new HttpApiError("ANNUAL_BILLING_UNAVAILABLE");
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

async function persistStripeCustomerId(
  userType: StripeUserType,
  userId: number,
  customerId: string,
): Promise<void> {
  if (userType === "singer") {
    await storage.updateSinger(userId, { stripe_customer_id: customerId });
    return;
  }
  await storage.updateOrganization(userId, { stripe_customer_id: customerId });
}

export async function getOrCreateStripeCustomer(
  userType: StripeUserType,
  userId: number,
  email: string,
  name: string,
  existingCustomerId?: string | null,
  idempotencyKey?: string,
): Promise<string> {
  if (existingCustomerId) {
    const live = await retrieveUsableStripeCustomer(existingCustomerId);
    if (live) return live.id;
    console.warn(
      `[stripe] stored customer ${existingCustomerId} is missing or deleted; creating a new customer for ${userType} ${userId}`,
    );
  }

  const params: Stripe.CustomerCreateParams = {
    email,
    name,
    metadata: { userId: String(userId), userType },
  };
  const customer = await getStripe().customers.create(
    params,
    idempotencyKey ? { idempotencyKey } : undefined,
  );

  await persistStripeCustomerId(userType, userId, customer.id);
  return customer.id;
}

export async function createCheckoutSession(
  userType: StripeUserType,
  userId: number,
  email: string,
  user: Singer | Organization,
  interval?: "monthly" | "annual",
  idempotencyKey?: string,
): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(
    userType,
    userId,
    email,
    getDisplayName(userType, user),
    user.stripe_customer_id,
    `customer:${userType}:${userId}:${Math.floor(Date.now() / CUSTOMER_CREATE_IDEMPOTENCY_WINDOW_MS)}`,
  );

  const siteUrl = getStripeReturnBaseUrl();
  const settingsView = userType === "singer" ? "singerSettings" : "orgSettings";

  const subscriptionData: Record<string, unknown> = {
    metadata: { userId: String(userId), userType },
  };
  if (userType === "organization" && await shouldApplyOrganizationTrial(user as Organization, customerId)) {
    subscriptionData.trial_period_days = STRIPE_TRIAL_DAYS;
  }

  const priceId = getPriceId(userType, interval);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: `${userType}:${userId}`,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: subscriptionData as Stripe.Checkout.SessionCreateParams["subscription_data"],
    allow_promotion_codes: true,
    metadata: { userId: String(userId), userType },
    success_url: `${siteUrl}/?checkout=success&view=${settingsView}`,
    cancel_url: `${siteUrl}/?checkout=cancel&view=pricing`,
  }, idempotencyKey ? { idempotencyKey } : undefined);

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

/** Current billing-period end (Unix seconds), read from the subscription item —
 * newer Stripe API versions moved this off the top-level Subscription object. */
export function getPeriodEnd(sub: Stripe.Subscription): number | null {
  return sub.items?.data?.[0]?.current_period_end ?? null;
}

function getBillingInterval(sub: Stripe.Subscription): string | null {
  return sub.items?.data?.[0]?.price?.recurring?.interval ?? sub.items?.data?.[0]?.plan?.interval ?? null;
}

/** Stripe keeps trial_end populated after a trial converts to paid, so it is only
 * the right expiry while the subscription is still trialing. Once it converts, the
 * paid period end is authoritative — reading trial_end there pins pro_expires_at to
 * a date in the past. */
function subscriptionExpiresAt(sub: Stripe.Subscription): Date | null {
  const endTs = sub.status === "trialing" ? sub.trial_end ?? getPeriodEnd(sub) : getPeriodEnd(sub);
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

function normalizeSubscriptionStatus(sub: Stripe.Subscription): string {
  return sub.cancel_at_period_end && sub.status === "active"
    ? "canceling"
    : sub.status;
}

function isPastDueWithinGrace(sub: Stripe.Subscription, now = new Date()): boolean {
  if (sub.status !== "past_due") return false;
  const expiresAt = subscriptionExpiresAt(sub);
  if (!expiresAt) return false;
  return expiresAt.getTime() + PAST_DUE_GRACE_MS > now.getTime();
}

export function mapSubscriptionToDbUpdate(sub: Stripe.Subscription): {
  stripe_subscription_id: string;
  stripe_subscription_status: string;
  stripe_billing_interval: string | null;
  subscription_tier: "free" | "pro";
  pro_expires_at: Date | null;
  contact_reveal_limit?: number;
} {
  const status = normalizeSubscriptionStatus(sub);
  const expiresAt = subscriptionExpiresAt(sub);
  const interval = getBillingInterval(sub);

  const base = {
    stripe_subscription_id: sub.id,
    stripe_subscription_status: status,
    stripe_billing_interval: interval,
  };

  if (ACTIVE_STRIPE_STATUSES.has(status) || isPastDueWithinGrace(sub)) {
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

function syncTimestampUpdate() {
  return { stripe_last_synced_at: new Date() };
}

async function handleMissingStripeSubscription(
  sub: Stripe.Subscription,
  userTypeHint?: StripeUserType,
  userIdHint?: number,
): Promise<void> {
  const resolved = await resolveUserFromSubscription(sub, userTypeHint, userIdHint);
  if (!resolved) return;

  const eventCustomerId = getStripeCustomerId(sub.customer);
  const liveCustomer = eventCustomerId ? await retrieveUsableStripeCustomer(eventCustomerId) : null;
  const ownedDeletedCustomer =
    !liveCustomer && (!resolved.user.stripe_customer_id || resolved.user.stripe_customer_id === eventCustomerId);

  if (ownedDeletedCustomer) {
    await clearDeletedStripeCustomerState(resolved.userType, resolved.userId, resolved.user);
    return;
  }

  if (resolved.user.stripe_subscription_id === sub.id) {
    await clearMissingStripeSubscriptionState(resolved.userType, resolved.userId, resolved.user);
  }
}

export async function applySubscriptionUpdate(
  sub: Stripe.Subscription,
  userTypeHint?: StripeUserType,
  userIdHint?: number,
): Promise<void> {
  const live = await retrieveUsableStripeSubscription(sub.id);
  if (!live) {
    await handleMissingStripeSubscription(sub, userTypeHint, userIdHint);
    return;
  }

  const resolved = await resolveUserFromSubscription(live, userTypeHint, userIdHint);
  if (!resolved) {
    throw new StripeWebhookProcessingError(`[stripe] Could not resolve user for subscription ${live.id}`);
  }

  const subscriptionCustomerId = getStripeCustomerId(live.customer);
  if (!shouldApplyLiveSubscription({
    userCustomerId: resolved.user.stripe_customer_id,
    subscriptionCustomerId,
    status: live.status,
  })) {
    console.warn(
      `[stripe] ignoring stale subscription ${live.id} (${live.status}) for ${resolved.userType} ${resolved.userId}`,
    );
    return;
  }

  const { userType, userId, user } = resolved;
  const update = mapSubscriptionToDbUpdate(live);

  if (update.subscription_tier === "free" && hasNonStripeProAccess(user)) {
    await (userType === "singer"
      ? storage.updateSinger(userId, {
          stripe_subscription_id: update.stripe_subscription_id,
          stripe_subscription_status: update.stripe_subscription_status,
          stripe_billing_interval: update.stripe_billing_interval,
          ...syncTimestampUpdate(),
        })
      : storage.updateOrganization(userId, {
          stripe_subscription_id: update.stripe_subscription_id,
          stripe_subscription_status: update.stripe_subscription_status,
          stripe_billing_interval: update.stripe_billing_interval,
          ...syncTimestampUpdate(),
        }));
    return;
  }

  // Don't let a Stripe-derived expiry regress below an existing non-Stripe grant
  // (founding membership, admin gift) that's still valid — e.g. an ordinary renewal
  // webhook shouldn't erase a founding member's granted expiry date.
  let proExpiresAt = update.pro_expires_at;
  if (hasNonStripeProAccess(user) && user.pro_expires_at) {
    const existingExpiry = new Date(user.pro_expires_at);
    if (!proExpiresAt || existingExpiry > proExpiresAt) {
      proExpiresAt = existingExpiry;
    }
  }

  if (userType === "singer") {
    await storage.updateSinger(userId, {
      stripe_subscription_id: update.stripe_subscription_id,
      stripe_subscription_status: update.stripe_subscription_status,
      stripe_billing_interval: update.stripe_billing_interval,
      stripe_last_synced_at: new Date(),
      subscription_tier: update.subscription_tier,
      pro_expires_at: proExpiresAt,
    });
    return;
  }

  const organizationUser = user as Organization;
  await storage.updateOrganization(userId, {
    stripe_subscription_id: update.stripe_subscription_id,
    stripe_subscription_status: update.stripe_subscription_status,
    stripe_billing_interval: update.stripe_billing_interval,
    stripe_last_synced_at: new Date(),
    stripe_trial_started_at: live.trial_start ? new Date(live.trial_start * 1000) : organizationUser.stripe_trial_started_at,
    subscription_tier: update.subscription_tier,
    pro_expires_at: proExpiresAt,
    contact_reveal_limit: update.subscription_tier === "pro" ? 50 : 3,
  });
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userType = session.metadata?.userType as StripeUserType | undefined;
  const userId = session.metadata?.userId ? parseInt(session.metadata.userId, 10) : undefined;
  const customerId = getStripeCustomerId(session.customer);
  const liveCustomer = customerId ? await retrieveUsableStripeCustomer(customerId) : null;

  if (userType && userId && liveCustomer) {
    await persistStripeCustomerId(userType, userId, liveCustomer.id);
  }

  const subscriptionId =
    getStripeSubscriptionId(session.subscription);
  if (!subscriptionId) return;

  const sub = await retrieveUsableStripeSubscription(subscriptionId);
  if (!sub) return;
  await applySubscriptionUpdate(sub, userType, userId);
}

function getSyncPriority(sub: Stripe.Subscription): number {
  const status = normalizeSubscriptionStatus(sub);
  const index = SYNC_PRIORITY.indexOf(status);
  return index === -1 ? SYNC_PRIORITY.length : index;
}

/** Prefer the subscription we already track, but only to break ties between
 * subscriptions of equal status — otherwise a stale canceled subscription would
 * outrank the active one the customer just paid for. */
function getTrackedRank(sub: Stripe.Subscription, currentSubscriptionId?: string | null): number {
  return currentSubscriptionId && sub.id === currentSubscriptionId ? 0 : 1;
}

/** Pick the subscription that represents a customer's current entitlement:
 * best status first, then the one already on record, then the newest. */
export function selectSubscriptionForSync(
  subscriptions: Stripe.Subscription[],
  currentSubscriptionId?: string | null,
): Stripe.Subscription | undefined {
  return [...subscriptions].sort(
    (a, b) =>
      getSyncPriority(a) - getSyncPriority(b) ||
      getTrackedRank(a, currentSubscriptionId) - getTrackedRank(b, currentSubscriptionId) ||
      b.created - a.created,
  )[0];
}

async function clearMissingStripeSubscriptionState(
  userType: StripeUserType,
  userId: number,
  user: Singer | Organization,
): Promise<void> {
  const baseUpdate = {
    stripe_subscription_id: null,
    stripe_subscription_status: null,
    stripe_billing_interval: null,
    stripe_last_synced_at: new Date(),
  };

  if (userType === "singer") {
    await storage.updateSinger(userId, {
      ...baseUpdate,
      ...(hasNonStripeProAccess(user) ? {} : { subscription_tier: "free", pro_expires_at: null }),
    });
    return;
  }

  await storage.updateOrganization(userId, {
    ...baseUpdate,
    ...(hasNonStripeProAccess(user)
      ? {}
      : { subscription_tier: "free", pro_expires_at: null, contact_reveal_limit: 3 }),
  });
}

async function clearDeletedStripeCustomerState(
  userType: StripeUserType,
  userId: number,
  user: Singer | Organization,
): Promise<void> {
  const baseUpdate = {
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_subscription_status: null,
    stripe_billing_interval: null,
    stripe_last_synced_at: new Date(),
  };

  if (userType === "singer") {
    await storage.updateSinger(userId, {
      ...baseUpdate,
      ...(hasNonStripeProAccess(user) ? {} : { subscription_tier: "free", pro_expires_at: null }),
    });
    return;
  }

  await storage.updateOrganization(userId, {
    ...baseUpdate,
    stripe_trial_started_at: null,
    ...(hasNonStripeProAccess(user)
      ? {}
      : { subscription_tier: "free", pro_expires_at: null, contact_reveal_limit: 3 }),
  });
}

export function shouldSyncStripeState(
  user: Pick<Singer | Organization, "stripe_customer_id" | "stripe_subscription_status" | "stripe_last_synced_at">,
  now = new Date(),
): boolean {
  if (!user.stripe_customer_id) return false;
  if (!user.stripe_last_synced_at) return true;
  if (user.stripe_subscription_status && ["past_due", "incomplete", "unpaid", "trialing"].includes(user.stripe_subscription_status)) {
    return true;
  }
  return now.getTime() - new Date(user.stripe_last_synced_at).getTime() >= STRIPE_SYNC_INTERVAL_MS;
}

export async function syncSubscriptionForUser(
  userType: StripeUserType,
  userId: number,
): Promise<Singer | Organization | undefined> {
  const user =
    userType === "singer"
      ? await storage.getSinger(userId)
      : await storage.getOrganization(userId);
  if (!user?.stripe_customer_id) return user;

  const liveCustomer = await retrieveUsableStripeCustomer(user.stripe_customer_id);
  if (!liveCustomer) {
    await clearDeletedStripeCustomerState(userType, userId, user);
    return userType === "singer"
      ? await storage.getSinger(userId)
      : await storage.getOrganization(userId);
  }

  const { data } = await getStripe().subscriptions.list({
    customer: liveCustomer.id,
    status: "all",
    limit: 20,
  });

  if (data.length === 0) {
    await clearMissingStripeSubscriptionState(userType, userId, user);
    return userType === "singer"
      ? await storage.getSinger(userId)
      : await storage.getOrganization(userId);
  }

  const sub = selectSubscriptionForSync(data, user.stripe_subscription_id)!;

  await applySubscriptionUpdate(sub, userType, userId);

  return userType === "singer"
    ? await storage.getSinger(userId)
    : await storage.getOrganization(userId);
}

async function shouldApplyOrganizationTrial(org: Organization, customerId: string): Promise<boolean> {
  if (org.stripe_trial_started_at) return false;
  const existingSubscriptions = await getStripe().subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 5,
  });
  return existingSubscriptions.data.length === 0;
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parentSubscription = invoice.parent?.subscription_details?.subscription;
  if (typeof parentSubscription === "string") return parentSubscription;
  if (parentSubscription?.id) return parentSubscription.id;
  const legacySubscription = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription }).subscription;
  return getStripeSubscriptionId(legacySubscription ?? null);
}

export async function claimStripeWebhookEvent(eventId: string, eventType: string): Promise<"process" | "skip"> {
  const inserted = await pool.query(
    `INSERT INTO stripe_webhook_events (event_id, event_type, status)
     VALUES ($1, $2, 'processing')
     ON CONFLICT DO NOTHING
     RETURNING event_id`,
    [eventId, eventType],
  );
  if (inserted.rowCount) return "process";

  const existing = await pool.query(
    `SELECT status FROM stripe_webhook_events WHERE event_id = $1 LIMIT 1`,
    [eventId],
  );
  const status = existing.rows[0]?.status;
  if (status === "processed" || status === "processing") {
    return "skip";
  }

  await pool.query(
    `UPDATE stripe_webhook_events
     SET status = 'processing',
         attempts = attempts + 1,
         last_error = NULL,
         updated_at = now(),
         processed_at = NULL
     WHERE event_id = $1`,
    [eventId],
  );
  return "process";
}

export async function markStripeWebhookEventProcessed(eventId: string): Promise<void> {
  await pool.query(
    `UPDATE stripe_webhook_events
     SET status = 'processed',
         updated_at = now(),
         processed_at = now(),
         last_error = NULL
     WHERE event_id = $1`,
    [eventId],
  );
}

export async function markStripeWebhookEventFailed(eventId: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  await pool.query(
    `UPDATE stripe_webhook_events
     SET status = 'failed',
         updated_at = now(),
         last_error = left($2, 2000)
     WHERE event_id = $1`,
    [eventId, message],
  );
}

type StripePriceSummary = {
  monthlyPrice: string | null;
  annualMonthlyEquiv: string | null;
  annualTotal: string | null;
  annualDiscountLabel: string | null;
};

let cachedPricing: { expiresAt: number; data: { singer: StripePriceSummary; organization: StripePriceSummary } } | null = null;

function formatMoney(amount: number | null | undefined, currency: string | null | undefined): string | null {
  if (amount == null || !currency) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function summarizeStripePrices(
  monthly: Stripe.Price | null,
  annual: Stripe.Price | null,
): StripePriceSummary {
  const monthlyAmount = monthly?.unit_amount ?? null;
  const annualAmount = annual?.unit_amount ?? null;
  const currency = monthly?.currency ?? annual?.currency ?? null;
  const annualMonthlyAmount = annualAmount == null ? null : annualAmount / 12;
  const annualDiscount =
    monthlyAmount && annualAmount
      ? Math.max(0, (monthlyAmount * 12) - annualAmount)
      : null;

  return {
    monthlyPrice: formatMoney(monthlyAmount, currency),
    annualMonthlyEquiv: annualMonthlyAmount == null ? null : formatMoney(Math.round(annualMonthlyAmount), currency),
    annualTotal: formatMoney(annualAmount, currency),
    annualDiscountLabel: annualDiscount ? `${formatMoney(annualDiscount, currency)} saved yearly` : null,
  };
}

export async function getStripePricing(): Promise<{ singer: StripePriceSummary; organization: StripePriceSummary }> {
  if (cachedPricing && cachedPricing.expiresAt > Date.now()) {
    return cachedPricing.data;
  }

  const priceIds = [
    getStripePriceSingerPro(),
    getStripePriceSingerProAnnual(),
    getStripePriceOrgPro(),
    getStripePriceOrgProAnnual(),
  ].filter(Boolean) as string[];

  const uniqueIds = Array.from(new Set(priceIds));
  const prices = await Promise.all(uniqueIds.map((priceId) => getStripe().prices.retrieve(priceId)));
  const byId = new Map(prices.map((price) => [price.id, price]));
  const data = {
    singer: summarizeStripePrices(
      byId.get(getStripePriceSingerPro()) ?? null,
      getStripePriceSingerProAnnual() ? byId.get(getStripePriceSingerProAnnual()!) ?? null : null,
    ),
    organization: summarizeStripePrices(
      byId.get(getStripePriceOrgPro()) ?? null,
      getStripePriceOrgProAnnual() ? byId.get(getStripePriceOrgProAnnual()!) ?? null : null,
    ),
  };

  cachedPricing = { data, expiresAt: Date.now() + STRIPE_SYNC_INTERVAL_MS };
  return data;
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
      const subscriptionId = getInvoiceSubscriptionId(invoice);
      if (!subscriptionId) {
        throw new StripeWebhookProcessingError(`[stripe] invoice.payment_failed missing subscription for invoice ${invoice.id}`);
      }
      const sub = await getStripe().subscriptions.retrieve(subscriptionId);
      await applySubscriptionUpdate(sub);
      break;
    }
    default:
      break;
  }
}
