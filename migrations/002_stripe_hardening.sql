-- Migration: stripe_hardening
-- Date: 2026-07-28
-- Description: Adds Stripe sync metadata, organization trial tracking,
--              webhook idempotency storage, and unique indexes for Stripe IDs.

ALTER TABLE singers ADD COLUMN IF NOT EXISTS stripe_last_synced_at timestamp;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_last_synced_at timestamp;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_trial_started_at timestamp;

CREATE UNIQUE INDEX IF NOT EXISTS singers_stripe_customer_id_idx
  ON singers (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS singers_stripe_subscription_id_idx
  ON singers (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_stripe_customer_id_idx
  ON organizations (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS organizations_stripe_subscription_id_idx
  ON organizations (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  status text NOT NULL,
  attempts integer NOT NULL DEFAULT 1,
  last_error text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  processed_at timestamp
);
