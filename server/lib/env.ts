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
