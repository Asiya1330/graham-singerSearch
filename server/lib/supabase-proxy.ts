import express, { type Express, type Request, type Response } from "express";
import { getSupabaseUrl } from "./env";

/**
 * Same-origin passthrough to Supabase Auth.
 *
 * The browser client is pointed at `/api/sb` instead of the project URL, so the
 * network tab only ever shows this app's own origin. Note this is presentation,
 * not protection: the project URL and anon key are designed to be public, and
 * anyone can still read the JWT's `iss` claim. It removes the casual visibility,
 * nothing more.
 *
 * Only `/auth/v1/*` is forwarded — leaving `/rest/v1` open would turn this into
 * a same-origin gateway to every PostgREST table.
 */

const ALLOWED_PREFIX = "/auth/v1/";

// Hop-by-hop headers plus anything that would confuse the upstream fetch.
const SKIP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "content-length",
  "accept-encoding",
]);

const SKIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

export function registerSupabaseProxy(app: Express): void {
  // Mounted before express.json() so the body is forwarded byte-for-byte.
  app.use(
    "/api/sb",
    express.raw({ type: () => true, limit: "1mb" }),
    async (req: Request, res: Response) => {
      const path = req.path.startsWith("/") ? req.path : `/${req.path}`;

      if (!path.startsWith(ALLOWED_PREFIX)) {
        return res.status(404).json({
          code: "NOT_FOUND",
          message: "Unknown endpoint.",
        });
      }

      const target = new URL(`${getSupabaseUrl()}${path}`);
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string") target.searchParams.set(key, value);
      }

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (SKIP_REQUEST_HEADERS.has(key.toLowerCase())) continue;
        if (typeof value === "string") headers.set(key, value);
        else if (Array.isArray(value)) headers.set(key, value.join(", "));
      }

      // Supabase applies its own brute-force limits per client IP. Behind this
      // proxy it would otherwise see only our server, collapsing every visitor
      // into one bucket, so pass the caller's address along explicitly.
      const forwardedFor = req.headers["x-client-ip"] || req.ip;
      if (typeof forwardedFor === "string" && forwardedFor) {
        headers.set("x-forwarded-for", forwardedFor);
      }

      const hasBody = req.method !== "GET" && req.method !== "HEAD";
      const body =
        hasBody && Buffer.isBuffer(req.body) && req.body.length
          ? req.body
          : undefined;

      try {
        const upstream = await fetch(target, {
          method: req.method,
          headers,
          body,
          redirect: "manual",
        });

        upstream.headers.forEach((value, key) => {
          if (SKIP_RESPONSE_HEADERS.has(key.toLowerCase())) return;
          // Supabase may return several Set-Cookie values; append rather than set.
          if (key.toLowerCase() === "set-cookie") res.append(key, value);
          else res.setHeader(key, value);
        });

        res.status(upstream.status);
        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.end(buffer);
      } catch (error) {
        const err = error as Error & { cause?: unknown };
        console.error(
          "[supabase-proxy]",
          req.method,
          target.toString(),
          err.message,
          err.cause ?? "",
        );
        res.status(502).json({
          code: "SERVICE_UNAVAILABLE",
          message: "Authentication service is unavailable. Please try again.",
        });
      }
    },
  );
}
