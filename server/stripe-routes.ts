import type { Express, Request, Response } from "express";
import {
  getStripeConfigStatus,
  isStripeCheckoutConfigured,
  isStripeWebhookConfigured,
} from "./lib/env";
import {
  cancelSubscription,
  constructWebhookEvent,
  createCheckoutSession,
  createPortalSession,
  getPeriodEnd,
  handleStripeWebhookEvent,
  hasActiveStripeSubscription,
  resumeSubscription,
  syncSubscriptionForUser,
} from "./lib/stripe";
import { storage } from "./storage";

type AuthMiddleware = (req: Request, res: Response, next: () => void) => void;

const pendingCheckouts = new Map<string, number>();
const CHECKOUT_COOLDOWN_MS = 10_000;

function stripeNotReadyMessage(): string {
  const { issues } = getStripeConfigStatus();
  return issues[0] || "Stripe billing is not configured yet. See SETUP-STRIPE.md";
}

export function registerStripeRoutes(
  app: Express,
  requireAuth: AuthMiddleware,
): void {
  app.get("/api/stripe/status", (_req: Request, res: Response) => {
    res.json(getStripeConfigStatus());
  });

  app.post("/api/stripe/checkout", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!isStripeCheckoutConfigured()) {
        return res.status(503).json({ message: stripeNotReadyMessage() });
      }

      const userType = req.session.userType;
      const userId = req.session.userId;
      if (!userType || !userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const checkoutKey = `${userType}:${userId}`;
      const lastCheckout = pendingCheckouts.get(checkoutKey);
      if (lastCheckout && Date.now() - lastCheckout < CHECKOUT_COOLDOWN_MS) {
        return res.status(429).json({ message: "A checkout session was just created. Please complete or cancel it before starting another." });
      }

      const interval = req.body?.interval === "annual" ? "annual" : "monthly";

      if (userType === "singer") {
        const singer = await storage.getSinger(userId);
        if (!singer) return res.status(404).json({ message: "Singer not found" });
        if (hasActiveStripeSubscription(singer)) {
          return res.status(400).json({ message: "You already have an active subscription" });
        }
        if (singer.subscription_tier === "pro" && !singer.stripe_subscription_id) {
          const reason = singer.founding_artist ? "Founding Artist" : singer.is_gifted ? "gifted" : "active Pro";
          return res.status(400).json({ message: `You already have free Pro access as a ${reason} member. No payment needed!` });
        }
        const url = await createCheckoutSession("singer", userId, singer.email, singer, interval);
        pendingCheckouts.set(checkoutKey, Date.now());
        return res.json({ url });
      }

      const org = await storage.getOrganization(userId);
      if (!org) return res.status(404).json({ message: "Organization not found" });
      if (hasActiveStripeSubscription(org)) {
        return res.status(400).json({ message: "You already have an active subscription" });
      }
      if (org.subscription_tier === "pro" && !org.stripe_subscription_id) {
        const reason = org.founding_org ? "Founding Organization" : org.is_gifted ? "gifted" : "active Pro";
        return res.status(400).json({ message: `You already have free Pro access as a ${reason} member. No payment needed!` });
      }
      const url = await createCheckoutSession("organization", userId, org.email, org);
      pendingCheckouts.set(checkoutKey, Date.now());
      return res.json({ url });
    } catch (error: any) {
      console.error("[stripe] checkout error:", error);
      res.status(500).json({ message: error.message || "Failed to start checkout" });
    }
  });

  app.post("/api/stripe/portal", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!isStripeCheckoutConfigured()) {
        return res.status(503).json({ message: stripeNotReadyMessage() });
      }

      const userType = req.session.userType;
      const userId = req.session.userId;
      if (!userType || !userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (userType === "singer") {
        const singer = await storage.getSinger(userId);
        if (!singer?.stripe_customer_id) {
          return res.status(400).json({ message: "No billing account found. Subscribe to Pro first." });
        }
        const url = await createPortalSession("singer", singer.stripe_customer_id);
        return res.json({ url });
      }

      const org = await storage.getOrganization(userId);
      if (!org?.stripe_customer_id) {
        return res.status(400).json({ message: "No billing account found. Subscribe to Pro first." });
      }
      const url = await createPortalSession("organization", org.stripe_customer_id);
      return res.json({ url });
    } catch (error: any) {
      console.error("[stripe] portal error:", error);
      res.status(500).json({ message: error.message || "Failed to open billing portal" });
    }
  });

  app.post("/api/stripe/sync", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!isStripeCheckoutConfigured()) {
        return res.status(503).json({ message: stripeNotReadyMessage() });
      }

      const userType = req.session.userType;
      const userId = req.session.userId;
      if (!userType || !userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const updated = await syncSubscriptionForUser(userType, userId);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...safe } = updated;
      res.json({ ...safe, userType });
    } catch (error: any) {
      console.error("[stripe] sync error:", error);
      res.status(500).json({ message: error.message || "Failed to sync subscription" });
    }
  });

  app.post("/api/stripe/cancel", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!isStripeCheckoutConfigured()) {
        return res.status(503).json({ message: stripeNotReadyMessage() });
      }

      const userType = req.session.userType;
      const userId = req.session.userId;
      if (!userType || !userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = userType === "singer"
        ? await storage.getSinger(userId)
        : await storage.getOrganization(userId);
      if (!user?.stripe_subscription_id) {
        return res.status(400).json({ message: "No active subscription to cancel" });
      }

      const sub = await cancelSubscription(user.stripe_subscription_id);
      const periodEnd = getPeriodEnd(sub);
      const expiresAt = periodEnd
        ? new Date(periodEnd * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : null;

      const updated = await syncSubscriptionForUser(userType, userId);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safe } = updated;
      res.json({ ...safe, userType, cancelAt: expiresAt });
    } catch (error: any) {
      console.error("[stripe] cancel error:", error);
      res.status(500).json({ message: error.message || "Failed to cancel subscription" });
    }
  });

  app.post("/api/stripe/resume", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!isStripeCheckoutConfigured()) {
        return res.status(503).json({ message: stripeNotReadyMessage() });
      }

      const userType = req.session.userType;
      const userId = req.session.userId;
      if (!userType || !userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = userType === "singer"
        ? await storage.getSinger(userId)
        : await storage.getOrganization(userId);
      if (!user?.stripe_subscription_id) {
        return res.status(400).json({ message: "No subscription to resume" });
      }

      await resumeSubscription(user.stripe_subscription_id);
      const updated = await syncSubscriptionForUser(userType, userId);
      if (!updated) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safe } = updated;
      res.json({ ...safe, userType });
    } catch (error: any) {
      console.error("[stripe] resume error:", error);
      res.status(500).json({ message: error.message || "Failed to resume subscription" });
    }
  });

  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    try {
      if (!isStripeWebhookConfigured()) {
        return res.status(503).json({ message: stripeNotReadyMessage() });
      }

      const signature = req.headers["stripe-signature"];
      const rawBody = req.rawBody;
      if (!Buffer.isBuffer(rawBody)) {
        return res.status(400).json({ message: "Missing request body" });
      }

      const event = constructWebhookEvent(rawBody, signature);
      await handleStripeWebhookEvent(event);
      res.json({ received: true });
    } catch (error: any) {
      console.error("[stripe] webhook error:", error);
      res.status(400).json({ message: error.message || "Webhook verification failed" });
    }
  });
}
