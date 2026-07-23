# Local Stripe testing (start here)

Use this flow before deploying to Vercel/Railway. Locally, **one server** serves both the app and API at `http://localhost:5000`.

## 1. Add Stripe vars to `.env`

Copy from `.env.example` and fill in your **Stripe test mode** values:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SINGER_PRO=price_...
STRIPE_PRICE_SINGER_PRO_ANNUAL=price_...
STRIPE_PRICE_ORG_PRO=price_...
STRIPE_PRICE_ORG_PRO_ANNUAL=price_...
```

You do **not** need `SITE_URL` for local dev — Checkout and the billing portal return to `http://localhost:5000` automatically in development.

## 2. Create Stripe test products

In the [Stripe Dashboard](https://dashboard.stripe.com/test/products) (Test mode ON):

| Plan | Price |
|------|-------|
| Singer Pro | $9.99/month |
| Singer Pro Annual | $99/year (shown as $8.25/mo billed annually) |
| Organization Pro | $79/month |
| Organization Pro Annual | $790/year (shown as $65.83/mo billed annually) |

Copy each **Price ID** into your `.env`. Annual price IDs are optional for monthly-only checkout, but required when a user selects **Annual**.

## 3. Run two terminals

**Terminal 1 — app**

```bash
npm run dev
```

On startup you should see either `[stripe] Ready` or a warning listing missing env vars.  
You can also check: `curl http://localhost:5000/api/stripe/status`

**Terminal 2 — webhooks**

```bash
npm run stripe:listen
```

Copy the `whsec_...` secret printed by the CLI into `STRIPE_WEBHOOK_SECRET` in `.env`, then restart Terminal 1.

> If webhooks are not running yet, checkout still works — after payment you return to the app and **`POST /api/stripe/sync`** updates your subscription from Stripe.

## 4. Test checkout

1. Open `http://localhost:5000`
2. Log in as a singer or organization
3. Go to **Pricing** → **Start free trial**
4. Pay with test card: `4242 4242 4242 4242` (any future expiry, any CVC)
5. You should return to Settings with Pro active (`stripe_subscription_status=trialing`)

## 5. Test billing portal

From **Settings** → **Manage billing** to cancel, update card, or view invoices.

---

# Full Stripe setup (test + production)

## Create a Stripe account

1. Register at https://dashboard.stripe.com/register
2. Turn on **Test mode** (toggle in the top-right)

## API keys

1. **Developers → API keys**
2. Copy the **Secret key** (`sk_test_...`) into `STRIPE_SECRET_KEY`

## Customer Portal

1. **Settings → Billing → Customer portal**
2. Enable cancel subscription, update payment method, and view invoices
3. Set cancellation to **at end of billing period**

## Railway (later)

Set on Railway:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (from Dashboard webhook endpoint, not CLI)
- `STRIPE_PRICE_SINGER_PRO`
- `STRIPE_PRICE_SINGER_PRO_ANNUAL`
- `STRIPE_PRICE_ORG_PRO`
- `STRIPE_PRICE_ORG_PRO_ANNUAL`
- `SITE_URL` (your public frontend URL, e.g. Vercel domain)

Webhook URL: `https://<railway-service>.up.railway.app/api/stripe/webhook`

Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

## Vercel (later)

Set `RAILWAY_API_URL` so `/api/stripe/*` proxies to Railway. No Stripe keys needed on Vercel for this architecture.

## Test cards

- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Decline: `4000 0000 0000 9995`

Docs: https://docs.stripe.com/testing
