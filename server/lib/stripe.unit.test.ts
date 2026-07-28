import test from "node:test";
import assert from "node:assert/strict";
import type Stripe from "stripe";
import "./load-env";

async function loadStripeModule() {
  return import("./stripe");
}

function makeSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return {
    id: "sub_test",
    object: "subscription",
    cancel_at_period_end: false,
    status: "active",
    trial_end: null,
    trial_start: null,
    created: nowSeconds,
    customer: "cus_test",
    metadata: {},
    items: {
      object: "list",
      data: [
        {
          id: "si_test",
          object: "subscription_item",
          current_period_end: nowSeconds + 86400,
          price: {
            id: "price_test",
            object: "price",
            active: true,
            billing_scheme: "per_unit",
            created: nowSeconds,
            currency: "usd",
            custom_unit_amount: null,
            livemode: false,
            lookup_key: null,
            metadata: {},
            nickname: null,
            product: "prod_test",
            recurring: {
              aggregate_usage: null,
              interval: "month",
              interval_count: 1,
              meter: null,
              trial_period_days: null,
              usage_type: "licensed",
            },
            tax_behavior: "unspecified",
            tiers_mode: null,
            transform_quantity: null,
            type: "recurring",
            unit_amount: 999,
            unit_amount_decimal: "999",
          } as Stripe.Price,
          plan: {
            id: "plan_test",
            object: "plan",
            active: true,
            aggregate_usage: null,
            amount: 999,
            amount_decimal: "999",
            billing_scheme: "per_unit",
            created: nowSeconds,
            currency: "usd",
            interval: "month",
            interval_count: 1,
            livemode: false,
            metadata: {},
            meter: null,
            nickname: null,
            product: "prod_test",
            tiers_mode: null,
            transform_usage: null,
            trial_period_days: null,
            usage_type: "licensed",
          } as Stripe.Plan,
          metadata: {},
          quantity: 1,
          subscription: "sub_test",
          tax_rates: [],
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: "/v1/subscription_items",
    } as Stripe.ApiList<Stripe.SubscriptionItem>,
    ...overrides,
  } as Stripe.Subscription;
}

test("reads invoice subscription id from API 2026 parent subscription details", () => {
  return loadStripeModule().then(({ getInvoiceSubscriptionId }) => {
  const invoice = {
    id: "in_test",
    object: "invoice",
    parent: {
      quote_details: null,
      subscription_details: {
        metadata: {},
        subscription: "sub_parent",
      },
      type: "subscription_details",
    },
  } as unknown as Stripe.Invoice;

    assert.equal(getInvoiceSubscriptionId(invoice), "sub_parent");
  });
});

test("keeps recent past_due subscriptions on pro during grace window", () => {
  return loadStripeModule().then(({ mapSubscriptionToDbUpdate }) => {
  const sub = makeSubscription({
    status: "past_due",
    items: {
      object: "list",
      data: [
        {
          id: "si_test",
          object: "subscription_item",
          current_period_end: Math.floor(Date.now() / 1000) - 60,
          price: makeSubscription().items.data[0].price,
          plan: makeSubscription().items.data[0].plan,
          metadata: {},
          quantity: 1,
          subscription: "sub_test",
          tax_rates: [],
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: "/v1/subscription_items",
    } as Stripe.ApiList<Stripe.SubscriptionItem>,
  });

    const update = mapSubscriptionToDbUpdate(sub);
    assert.equal(update.subscription_tier, "pro");
    assert.equal(update.stripe_subscription_status, "past_due");
  });
});

test("downgrades stale past_due subscriptions after grace window", () => {
  return loadStripeModule().then(({ mapSubscriptionToDbUpdate }) => {
  const sub = makeSubscription({
    status: "past_due",
    items: {
      object: "list",
      data: [
        {
          id: "si_test",
          object: "subscription_item",
          current_period_end: Math.floor((Date.now() - (4 * 24 * 60 * 60 * 1000)) / 1000),
          price: makeSubscription().items.data[0].price,
          plan: makeSubscription().items.data[0].plan,
          metadata: {},
          quantity: 1,
          subscription: "sub_test",
          tax_rates: [],
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: "/v1/subscription_items",
    } as Stripe.ApiList<Stripe.SubscriptionItem>,
  });

    const update = mapSubscriptionToDbUpdate(sub);
    assert.equal(update.subscription_tier, "free");
  });
});

test("uses the paid period end once a trial has converted", () => {
  return loadStripeModule().then(({ mapSubscriptionToDbUpdate }) => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Stripe leaves trial_end populated after the trial converts to paid.
    const sub = makeSubscription({ status: "active", trial_end: nowSeconds - 60 });

    const update = mapSubscriptionToDbUpdate(sub);
    assert.equal(update.subscription_tier, "pro");
    assert.ok(update.pro_expires_at instanceof Date);
    assert.ok(
      update.pro_expires_at!.getTime() > Date.now(),
      `expected a future expiry, got ${update.pro_expires_at?.toISOString()}`,
    );
  });
});

test("uses the trial end while the subscription is still trialing", () => {
  return loadStripeModule().then(({ mapSubscriptionToDbUpdate }) => {
    const trialEnd = Math.floor(Date.now() / 1000) + 3 * 86400;
    const sub = makeSubscription({ status: "trialing", trial_end: trialEnd });

    const update = mapSubscriptionToDbUpdate(sub);
    assert.equal(update.subscription_tier, "pro");
    assert.equal(update.pro_expires_at?.getTime(), trialEnd * 1000);
  });
});

test("sync prefers an active subscription over the stale one already on record", () => {
  return loadStripeModule().then(({ selectSubscriptionForSync }) => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const stale = makeSubscription({ id: "sub_stale", status: "canceled", created: nowSeconds - 3600 });
    const fresh = makeSubscription({ id: "sub_fresh", status: "active", created: nowSeconds });

    assert.equal(selectSubscriptionForSync([stale, fresh], "sub_stale")?.id, "sub_fresh");
  });
});

test("sync keeps the tracked subscription when statuses tie", () => {
  return loadStripeModule().then(({ selectSubscriptionForSync }) => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const tracked = makeSubscription({ id: "sub_tracked", status: "active", created: nowSeconds - 3600 });
    const other = makeSubscription({ id: "sub_other", status: "active", created: nowSeconds });

    assert.equal(selectSubscriptionForSync([tracked, other], "sub_tracked")?.id, "sub_tracked");
    assert.equal(selectSubscriptionForSync([tracked, other], null)?.id, "sub_other");
  });
});

test("throttles auth sync unless the last sync is stale", () => {
  return loadStripeModule().then(({ shouldSyncStripeState, STRIPE_SYNC_INTERVAL_MS }) => {
    assert.equal(
      shouldSyncStripeState({
        stripe_customer_id: "cus_test",
        stripe_subscription_status: "active",
        stripe_last_synced_at: new Date(Date.now() - STRIPE_SYNC_INTERVAL_MS + 30_000),
      }),
      false,
    );

    assert.equal(
      shouldSyncStripeState({
        stripe_customer_id: "cus_test",
        stripe_subscription_status: "past_due",
        stripe_last_synced_at: new Date(),
      }),
      true,
    );
  });
});
