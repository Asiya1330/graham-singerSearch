-- Migration: add_stripe_billing_interval
-- Date: 2026-07-12
-- Description: Adds stripe_billing_interval column to singers and organizations
--              to track whether the user is on a monthly or annual billing plan.
--              Populated automatically from Stripe subscription data during sync/webhook.

ALTER TABLE singers ADD COLUMN IF NOT EXISTS stripe_billing_interval text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_billing_interval text;
