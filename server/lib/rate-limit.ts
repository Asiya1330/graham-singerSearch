import type { Request, Response } from "express";
import rateLimit, { ipKeyGenerator, type Options } from "express-rate-limit";
import { sendApiError } from "./api-response";

/**
 * Rate limiting for the auth endpoints.
 *
 * Two things make a naive per-IP limiter wrong here:
 *
 * 1. In production the Vercel edge middleware calls the Railway backend with a
 *    server-side fetch, so the backend sees the edge egress IP rather than the
 *    visitor's. A per-IP bucket would then be shared by everyone at once, and a
 *    handful of failed logins anywhere would lock out registration everywhere.
 *    We therefore prefer the client IP the edge forwards in x-client-ip.
 *
 * 2. The interesting unit of abuse is usually an *account*, not an address.
 *    Where the request names an email we key on that, so one hammered account
 *    cannot consume everyone else's budget.
 *
 * Each endpoint gets its own limiter — sharing one instance across register and
 * login means failed sign-ins eat the registration allowance.
 */

/** Client address, preferring the value forwarded by the edge proxy. */
function clientIp(req: Request): string {
  const forwarded = req.headers["x-client-ip"];
  const candidate = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (candidate) {
    const first = candidate.split(",")[0]?.trim();
    // ipKeyGenerator normalises IPv6 into a /56 block so a single client
    // cannot cycle through addresses in its own subnet.
    if (first) return ipKeyGenerator(first);
  }
  return ipKeyGenerator(req.ip || "unknown");
}

function emailFrom(req: Request): string | null {
  const raw = req.body?.email;
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  return email || null;
}

function tooManyRequests(_req: Request, res: Response) {
  return sendApiError(res, "RATE_LIMITED");
}

type LimiterSpec = {
  /** Bucket name, so limiters never share counters. */
  name: string;
  windowMs: number;
  /** Attempts allowed per email (or per IP when no email is present). */
  max: number;
  /** Successful responses do not count. Use for login-shaped endpoints. */
  countFailuresOnly?: boolean;
};

function makeLimiter(spec: LimiterSpec) {
  const options: Partial<Options> = {
    windowMs: spec.windowMs,
    limit: spec.max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: !!spec.countFailuresOnly,
    handler: tooManyRequests,
    keyGenerator: (req: Request) => {
      const email = emailFrom(req);
      return email
        ? `${spec.name}:email:${email}`
        : `${spec.name}:ip:${clientIp(req)}`;
    },
  };
  return rateLimit(options);
}

/** Broad per-IP backstop so one host cannot cycle through many emails. */
function makeIpLimiter(name: string, windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: tooManyRequests,
    keyGenerator: (req: Request) => `${name}:ip:${clientIp(req)}`,
  });
}

/**
 * Registration. Generous per address — a real person retrying a form that
 * failed validation should never be locked out — with a wider per-IP backstop
 * against scripted signup floods.
 */
export const registerLimiter = [
  makeIpLimiter("register", 60 * 60 * 1000, 60),
  makeLimiter({ name: "register", windowMs: 60 * 60 * 1000, max: 10 }),
];

/**
 * Legacy password verification. Only failures count, so someone signing in
 * normally never approaches the limit; ten wrong passwords for one account in
 * fifteen minutes does.
 */
export const legacyLoginLimiter = [
  makeIpLimiter("legacylogin", 15 * 60 * 1000, 50),
  makeLimiter({
    name: "legacylogin",
    windowMs: 15 * 60 * 1000,
    max: 10,
    countFailuresOnly: true,
  }),
];

/** Password recovery. Kept tight — each attempt sends mail. */
export const forgotPasswordLimiter = [
  makeIpLimiter("forgot", 60 * 60 * 1000, 20),
  makeLimiter({ name: "forgot", windowMs: 60 * 60 * 1000, max: 5 }),
];

/** Authenticated session bookkeeping; loose, just a flood guard. */
export const sessionLimiter = makeIpLimiter("session", 15 * 60 * 1000, 120);
