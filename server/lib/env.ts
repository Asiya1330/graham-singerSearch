import fs from "fs";
import path from "path";

/** Supabase project URL, e.g. https://xxxx.supabase.co */
export function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    throw new Error(
      "SUPABASE_URL is required (Supabase → Project Settings → API → Project URL)",
    );
  }
  return url.replace(/\/$/, "");
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for server-side Storage (Supabase → API → service_role key). Never expose this in the frontend.",
    );
  }
  return key;
}

/**
 * Database connection string from Supabase (Transaction pooler, port 6543).
 * Supabase hosts PostgreSQL; the app connects via this URL for Drizzle and sessions.
 */
export function getSupabaseDatabaseUrl(): string {
  const url =
    process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "SUPABASE_DATABASE_URL is required (Supabase → Project Settings → Database → Connection string → Transaction pooler)",
    );
  }
  return url;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is required. Set a long random string in Railway / .env",
    );
  }
  return secret;
}

export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || "singer-uploads";
}

export function getClientBuildPath(): string {
  return path.resolve(process.cwd(), "dist", "public");
}

export function hasClientBuild(): boolean {
  return fs.existsSync(getClientBuildPath());
}

/** Railway/Vercel split deploy: API-only when dist/public is missing. */
export function shouldServeClient(): boolean {
  if (process.env.SERVE_CLIENT === "false") return false;
  if (process.env.SERVE_CLIENT === "true") return true;
  if (process.env.NODE_ENV === "production") {
    return hasClientBuild();
  }
  return true;
}

export type StripeConfigStatus = {
  checkoutReady: boolean;
  webhookReady: boolean;
  issues: string[];
  returnBaseUrl: string;
};

/** Checkout + portal only need secret key and price IDs. */
export function isStripeCheckoutConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_SINGER_PRO?.trim() &&
      process.env.STRIPE_PRICE_ORG_PRO?.trim(),
  );
}

/** Webhooks additionally require the signing secret (from Stripe CLI locally). */
export function isStripeWebhookConfigured(): boolean {
  return isStripeCheckoutConfigured() && Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

/** @deprecated Use isStripeCheckoutConfigured or isStripeWebhookConfigured */
export function isStripeConfigured(): boolean {
  return isStripeWebhookConfigured();
}

export function getStripeReturnBaseUrl(): string {
  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || "5000";
    return `http://localhost:${port}`;
  }
  const siteUrl = process.env.SITE_URL?.trim();
  if (siteUrl) return siteUrl.replace(/\/$/, "");
  return "https://singersearch.net";
}

export function getStripeConfigStatus(): StripeConfigStatus {
  const issues: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    issues.push("STRIPE_SECRET_KEY is missing");
  }
  if (!process.env.STRIPE_PRICE_SINGER_PRO?.trim()) {
    issues.push("STRIPE_PRICE_SINGER_PRO is missing");
  }
  if (!process.env.STRIPE_PRICE_ORG_PRO?.trim()) {
    issues.push("STRIPE_PRICE_ORG_PRO is missing");
  }
  if (process.env.NODE_ENV === "development" && !process.env.STRIPE_WEBHOOK_SECRET?.trim()) {
    issues.push("STRIPE_WEBHOOK_SECRET is missing — run `npm run stripe:listen` and copy whsec_...");
  }

  return {
    checkoutReady: isStripeCheckoutConfigured(),
    webhookReady: isStripeWebhookConfigured(),
    issues,
    returnBaseUrl: getStripeReturnBaseUrl(),
  };
}

export function logStripeConfigStatus(source = "startup"): void {
  const status = getStripeConfigStatus();
  if (status.checkoutReady && status.webhookReady) {
    console.log(
      `[stripe] Ready (${source}) — return URL ${status.returnBaseUrl}`,
    );
    return;
  }
  if (status.checkoutReady) {
    console.warn(
      `[stripe] Checkout ready, webhooks not configured (${source}) — ${status.issues.join("; ")}. Checkout return sync will still work via POST /api/stripe/sync.`,
    );
    return;
  }
  console.warn(
    `[stripe] Not ready (${source}) — ${status.issues.join("; ") || "unknown issue"}`,
  );
}

export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe billing");
  }
  return key;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required for Stripe webhooks");
  }
  return secret;
}

export function getStripePriceSingerPro(): string {
  const price = process.env.STRIPE_PRICE_SINGER_PRO?.trim();
  if (!price) {
    throw new Error("STRIPE_PRICE_SINGER_PRO is required for Singer Pro checkout");
  }
  return price;
}

export function getStripePriceSingerProAnnual(): string | null {
  return process.env.STRIPE_PRICE_SINGER_PRO_ANNUAL?.trim() || null;
}

export function getStripePriceOrgPro(): string {
  const price = process.env.STRIPE_PRICE_ORG_PRO?.trim();
  if (!price) {
    throw new Error("STRIPE_PRICE_ORG_PRO is required for Organization Pro checkout");
  }
  return price;
}
