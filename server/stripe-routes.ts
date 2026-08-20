import type { Express, Request, Response } from "express";
import {
  getStripeConfigStatus,
  isStripeCheckoutConfigured,
  isStripeWebhookConfigured,
} from "./lib/env";
import {
  cancelSubscription,
  claimStripeWebhookEvent,
  constructWebhookEvent,
  createCheckoutSession,
  createPortalSession,
  getStripePricing,
  getPeriodEnd,
  handleStripeWebhookEvent,
  hasActiveStripeSubscription,
  markStripeWebhookEventFailed,
  markStripeWebhookEventProcessed,
  resumeSubscription,
  StripeWebhookProcessingError,
  syncSubscriptionForUser,
} from "./lib/stripe";
import { storage } from "./storage";
import { currentUserType } from "./lib/auth-user";
import { describeErrorForLog, sendApiError, sendRouteError } from "./lib/api-response";
import { signSingerFiles } from "./lib/file-upload";

type AuthMiddleware = (req: Request, res: Response, next: () => void) => void;

const pendingCheckouts = new Map<string, number>();
const CHECKOUT_COOLDOWN_MS = 10_000;

function checkoutIdempotencyKey(userType: string, userId: number, interval: "monthly" | "annual"): string {
  return `checkout:${userType}:${userId}:${interval}:${Math.floor(Date.now() / CHECKOUT_COOLDOWN_MS)}`;
}

/**
 * Billing misconfiguration is an operator problem, not a user one. The specific
 * issue (missing key, wrong price id) goes to the server log; the caller gets
 * catalog copy that tells them what to do instead.
 */
function rejectStripeNotConfigured(res: Response, context: string): Response {
  const { issues } = getStripeConfigStatus();
  console.error(
    `[stripe] ${context} blocked — billing not configured: ${issues.join("; ") || "unknown reason"}`,
  );
  return sendApiError(res, "BILLING_NOT_CONFIGURED");
}

async function jsonBillingUser(
  res: Response,
  updated: Record<string, any>,
  extra: Record<string, any>,
) {
  const { password: _, ...safe } = updated;
  const signed = extra.userType === "singer" ? await signSingerFiles(safe) : safe;
  res.json({ ...signed, ...extra });
}

/** Resolves the signed-in user, or null after sending the auth error. */
function requireStripeUser(
  req: Request,
  res: Response,
): { userType: "singer" | "organization"; userId: number } | null {
  const userType = currentUserType(req);
  const userId = req.authUser?.id;
  if (!userType || !userId) {
    sendApiError(res, "NOT_AUTHENTICATED");
    return null;
  }
  return { userType: userType as "singer" | "organization", userId };
}

export function registerStripeRoutes(
  app: Express,
  requireAuth: AuthMiddleware,
): void {
  app.get("/api/stripe/status", (_req: Request, res: Response) => {
    res.json(getStripeConfigStatus());
  });

  app.get("/api/stripe/prices", async (_req: Request, res: Response) => {
    try {
      if (!isStripeCheckoutConfigured()) {
        return rejectStripeNotConfigured(res, "load pricing");
      }
      res.json(await getStripePricing());
    } catch (error: any) {
      sendRouteError(res, error, "PRICING_LOAD_FAILED", "load Stripe pricing");
    }
  });

  app.post("/api/stripe/checkout", requireAuth, async (req: Request, res: Response) => {
    let checkoutKey: string | null = null;
    try {
      if (!isStripeCheckoutConfigured()) {
        return rejectStripeNotConfigured(res, "start checkout");
      }

      const auth = requireStripeUser(req, res);
      if (!auth) return;
      const { userType, userId } = auth;

      checkoutKey = `${userType}:${userId}`;
      const lastCheckout = pendingCheckouts.get(checkoutKey);
      if (lastCheckout && Date.now() - lastCheckout < CHECKOUT_COOLDOWN_MS) {
        return sendApiError(res, "CHECKOUT_IN_PROGRESS");
      }
      pendingCheckouts.set(checkoutKey, Date.now());

      const interval = req.body?.interval === "annual" ? "annual" : "monthly";
      const idempotencyKey = checkoutIdempotencyKey(userType, userId, interval);

      if (userType === "singer") {
        const singer = await storage.getSinger(userId);
        if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
        if (hasActiveStripeSubscription(singer)) {
          return sendApiError(res, "SUBSCRIPTION_ALREADY_ACTIVE");
        }
        if (singer.subscription_tier === "pro" && !singer.stripe_subscription_id) {
          const reason = singer.founding_artist ? "Founding Artist" : singer.is_gifted ? "gifted" : "active Pro";
          return sendApiError(res, "SUBSCRIPTION_ALREADY_FREE", {
            message: `You already have free Pro access as a ${reason} member, so there's nothing to pay for.`,
          });
        }
        const url = await createCheckoutSession("singer", userId, singer.email, singer, interval, idempotencyKey);
        pendingCheckouts.set(checkoutKey, Date.now());
        return res.json({ url });
      }

      const org = await storage.getOrganization(userId);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");
      if (hasActiveStripeSubscription(org)) {
        return sendApiError(res, "SUBSCRIPTION_ALREADY_ACTIVE");
      }
      if (org.subscription_tier === "pro" && !org.stripe_subscription_id) {
        const reason = org.founding_org ? "Founding Organization" : org.is_gifted ? "gifted" : "active Pro";
        return sendApiError(res, "SUBSCRIPTION_ALREADY_FREE", {
          message: `You already have free Pro access as a ${reason} member, so there's nothing to pay for.`,
        });
      }
      const url = await createCheckoutSession("organization", userId, org.email, org, interval, idempotencyKey);
      pendingCheckouts.set(checkoutKey, Date.now());
      return res.json({ url });
    } catch (error: any) {
      if (checkoutKey) pendingCheckouts.delete(checkoutKey);
      sendRouteError(res, error, "CHECKOUT_FAILED", "start Stripe checkout");
    }
  });

  app.post("/api/stripe/portal", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!isStripeCheckoutConfigured()) {
        return rejectStripeNotConfigured(res, "open billing portal");
      }

      const auth = requireStripeUser(req, res);
      if (!auth) return;
      const { userType, userId } = auth;

      if (userType === "singer") {
        const singer = await storage.getSinger(userId);
        if (!singer?.stripe_customer_id) {
          return sendApiError(res, "BILLING_ACCOUNT_MISSING");
        }
        const url = await createPortalSession("singer", singer.stripe_customer_id);
        return res.json({ url });
      }

      const org = await storage.getOrganization(userId);
      if (!org?.stripe_customer_id) {
        return sendApiError(res, "BILLING_ACCOUNT_MISSING");
      }
      const url = await createPortalSession("organization", org.stripe_customer_id);
      return res.json({ url });
    } catch (error: any) {
      sendRouteError(res, error, "BILLING_PORTAL_FAILED", "open Stripe billing portal");
    }
  });

  app.post("/api/stripe/sync", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!isStripeCheckoutConfigured()) {
        return rejectStripeNotConfigured(res, "sync subscription");
      }

      const auth = requireStripeUser(req, res);
      if (!auth) return;
      const { userType, userId } = auth;

      const updated = await syncSubscriptionForUser(userType, userId);
      if (!updated) {
        return sendApiError(res, userType === "singer" ? "SINGER_NOT_FOUND" : "ORG_NOT_FOUND");
      }

      await jsonBillingUser(res, updated, { userType });
    } catch (error: any) {
      sendRouteError(res, error, "SUBSCRIPTION_SYNC_FAILED", "sync Stripe subscription");
    }
  });

  app.post("/api/stripe/cancel", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!isStripeCheckoutConfigured()) {
        return rejectStripeNotConfigured(res, "cancel subscription");
      }

      const auth = requireStripeUser(req, res);
      if (!auth) return;
      const { userType, userId } = auth;

      const user = userType === "singer"
        ? await storage.getSinger(userId)
        : await storage.getOrganization(userId);
      if (!user?.stripe_subscription_id) {
        return sendApiError(res, "SUBSCRIPTION_NOT_ACTIVE");
      }

      const sub = await cancelSubscription(user.stripe_subscription_id);
      const periodEnd = getPeriodEnd(sub);
      const expiresAt = periodEnd
        ? new Date(periodEnd * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : null;

      const updated = await syncSubscriptionForUser(userType, userId);
      if (!updated) {
        return sendApiError(res, userType === "singer" ? "SINGER_NOT_FOUND" : "ORG_NOT_FOUND");
      }
      await jsonBillingUser(res, updated, { userType, cancelAt: expiresAt });
    } catch (error: any) {
      sendRouteError(res, error, "SUBSCRIPTION_UPDATE_FAILED", "cancel Stripe subscription");
    }
  });

  app.post("/api/stripe/resume", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!isStripeCheckoutConfigured()) {
        return rejectStripeNotConfigured(res, "resume subscription");
      }

      const auth = requireStripeUser(req, res);
      if (!auth) return;
      const { userType, userId } = auth;

      const user = userType === "singer"
        ? await storage.getSinger(userId)
        : await storage.getOrganization(userId);
      if (!user?.stripe_subscription_id) {
        return sendApiError(res, "SUBSCRIPTION_NOT_CANCELLING");
      }

      await resumeSubscription(user.stripe_subscription_id);
      const updated = await syncSubscriptionForUser(userType, userId);
      if (!updated) {
        return sendApiError(res, userType === "singer" ? "SINGER_NOT_FOUND" : "ORG_NOT_FOUND");
      }
      await jsonBillingUser(res, updated, { userType });
    } catch (error: any) {
      sendRouteError(res, error, "SUBSCRIPTION_UPDATE_FAILED", "resume Stripe subscription");
    }
  });

  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    let webhookEventId: string | null = null;
    try {
      if (!isStripeWebhookConfigured()) {
        return rejectStripeNotConfigured(res, "receive webhook");
      }

      const signature = req.headers["stripe-signature"];
      const rawBody = req.rawBody;
      if (!Buffer.isBuffer(rawBody)) {
        return sendApiError(res, "WEBHOOK_BODY_MISSING");
      }

      const event = constructWebhookEvent(rawBody, signature);
      webhookEventId = event.id;
      const claim = await claimStripeWebhookEvent(event.id, event.type);
      if (claim === "skip") {
        return res.json({ received: true, duplicate: true });
      }

      await handleStripeWebhookEvent(event);
      await markStripeWebhookEventProcessed(event.id);
      res.json({ received: true });
    } catch (error: any) {
      // Status choice drives Stripe's retry behaviour: 4xx means "don't retry,
      // the request itself is wrong", 5xx means "retry, we failed to handle it".
      if (error?.type === "StripeSignatureVerificationError") {
        console.error(
          `[stripe] webhook signature rejected: ${describeErrorForLog(error)}`,
        );
        return sendApiError(res, "WEBHOOK_SIGNATURE_INVALID");
      }

      console.error(
        `[stripe] webhook processing failed${webhookEventId ? ` (event ${webhookEventId})` : ""}:`,
        error,
      );
      if (webhookEventId) {
        await markStripeWebhookEventFailed(webhookEventId, error);
      }
      return sendApiError(res, "WEBHOOK_PROCESSING_FAILED");
    }
  });
}
