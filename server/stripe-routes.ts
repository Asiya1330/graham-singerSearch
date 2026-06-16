import type { Express, Request, Response } from "express";
import {
  getStripeConfigStatus,
  isStripeCheckoutConfigured,
  isStripeWebhookConfigured,
} from "./lib/env";
import {
  constructWebhookEvent,
  createCheckoutSession,
  createPortalSession,
  handleStripeWebhookEvent,
  hasActiveStripeSubscription,
  syncSubscriptionForUser,
} from "./lib/stripe";
import { storage } from "./storage";

type AuthMiddleware = (req: Request, res: Response, next: () => void) => void;

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

      if (userType === "singer") {
        const singer = await storage.getSinger(userId);
        if (!singer) return res.status(404).json({ message: "Singer not found" });
        if (hasActiveStripeSubscription(singer)) {
          return res.status(400).json({ message: "You already have an active subscription" });
        }
        const url = await createCheckoutSession("singer", userId, singer.email, singer);
        return res.json({ url });
      }

      const org = await storage.getOrganization(userId);
      if (!org) return res.status(404).json({ message: "Organization not found" });
      if (hasActiveStripeSubscription(org)) {
        return res.status(400).json({ message: "You already have an active subscription" });
      }
      const url = await createCheckoutSession("organization", userId, org.email, org);
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
