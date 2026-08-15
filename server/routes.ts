import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage, pool, db } from "./storage";
import { geocodeCityState } from "./lib/geocode";
import { seedDatabase } from "./seed-data";
import {
  singers,
  organizations,
  engagementFeedback,
  contactReveals,
  searchLogs,
  creditAdjustments,
  insertSingerSchema,
  insertOrganizationSchema,
  insertSingerRoleSchema,
  insertSingerWorkSchema,
  insertAvailabilitySchema,
  insertEngagementFeedbackSchema,
  insertRepertoireSuggestionSchema,
} from "@shared/schema";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import multer from "multer";
import express from "express";
import { uploadToSupabaseStorage, signStoragePath, signSingerFiles, signSingerFilesBatch } from "./lib/file-upload";
import { getSessionSecret } from "./lib/env";
import {
  requireAdminAuth,
  requireSuperAdmin,
  extractBearerToken,
  peekAdminSession,
  normalizeAdminEmail,
} from "./lib/auth-admin";
import {
  listAdmins,
  listAdminAuditLogs,
  invitePendingAdmin,
  approvePendingAdmin,
  rejectPendingAdmin,
  revokeAdmin,
  clearAdminMfa,
  bootstrapSeedAdmins,
  getAdminById,
  publicAdminDto,
  publicAuditDto,
} from "./lib/admin-roster";
import { getAdminBootstrapSecret } from "./lib/env";
import {
  requireAuth,
  requireSinger,
  requireOrg,
  attachUser,
  currentUserId,
  currentUserType,
} from "./lib/auth-user";
import {
  normalizeEmail,
  isValidEmail,
  linkNewAuthUser,
  linkLegacyAccount,
  sendPasswordRecovery,
  verifyAccountPassword,
  changeAccountPassword,
  changeAccountEmail,
} from "./lib/auth-accounts";
import rateLimit from "express-rate-limit";
import {
  registerLimiter,
  legacyLoginLimiter,
  forgotPasswordLimiter,
  sessionLimiter,
} from "./lib/rate-limit";
import {
  notifyNewRegistration,
  notifyRegistrationConfirmation,
  notifySingerApproved,
  getEmailConfigStatus,
  sendTestEmail,
} from "./lib/email";
import { eq, desc, and } from "drizzle-orm";
import { HttpApiError, sendApiError, sendRouteError } from "./lib/api-response";
import { getApiError } from "@shared/api-errors";
import { registerStripeRoutes } from "./stripe-routes";
import { hasActiveStripeSubscription, shouldSyncStripeState, syncSubscriptionForUser } from "./lib/stripe";
import { isStripeCheckoutConfigured } from "./lib/env";

const scryptAsync = promisify(scrypt);

declare module "express-session" {
  interface SessionData {
    userId?: number;
    userType?: "singer" | "organization";
  }
}

/**
 * Verifies a pre-Supabase scrypt hash. The only remaining caller is
 * /api/auth/legacy-login, which uses it once per account to authorise the
 * migration to Supabase Auth. Delete this along with the `password` columns
 * once every account has a non-null auth_user_id.
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  if (!supplied || !stored || !stored.includes(".")) return false;
  const [saltHex, hashHex] = stored.split(".");
  if (!saltHex || !hashHex) return false;

  try {
    const salt = Buffer.from(saltHex, "hex");
    const storedHash = Buffer.from(hashHex, "hex");
    if (!storedHash.length) return false;

    const suppliedHash = (await scryptAsync(supplied, salt, 64)) as Buffer;
    if (storedHash.length !== suppliedHash.length) return false;

    return timingSafeEqual(storedHash, suppliedHash);
  } catch {
    return false;
  }
}

const PASSWORD_RESET_GENERIC_MESSAGE =
  "If an account exists for that email, password reset instructions have been sent.";

// requireAuth/requireSinger/requireOrg now live in lib/auth-user.ts and verify
// a Supabase Bearer token, falling back to the legacy session cookie during the
// cutover window.

// Keep under the Vercel edge proxy body limit (~4.5MB) so prod uploads through
// middleware.ts are not rejected before reaching the API.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / (1024 * 1024);

// Column names are not what the singer sees on the form, so validation errors
// name the field the way the UI labels it.
const MEDIA_FIELD_LABELS: Record<string, string> = {
  video_link_1: "first video",
  video_link_2: "second video",
  audio_link_1: "audio",
};

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(
        new HttpApiError("FILE_TYPE_INVALID", {
          message: "Resumes must be a PDF. Please export your file as PDF and upload it again.",
        }) as any,
        false,
      );
    }
  },
});

const headshotUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new HttpApiError("FILE_TYPE_INVALID", {
          message: "Headshots must be a JPG, PNG, or WebP image.",
        }) as any,
        false,
      );
    }
  },
});

// Multer's middleware errors (size/type) bypass the route try/catch and would
// otherwise surface as a generic 500 (and a hung client spinner). Wrap it so
// those become a clean, specific JSON response the client can act on.
function handleUpload(mw: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    mw(req, res, (err: any) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendApiError(res, "FILE_TOO_LARGE", {
          message: `That file is over the ${MAX_UPLOAD_MB}MB limit. Please upload a smaller file.`,
        });
      }
      return sendRouteError(res, err, "UPLOAD_FAILED", "file upload");
    });
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Legacy local uploads (dev only); production uses Supabase Storage URLs
  app.use("/uploads", express.static("uploads"));

  const PgStore = connectPgSimple(session);
  const isProduction = process.env.NODE_ENV === "production";

  app.use(
    session({
      store: new PgStore({ pool, tableName: "sessions" }),
      secret: getSessionSecret(),
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // The Vercel edge proxy (middleware.ts) makes the browser talk only to
        // the frontend origin, so the session cookie is effectively first-party.
        // "lax" then works in every environment and avoids the cross-site
        // "none" cookie being dropped by stricter browsers.
        secure: isProduction,
        sameSite: "lax",
      },
    })
  );

  registerStripeRoutes(app, requireAuth);

  // Auth Routes

  // --- Auth Routes (Supabase Auth: email + password, no MFA for singers/orgs) ---
  //
  // Registration is a two-step handshake: the client calls supabase.auth.signUp()
  // first (so Supabase sends the real confirmation email when that setting is on),
  // then posts the profile fields here. We look the new Auth user up by email,
  // create the profile row linked to it, and grant the role in app_metadata.

  app.post("/api/auth/register/singer", registerLimiter, async (req: Request, res: Response) => {
    try {
      const { email: emailRaw, password: _ignored, ...rest } = req.body;
      const email = normalizeEmail(emailRaw);
      if (!email) {
        return sendApiError(res, "EMAIL_PASSWORD_REQUIRED");
      }
      if (!isValidEmail(email)) {
        return sendApiError(res, "INVALID_EMAIL");
      }

      const existing = await storage.getSingerByEmail(email);
      if (existing) {
        return sendApiError(res, "EMAIL_ALREADY_REGISTERED");
      }

      // Supabase owns the credential; the auth user must already exist.
      const { authUserId, confirmationRequired } = await linkNewAuthUser(email, "singer");

      const parsed = insertSingerSchema.parse({
        email,
        ...rest,
        // Enforce location invariant: never trust client-supplied coords on create
        latitude: null,
        longitude: null,
        subscription_tier: 'free',
        subscription_status: 'active',
      });
      const singer = await storage.createSinger({ ...parsed, auth_user_id: authUserId });

      // Auto-geocode singer location on registration (best-effort, requires both city + state)
      if (singer.city && singer.state) {
        try {
          const coords = await geocodeCityState(singer.city, singer.state);
          if (coords) {
            await storage.updateSinger(singer.id, { latitude: coords.lat, longitude: coords.lng });
          }
        } catch (e) {
          console.warn(`[geocode] Failed for new singer ${singer.id}:`, e);
        }
      }

      const updated = await storage.getSinger(singer.id);
      const displayName = `${updated!.first_name} ${updated!.last_name}`.trim();
      void notifyNewRegistration({
        userType: "singer",
        userId: updated!.id,
        email: updated!.email,
        displayName,
        city: updated!.city,
        state: updated!.state,
        detailLabel: "Voice type",
        detailValue: updated!.primary_voice_type,
        isFoundingMember: false,
        registeredAt: updated!.created_at ?? new Date(),
      });
      void notifyRegistrationConfirmation({
        userType: "singer",
        email: updated!.email,
        displayName,
      });

      const { password: _, ...safe } = updated!;
      res.status(201).json({ ...safe, userType: "singer", confirmationRequired });
    } catch (error: any) {
      sendRouteError(res, error, "REGISTRATION_FAILED");
    }
  });

  app.post("/api/auth/register/organization", registerLimiter, async (req: Request, res: Response) => {
    try {
      const { email: emailRaw, password: _ignored, ...rest } = req.body;
      const email = normalizeEmail(emailRaw);
      if (!email) {
        return sendApiError(res, "EMAIL_PASSWORD_REQUIRED");
      }
      if (!isValidEmail(email)) {
        return sendApiError(res, "INVALID_EMAIL");
      }

      const existing = await storage.getOrganizationByEmail(email);
      if (existing) {
        return sendApiError(res, "EMAIL_ALREADY_REGISTERED");
      }

      const { authUserId, confirmationRequired } = await linkNewAuthUser(email, "organization");

      const parsed = insertOrganizationSchema.parse({
        email,
        ...rest,
        subscription_tier: 'free',
      });
      const org = await storage.createOrganization({ ...parsed, auth_user_id: authUserId });

      void notifyNewRegistration({
        userType: "organization",
        userId: org.id,
        email: org.email,
        displayName: org.organization_name,
        city: org.city,
        state: org.state,
        detailLabel: "Organization type",
        detailValue: org.organization_type,
        isFoundingMember: false,
        registeredAt: org.created_at ?? new Date(),
      });
      void notifyRegistrationConfirmation({
        userType: "organization",
        email: org.email,
        displayName: org.organization_name,
      });

      const { password: _, ...safe } = org;
      res.status(201).json({ ...safe, userType: "organization", confirmationRequired });
    } catch (error: any) {
      sendRouteError(res, error, "REGISTRATION_FAILED");
    }
  });

  /**
   * Cutover endpoint for accounts created before Supabase Auth.
   *
   * The client calls this only after supabase.auth.signInWithPassword() has
   * failed. We verify the legacy scrypt hash and, if it matches, mint the Auth
   * user with that same password so the client's retry succeeds. Runs once per
   * account: the local hash is cleared on success.
   */
  app.post("/api/auth/legacy-login", legacyLoginLimiter, async (req: Request, res: Response) => {
    try {
      const { email: emailRaw, password, userType } = req.body;
      const email = normalizeEmail(emailRaw);
      if (!email || !password || (userType !== "singer" && userType !== "organization")) {
        return sendApiError(res, "EMAIL_USER_TYPE_REQUIRED", "Please enter your email, your password, and your account type.");
      }

      const user =
        userType === "singer"
          ? await storage.getSingerByEmail(email)
          : await storage.getOrganizationByEmail(email);

      // Same generic answer whether the account is missing, already migrated,
      // or the password is wrong — this endpoint must not be an oracle.
      if (!user || !user.password || user.auth_user_id) {
        return sendApiError(res, "INVALID_PASSWORD");
      }

      const valid = await comparePasswords(String(password), user.password);
      if (!valid) {
        return sendApiError(res, "INVALID_PASSWORD");
      }

      await linkLegacyAccount(userType, user, String(password));
      res.json({ migrated: true });
    } catch (error: any) {
      sendRouteError(res, error, "LOGIN_FAILED");
    }
  });

  /**
   * Bump login_count and return the profile type. Called after a successful
   * client-side sign-in; the Bearer token is the proof of identity.
   */
  app.post("/api/auth/session", sessionLimiter, requireAuth, async (req: Request, res: Response) => {
    try {
      const ctx = req.authUser!;
      if (ctx.type === "organization") {
        const org = ctx.profile as typeof organizations.$inferSelect;
        await storage.updateOrganization(ctx.id, {
          login_count: (org.login_count || 0) + 1,
        });
      }
      res.json({ userType: ctx.type, id: ctx.id });
    } catch (error: any) {
      sendRouteError(res, error, "LOGIN_FAILED");
    }
  });

  /**
   * Supabase sends the recovery mail. Always returns the same message so the
   * endpoint cannot be used to enumerate registered addresses.
   */
  app.post("/api/auth/forgot-password", forgotPasswordLimiter, async (req: Request, res: Response) => {
    try {
      const { email: emailRaw, userType } = req.body;
      const email = normalizeEmail(emailRaw);
      if (!email || (userType !== "singer" && userType !== "organization")) {
        return sendApiError(res, "INVALID_USER_TYPE");
      }

      const user =
        userType === "singer"
          ? await storage.getSingerByEmail(email)
          : await storage.getOrganizationByEmail(email);

      if (user && !email.endsWith("@example.com")) {
        // Legacy accounts have no Auth user yet, so recovery would silently do
        // nothing. Create and link one first (random password — the recovery
        // link is what lets them back in).
        if (!user.auth_user_id) {
          try {
            await linkLegacyAccount(userType, user, randomBytes(24).toString("hex"));
          } catch (e) {
            console.warn("[forgot-password] link failed for", userType, user.id, (e as Error).message);
          }
        }
        await sendPasswordRecovery(email);
      }

      res.json({ message: PASSWORD_RESET_GENERIC_MESSAGE });
    } catch (error: any) {
      sendRouteError(res, error, "FORGOT_PASSWORD_FAILED");
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    // The Supabase session is cleared client-side; this only tears down any
    // leftover legacy cookie from before the cutover.
    if (!req.session) return res.json({ message: "Logged out" });
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      await attachUser(req, res, () => {});
      const ctx = req.authUser;
      if (!ctx) {
        return sendApiError(res, "NOT_AUTHENTICATED");
      }

      if (ctx.type === "singer") {
        let singer = await storage.getSinger(ctx.id);
        if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");

        if (isStripeCheckoutConfigured() && shouldSyncStripeState(singer)) {
          try {
            const synced = await syncSubscriptionForUser("singer", singer.id);
            if (synced) singer = synced as typeof singer;
          } catch (e) {
            console.warn("[auth/me] stripe sync failed for singer", singer.id, (e as Error).message);
          }
        }

        if (singer.subscription_tier === 'pro' && singer.pro_expires_at && new Date(singer.pro_expires_at) < new Date() && !hasActiveStripeSubscription(singer)) {
          singer = (await storage.updateSinger(singer.id, { subscription_tier: 'free', pro_expires_at: null, founding_artist: false, is_gifted: false }))!;
        }

        const [roles, works, availabilities] = await Promise.all([
          storage.getSingerRoles(singer.id),
          storage.getSingerWorks(singer.id),
          storage.getAvailabilities(singer.id),
        ]);

        const { password: _, ...safe } = singer;
        return res.json(await signSingerFiles({ ...safe, roles, works, availabilities, userType: "singer" }));
      }

      if (ctx.type === "organization") {
        let org = await storage.getOrganization(ctx.id);
        if (!org) return sendApiError(res, "ORG_NOT_FOUND");

        if (isStripeCheckoutConfigured() && shouldSyncStripeState(org)) {
          try {
            const synced = await syncSubscriptionForUser("organization", org.id);
            if (synced) org = synced as typeof org;
          } catch (e) {
            console.warn("[auth/me] stripe sync failed for org", org.id, (e as Error).message);
          }
        }

        if (org.subscription_tier === 'pro' && org.pro_expires_at && new Date(org.pro_expires_at) < new Date() && !hasActiveStripeSubscription(org)) {
          org = (await storage.updateOrganization(org.id, { subscription_tier: 'free', pro_expires_at: null, founding_org: false, is_gifted: false }))!;
        }

        const { password: _, ...safe } = org;
        return res.json({ ...safe, userType: "organization" });
      }

      sendApiError(res, "INVALID_SESSION");
    } catch (error: any) {
      sendRouteError(res, error, "PROFILE_LOAD_FAILED");
    }
  });

  // Singer Routes

  app.get("/api/singer/profile", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singer = await storage.getSinger(currentUserId(req));
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");

      const [roles, works, availabilities] = await Promise.all([
        storage.getSingerRoles(singer.id),
        storage.getSingerWorks(singer.id),
        storage.getAvailabilities(singer.id),
      ]);

      const { password: _, ...safe } = singer;
      res.json(await signSingerFiles({ ...safe, roles, works, availabilities }));
    } catch (error: any) {
      sendRouteError(res, error, "PROFILE_LOAD_FAILED");
    }
  });

  app.put("/api/singer/profile", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const {
        password, id, created_at, viewed_count, is_trending,
        admin_approved, admin_rejected, approval_seen,
        pro_expires_at, founding_artist, is_gifted,
        subscription_tier, is_pro_verified, is_management_verified,
        stripe_customer_id, stripe_subscription_id, stripe_subscription_status,
        confidence_tier, reliability_score, total_gigs,
        is_emergency_ready, latitude, longitude, email,
        ...updates
      } = req.body;
      if (updates.short_bio && updates.short_bio.length > 1700) {
        return sendApiError(res, "BIO_TOO_LONG");
      }
      if (updates.website_url && !/^https?:\/\//i.test(updates.website_url)) {
        return sendApiError(res, "INVALID_URL", {
          message: "Your website link must start with http:// or https://.",
          field: "website",
        });
      }
      for (const field of ["video_link_1", "video_link_2", "audio_link_1"]) {
        if (updates[field] && !/^https?:\/\//i.test(updates[field])) {
          return sendApiError(res, "INVALID_URL", {
            message: `Your ${MEDIA_FIELD_LABELS[field] ?? field} link must start with http:// or https://.`,
            field,
          });
        }
      }
      const existing = await storage.getSinger(currentUserId(req));
      const cityChanged = existing && (
        (updates.city ?? existing.city) !== existing.city ||
        (updates.state ?? existing.state) !== existing.state
      );
      let singer = await storage.updateSinger(currentUserId(req), { ...updates, last_updated: new Date() });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");

      if (cityChanged) {
        if (!singer.city || !singer.state) {
          singer = (await storage.updateSinger(singer.id, { latitude: null, longitude: null })) || singer;
        } else {
          const targetCity = singer.city;
          const targetState = singer.state;
          try {
            const coords = await geocodeCityState(targetCity, targetState);
            const current = await storage.getSinger(singer.id);
            if (current && current.city === targetCity && current.state === targetState) {
              singer = (await storage.updateSinger(singer.id, coords
                ? { latitude: coords.lat, longitude: coords.lng }
                : { latitude: null, longitude: null }
              )) || singer;
            }
          } catch (e) {
            console.warn(`[geocode] Failed for singer ${singer.id} on update:`, e);
          }
        }
      }

      const { password: _, ...safe } = singer;
      res.json(await signSingerFiles(safe));
    } catch (error: any) {
      sendRouteError(res, error, "PROFILE_UPDATE_FAILED");
    }
  });

  app.post("/api/singer/emergency/opt-out", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singer = await storage.updateSinger(currentUserId(req), {
        is_emergency_ready: false,
        emergency_status_requested: false,
      });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      const { password: _, ...safe } = singer;
      res.json(await signSingerFiles(safe));
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/singer/downgrade", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singer = await storage.getSinger(currentUserId(req));
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");

      if (singer.stripe_subscription_id) {
        return res.status(409).json({
          ...getApiError("SUBSCRIPTION_MANAGED_BY_PORTAL"),
          usePortal: true,
        });
      }

      const updated = await storage.updateSinger(currentUserId(req), {
        subscription_tier: 'free',
        pro_expires_at: null,
        founding_artist: false,
        is_gifted: false,
      });
      if (!updated) return sendApiError(res, "SINGER_NOT_FOUND");
      const { password: _, ...safe } = updated;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/org/downgrade", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const org = await storage.getOrganization(currentUserId(req));
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      if (org.stripe_subscription_id) {
        return res.status(409).json({
          ...getApiError("SUBSCRIPTION_MANAGED_BY_PORTAL"),
          usePortal: true,
        });
      }

      const updated = await storage.updateOrganization(currentUserId(req), {
        subscription_tier: 'free',
        pro_expires_at: null,
        founding_org: false,
        is_gifted: false,
        contact_reveal_limit: 3,
      });
      if (!updated) return sendApiError(res, "ORG_NOT_FOUND");
      const { password: _, ...safe } = updated;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/approval-seen", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singer = await storage.updateSinger(currentUserId(req), { approval_seen: true });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      const { password: _, ...safe } = singer;
      res.json(await signSingerFiles(safe));
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/singer/roles", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singerId = currentUserId(req);
      const { role_name, work_title, last_performed_date, experience_depth, status } = req.body;
      const VALID_DEPTHS = ['1-2', '3-5', '6-10', '10+'];
      const VALID_STATUSES = ['performed', 'in_preparation'];

      if (!role_name || !work_title) {
        return sendApiError(res, "ROLE_FIELDS_REQUIRED");
      }
      const dup = await pool.query(
        `SELECT id FROM singer_roles WHERE singer_id = $1 AND LOWER(role_name) = LOWER($2) AND LOWER(work_title) = LOWER($3) LIMIT 1`,
        [singerId, role_name, work_title]
      );
      if (dup.rows.length > 0) {
        return sendApiError(res, "ROLE_ALREADY_ADDED");
      }
      if (experience_depth && !VALID_DEPTHS.includes(experience_depth)) {
        return sendApiError(res, "INVALID_EXPERIENCE_DEPTH", {
          message: `Experience level must be one of: ${VALID_DEPTHS.join(", ")}.`,
        });
      }
      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return sendApiError(res, "INVALID_STATUS", {
          message: `Status must be one of: ${VALID_STATUSES.join(", ")}.`,
        });
      }
      if (last_performed_date) {
        const d = new Date(last_performed_date + "-01");
        const now = new Date();
        if (d > now) return sendApiError(res, "DATE_IN_FUTURE");
        if (d < new Date("1900-01-01")) return sendApiError(res, "DATE_TOO_EARLY");
      }
      let composer = req.body.composer;
      if (work_title) {
        const repoResult = await pool.query(
          `SELECT composer FROM repertoire_reference WHERE LOWER(work_title) = LOWER($1) AND composer IS NOT NULL LIMIT 1`,
          [work_title]
        );
        if (repoResult.rows[0]?.composer) composer = repoResult.rows[0].composer;
      }
      const parsed = insertSingerRoleSchema.parse({ ...req.body, singer_id: singerId, composer: composer || req.body.composer });
      const role = await storage.createSingerRole(parsed);
      res.status(201).json(role);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.delete("/api/singer/roles/:id", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id as string);
      const roles = await storage.getSingerRoles(currentUserId(req));
      const ownsRole = roles.some((r) => r.id === roleId);
      if (!ownsRole)
        return sendApiError(res, "NOT_RESOURCE_OWNER", {
          message: "That role is on another singer's profile, so you can't change it.",
        });

      await storage.deleteSingerRole(roleId);
      res.json({ message: "Role deleted" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/roles", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singerId = currentUserId(req);
      await storage.deleteSingerRoles(singerId);

      const rolesData = req.body as any[];
      const VALID_STATUSES = ['performed', 'in_preparation'];
      for (const r of rolesData) {
        if (r.status !== undefined && !VALID_STATUSES.includes(r.status)) {
          return sendApiError(res, "INVALID_STATUS", {
          message: `Status must be one of: ${VALID_STATUSES.join(", ")}.`,
        });
        }
      }
      const created = await Promise.all(
        rolesData.map((r) => {
          const parsed = insertSingerRoleSchema.parse({ ...r, singer_id: singerId });
          return storage.createSingerRole(parsed);
        })
      );

      res.json(created);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/singer/works", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singerId = currentUserId(req);
      const { work_title, last_performed_date, experience_depth, notable_ensembles, status } = req.body;
      const VALID_DEPTHS = ['1-2', '3-5', '6-10', '10+'];
      const VALID_STATUSES = ['performed', 'in_preparation'];

      if (!work_title) {
        return sendApiError(res, "WORK_TITLE_REQUIRED");
      }
      const dup = await pool.query(
        `SELECT id FROM singer_works WHERE singer_id = $1 AND LOWER(work_title) = LOWER($2) LIMIT 1`,
        [singerId, work_title]
      );
      if (dup.rows.length > 0) {
        return sendApiError(res, "WORK_ALREADY_ADDED");
      }
      if (experience_depth && !VALID_DEPTHS.includes(experience_depth)) {
        return sendApiError(res, "INVALID_EXPERIENCE_DEPTH", {
          message: `Experience level must be one of: ${VALID_DEPTHS.join(", ")}.`,
        });
      }
      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return sendApiError(res, "INVALID_STATUS", {
          message: `Status must be one of: ${VALID_STATUSES.join(", ")}.`,
        });
      }
      if (last_performed_date) {
        const d = new Date(last_performed_date + "-01");
        const now = new Date();
        if (d > now) return sendApiError(res, "DATE_IN_FUTURE");
        if (d < new Date("1900-01-01")) return sendApiError(res, "DATE_TOO_EARLY");
      }
      let composer = req.body.composer;
      if (work_title) {
        const repoResult = await pool.query(
          `SELECT composer FROM repertoire_reference WHERE LOWER(work_title) = LOWER($1) AND composer IS NOT NULL LIMIT 1`,
          [work_title]
        );
        if (repoResult.rows[0]?.composer) composer = repoResult.rows[0].composer;
      }
      const ensemblesArr = Array.isArray(notable_ensembles)
        ? notable_ensembles
        : typeof notable_ensembles === 'string' && notable_ensembles
          ? notable_ensembles.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];
      const parsed = insertSingerWorkSchema.parse({
        ...req.body,
        singer_id: singerId,
        composer: composer || req.body.composer,
        notable_ensembles: ensemblesArr,
      });
      const work = await storage.createSingerWork(parsed);
      res.status(201).json(work);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/works/:id", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const workId = parseInt(req.params.id as string);
      const singerId = currentUserId(req);
      const VALID_DEPTHS = ['1-2', '3-5', '6-10', '10+'];
      const VALID_STATUSES = ['performed', 'in_preparation'];
      const works = await storage.getSingerWorks(singerId);
      const ownsWork = works.some((w) => w.id === workId);
      if (!ownsWork)
        return sendApiError(res, "NOT_RESOURCE_OWNER", {
          message: "That work is on another singer's profile, so you can't change it.",
        });
      const { last_performed_date, experience_depth, work_title, notable_ensembles, status } = req.body;
      if (experience_depth && !VALID_DEPTHS.includes(experience_depth)) {
        return sendApiError(res, "INVALID_EXPERIENCE_DEPTH", {
          message: `Experience level must be one of: ${VALID_DEPTHS.join(", ")}.`,
        });
      }
      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return sendApiError(res, "INVALID_STATUS", {
          message: `Status must be one of: ${VALID_STATUSES.join(", ")}.`,
        });
      }
      if (last_performed_date) {
        const d = new Date(last_performed_date + "-01");
        const now = new Date();
        if (d > now) return sendApiError(res, "DATE_IN_FUTURE");
        if (d < new Date("1900-01-01")) return sendApiError(res, "DATE_TOO_EARLY");
      }
      let composer = req.body.composer;
      if (work_title) {
        const repoResult = await pool.query(
          `SELECT composer FROM repertoire_reference WHERE LOWER(work_title) = LOWER($1) AND composer IS NOT NULL LIMIT 1`,
          [work_title]
        );
        if (repoResult.rows[0]?.composer) composer = repoResult.rows[0].composer;
      }
      const ensemblesArr = Array.isArray(notable_ensembles)
        ? notable_ensembles
        : typeof notable_ensembles === 'string' && notable_ensembles
          ? notable_ensembles.split(",").map((s: string) => s.trim()).filter(Boolean)
          : undefined;
      const updates: any = { ...req.body };
      if (composer) updates.composer = composer;
      if (ensemblesArr !== undefined) updates.notable_ensembles = ensemblesArr;
      const updated = await pool.query(
        `UPDATE singer_works SET
            work_title = COALESCE($1, work_title),
            composer = COALESCE($2, composer),
            part_name = COALESCE($3, part_name),
            context = COALESCE($4, context),
            languages = COALESCE($5, languages),
            experience_depth = COALESCE($6, experience_depth),
            last_performed_date = COALESCE($7, last_performed_date),
            notable_ensembles = COALESCE($8, notable_ensembles),
            status = COALESCE($9, status)
         WHERE id = $10
         RETURNING *`,
        [
          updates.work_title ?? null,
          updates.composer ?? null,
          updates.part_name ?? null,
          updates.context ?? null,
          updates.languages ?? null,
          updates.experience_depth ?? null,
          updates.last_performed_date ?? null,
          updates.notable_ensembles ?? null,
          updates.status ?? null,
          workId,
        ]
      );
      res.json(updated.rows[0]);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.delete("/api/singer/works/:id", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const workId = parseInt(req.params.id as string);
      const works = await storage.getSingerWorks(currentUserId(req));
      const ownsWork = works.some((w) => w.id === workId);
      if (!ownsWork)
        return sendApiError(res, "NOT_RESOURCE_OWNER", {
          message: "That work is on another singer's profile, so you can't change it.",
        });

      await storage.deleteSingerWork(workId);
      res.json({ message: "Work deleted" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/works", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singerId = currentUserId(req);
      await storage.deleteSingerWorks(singerId);

      const worksData = req.body as any[];
      const VALID_STATUSES = ['performed', 'in_preparation'];
      for (const w of worksData) {
        if (w.status !== undefined && !VALID_STATUSES.includes(w.status)) {
          return sendApiError(res, "INVALID_STATUS", {
          message: `Status must be one of: ${VALID_STATUSES.join(", ")}.`,
        });
        }
      }
      const created = await Promise.all(
        worksData.map((w) => {
          const parsed = insertSingerWorkSchema.parse({ ...w, singer_id: singerId });
          return storage.createSingerWork(parsed);
        })
      );

      res.json(created);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/singer/availability", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const { start_date, end_date } = req.body;
      if (start_date && end_date && start_date > end_date) {
        return sendApiError(res, "DATE_RANGE_INVALID");
      }
      const parsed = insertAvailabilitySchema.parse({ ...req.body, singer_id: currentUserId(req) });
      const avail = await storage.createAvailability(parsed);
      res.status(201).json(avail);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.delete("/api/singer/availability/:id", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const availId = parseInt(req.params.id as string);
      const avails = await storage.getAvailabilities(currentUserId(req));
      const ownsAvail = avails.some((a) => a.id === availId);
      if (!ownsAvail)
        return sendApiError(res, "NOT_RESOURCE_OWNER", {
          message: "That availability entry is on another singer's profile, so you can't change it.",
        });

      await storage.deleteAvailability(availId);
      res.json({ message: "Availability deleted" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/emergency", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const { opt_in, lead_time, radius, modes, notes } = req.body;
      const singer = await storage.updateSinger(currentUserId(req), {
        emergency_opt_in: opt_in,
        emergency_lead_time_hours: lead_time,
        emergency_travel_radius_miles: radius,
        emergency_travel_modes: modes,
        emergency_notes: notes,
      });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");

      const { password: _, ...safe } = singer;
      res.json(await signSingerFiles(safe));
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // Organization / Search Routes

  app.get("/api/search/options", async (_req, res) => {
    try {
      const citiesResult = await pool.query(
        `SELECT DISTINCT city FROM singers WHERE admin_approved = true AND subscription_status = 'active' AND city IS NOT NULL ORDER BY city ASC`
      );
      const rolesResult = await pool.query(
        `SELECT DISTINCT role_name FROM singer_roles WHERE role_name IS NOT NULL ORDER BY role_name ASC`
      );
      res.json({
        cities: citiesResult.rows.map((r: { city: string }) => r.city),
        roles: rolesResult.rows.map((r: { role_name: string }) => r.role_name),
      });
    } catch (err) {
      sendRouteError(res, err, "SEARCH_OPTIONS_FAILED", "load search options");
    }
  });

  app.get("/api/repertoire/search", async (req: Request, res: Response) => {
    try {
      const q = ((req.query.q as string) || "").trim();
      const composerFilter = ((req.query.composer as string) || "").trim() || undefined;
      if (q.length < 2 && (!composerFilter || composerFilter.length < 2)) return res.json([]);
      const type = req.query.type as 'work' | 'role' | undefined;
      const validType = type === 'work' || type === 'role' ? type : undefined;
      const ALLOWED_CATEGORIES = new Set(['opera', 'oratorio', 'symphonic']);
      const categoriesParam = (req.query.categories as string | undefined) || '';
      const categories = categoriesParam
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter((c) => ALLOWED_CATEGORIES.has(c));
      const workTitleFilter = validType === 'role' ? ((req.query.workTitle as string) || '').trim() || undefined : undefined;
      const results = await storage.searchRepertoire(q, 10, validType, categories.length ? categories : undefined, workTitleFilter, composerFilter);
      res.json(
        results.map((r) => ({
          id: r.id,
          work_title: r.work_title,
          composer: r.composer,
          part_name: r.part_name,
          voice_type_primary: r.voice_type_primary,
          category: r.category,
        }))
      );
    } catch (err: any) {
      sendRouteError(res, err, "REPERTOIRE_SEARCH_FAILED", "search repertoire");
    }
  });

  app.get("/api/search", requireAuth, requireOrg, async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      const {
        voiceType,
        startDate,
        endDate,
        composer,
        roleOrWork,
        workTitle,
        role,
        unionStatus,
        represented,
        emergencyMode,
        performanceTypes,
        city,
        language,
        experienceLevel,
        managedOnly,
        radius_miles,
        state: searchState,
      } = req.query as Record<string, string | undefined>;

      // City abbreviation normalisation
      const CITY_ABBREVS: Record<string, string> = {
        NYC: "New York", NY: "New York", LA: "Los Angeles",
        DC: "Washington", SF: "San Francisco",
        Chi: "Chicago", CHI: "Chicago",
        Philly: "Philadelphia", PHILLY: "Philadelphia",
      };
      const resolvedCity = city ? (CITY_ABBREVS[city] || city) : undefined;

      const filters: any = {};
      if (voiceType && voiceType !== "any") filters.voiceType = voiceType;
      if (startDate && startDate !== "any") filters.startDate = startDate;
      if (endDate && endDate !== "any") filters.endDate = endDate;
      if (composer && composer !== "any") filters.composer = composer;
      if (roleOrWork && roleOrWork !== "any") filters.roleOrWork = roleOrWork;
      if (workTitle && workTitle !== "any") filters.workTitle = workTitle;
      if (role && role !== "any") filters.role = role;
      const trimmedState = (searchState || "").trim();

      // Validate location pair: both city and state required when either is present
      if ((resolvedCity && !trimmedState) || (!resolvedCity && trimmedState)) {
        return sendApiError(res, "LOCATION_INCOMPLETE");
      }

      // Radius (miles) — default 50, "any" means no radius cap
      let radiusVal: number = 50;
      if (radius_miles) {
        if (radius_miles === "any" || radius_miles === "Any") {
          radiusVal = 999999;
        } else {
          const parsed = parseInt(radius_miles, 10);
          if (Number.isFinite(parsed) && parsed > 0) radiusVal = parsed;
        }
      }

      // Geocode city + state together for proximity search; on failure return error (no fallback)
      if (resolvedCity && trimmedState) {
        try {
          const coords = await geocodeCityState(resolvedCity, trimmedState);
          if (!coords) {
            return sendApiError(res, "LOCATION_NOT_FOUND", {
              message: `We couldn't find "${resolvedCity}, ${trimmedState}". Please check the spelling and try again.`,
            });
          }
          filters.searchLat = coords.lat;
          filters.searchLng = coords.lng;
          filters.radiusMiles = radiusVal;
          // Pass the original text so singers without geocoded coordinates can
          // still match by city/state (see storage.searchSingers geo fallback).
          filters.cityFallback = resolvedCity;
          filters.stateFallback = trimmedState;
        } catch (e) {
          console.warn(`[search] Geocode failed for "${resolvedCity}, ${trimmedState}":`, e);
          return sendApiError(res, "LOCATION_LOOKUP_UNAVAILABLE");
        }
      }
      if (language && language.toLowerCase() !== "any") filters.language = language;
      if (experienceLevel && experienceLevel !== "any") filters.experienceLevel = experienceLevel;
      if (unionStatus && unionStatus !== "any") filters.unionStatus = unionStatus;
      if (represented && represented !== "any") filters.represented = represented;
      if (managedOnly && managedOnly !== "any") filters.managedOnly = managedOnly;
      if (emergencyMode === "true") filters.emergencyMode = true;
      if (performanceTypes) {
        const types = performanceTypes.split(",").filter(Boolean);
        if (types.length > 0) filters.performanceTypes = types;
      }

      // Intelligent work/role expansion using repertoire_reference
      const VOICE_TYPE_DB_TO_LABEL: Record<string, string> = {
        soprano: "Soprano",
        mezzo_soprano: "Mezzo-Soprano",
        contralto: "Contralto",
        countertenor: "Countertenor",
        tenor: "Tenor",
        baritone: "Baritone",
        bass: "Bass",
      };

      if (filters.workTitle) {
        // Save original for singer_works fallback
        filters.workTitleForWorks = filters.workTitle;

        if (filters.voiceType) {
          const dbVoiceTypes = Object.entries(VOICE_TYPE_DB_TO_LABEL)
            .filter(([, label]) => label.toLowerCase() === (filters.voiceType as string).toLowerCase())
            .map(([key]) => key);
          const repoResult = await pool.query(
            `SELECT DISTINCT part_name FROM repertoire_reference WHERE work_title ILIKE $1 AND voice_type_primary = ANY($2::text[])`,
            [`%${filters.workTitle}%`, dbVoiceTypes]
          );
          if (repoResult.rows.length > 0) {
            filters.roleNames = repoResult.rows.map((r: any) => (r.part_name as string).toLowerCase());
            delete filters.voiceType;
          }
        } else {
          const repoResult = await pool.query(
            `SELECT DISTINCT part_name FROM repertoire_reference WHERE work_title ILIKE $1`,
            [`%${filters.workTitle}%`]
          );
          if (repoResult.rows.length > 0) {
            filters.roleNames = repoResult.rows.map((r: any) => (r.part_name as string).toLowerCase());
          }
        }
        delete filters.workTitle;
      } else if (filters.role && !filters.voiceType) {
        // Role with no voice type — use voice type for ORDER BY priority only
        const roleResult = await pool.query(
          `SELECT voice_type_primary FROM repertoire_reference WHERE LOWER(part_name) = LOWER($1) LIMIT 1`,
          [filters.role]
        );
        if (roleResult.rows[0]?.voice_type_primary) {
          const label = VOICE_TYPE_DB_TO_LABEL[roleResult.rows[0].voice_type_primary as string];
          if (label) filters.roleVoiceType = label;
        }
      }

      await storage.createSearchLog(currentUserId(req), filters);

      let results = await storage.searchSingers(filters);
      const cityFallback = false;
      const searchedCity = resolvedCity || null;

      const org = await storage.getOrganization(currentUserId(req));
      if (filters.emergencyMode && org && org.subscription_tier !== 'pro') {
        results = results.slice(0, 5);
      }

      const revealedIds = await storage.getRevealedSingerIds(currentUserId(req));
      const revealedSet = new Set(revealedIds);

      const sanitized = await signSingerFilesBatch(
        results.map((singer) => {
          const { password: _, ...safe } = singer;
          const revealed = revealedSet.has(singer.id);
          if (!revealed) {
            return { ...safe, email: undefined, agent_email: undefined, revealed: false };
          }
          return { ...safe, revealed: true };
        }),
      );

      // Smart no-results diagnostic
      let noResultsDiagnostic: null | { mostRestrictiveFilter: string; suggestion: string } = null;
      if (sanitized.length === 0) {
        const FRIENDLY: Record<string, string> = {
          city: "location", voiceType: "voice type", roleNames: "work/role",
          role: "role", experienceLevel: "experience level",
          performanceTypes: "performance type", unionStatus: "union status",
          represented: "representation status", startDate: "availability date",
        };
        const diagnosticKeys = ['city', 'voiceType', 'roleNames', 'role', 'experienceLevel', 'performanceTypes', 'unionStatus', 'represented', 'startDate'];
        let bestKey = '';
        let bestCount = 0;
        for (const key of diagnosticKeys) {
          if (!filters[key]) continue;
          const testF: any = { ...filters };
          delete testF[key];
          if (key === 'roleNames') { delete testF.workTitleForWorks; delete testF.roleVoiceType; }
          if (key === 'startDate') delete testF.endDate;
          const cnt = await storage.countSingers(testF);
          if (cnt > bestCount) { bestCount = cnt; bestKey = key; }
        }
        if (bestKey && bestCount > 0) {
          noResultsDiagnostic = {
            mostRestrictiveFilter: bestKey,
            suggestion: `Removing the ${FRIENDLY[bestKey] || bestKey} filter would show ${bestCount} singer${bestCount === 1 ? '' : 's'}`,
          };
        }
      }

      res.json({
        results: sanitized,
        totalCount: sanitized.length,
        cityFallback,
        searchedCity: cityFallback ? searchedCity : null,
        noResultsDiagnostic,
      });
    } catch (error: any) {
      sendRouteError(res, error, "SEARCH_FAILED");
    }
  });

  app.post("/api/contact-reveal", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const { singerId, isEmergency } = req.body;
      const orgId = currentUserId(req);

      const org = await storage.getOrganization(orgId);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      const credits = isEmergency ? 2 : 1;
      const used = org.contact_reveals_used_this_month ?? 0;
      const limit = org.contact_reveal_limit ?? 3;
      const isPro = org.subscription_tier === 'pro';

      if (!isPro && used + credits > limit) {
        return sendApiError(res, "UPGRADE_REQUIRED");
      }

      await storage.createContactReveal({
        org_id: orgId,
        singer_id: singerId,
        is_emergency: isEmergency || false,
        credits_used: credits,
      });

      await storage.updateOrganization(orgId, {
        contact_reveals_used_this_month: used + credits,
      });

      const singer = await storage.getSinger(singerId);
      if (singer) {
        await storage.updateSinger(singerId, {
          viewed_count: (singer.viewed_count ?? 0) + 1,
        });

        res.json({
          email: singer.email,
          agent_name: singer.agent_name,
          agent_email: singer.agent_email,
          website_url: singer.website_url,
        });
      } else {
        sendApiError(res, "SINGER_NOT_FOUND");
      }
    } catch (error: any) {
      sendRouteError(res, error, "CONTACT_REVEAL_FAILED");
    }
  });

  app.get("/api/org/profile", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const org = await storage.getOrganization(currentUserId(req));
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      const revealsResult = await pool.query(
        `SELECT cr.id, cr.singer_id, cr.revealed_at, cr.is_emergency, cr.credits_used,
                s.first_name, s.last_name, s.primary_voice_type
         FROM contact_reveals cr
         JOIN singers s ON s.id = cr.singer_id
         WHERE cr.org_id = $1
         ORDER BY cr.revealed_at DESC`,
        [org.id]
      );

      const { password: _, ...safe } = org;
      res.json({ ...safe, reveals: revealsResult.rows });
    } catch (error: any) {
      sendRouteError(res, error, "PROFILE_LOAD_FAILED");
    }
  });

  app.put("/api/org/profile", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const {
        password, id, created_at, admin_approved, admin_rejected, verified,
        contact_reveals_used_this_month, contact_reveals_used,
        contact_reveal_limit, subscription_tier,
        pro_expires_at, founding_org, is_gifted, email,
        stripe_customer_id, stripe_subscription_id, stripe_subscription_status,
        ...updates
      } = req.body;
      const org = await storage.updateOrganization(currentUserId(req), updates);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      const { password: _, ...safe } = org;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "PROFILE_UPDATE_FAILED");
    }
  });

  app.put("/api/org/subscription", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const { tier } = req.body;

      if (tier === "pro") {
        return sendApiError(res, "PRO_UPGRADE_REQUIRES_CHECKOUT");
      }

      const org = await storage.getOrganization(currentUserId(req));
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      if (tier === "free" && org.stripe_subscription_id) {
        return res.status(409).json({
          ...getApiError("SUBSCRIPTION_MANAGED_BY_PORTAL"),
          usePortal: true,
        });
      }

      const revealLimit = tier === "pro" ? 50 : 3;
      const updated = await storage.updateOrganization(currentUserId(req), {
        subscription_tier: tier,
        contact_reveal_limit: revealLimit,
      });
      if (!updated) return sendApiError(res, "ORG_NOT_FOUND");

      const { password: _, ...safe } = updated;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // Admin Auth Routes (Supabase Auth + MFA; business routes keep requireAdminAuth)
  const adminAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const bootstrapLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post(
    "/api/admin/auth/bootstrap",
    bootstrapLimiter,
    async (req: Request, res: Response) => {
      try {
        const configured = getAdminBootstrapSecret();
        if (!configured) {
          return sendApiError(res, "ADMIN_BOOTSTRAP_UNAUTHORIZED");
        }
        const header = req.headers.authorization || "";
        const provided = header.startsWith("Bearer ")
          ? header.slice(7).trim()
          : String(req.headers["x-admin-bootstrap-secret"] || "").trim();
        if (!provided || provided !== configured) {
          return sendApiError(res, "ADMIN_BOOTSTRAP_UNAUTHORIZED");
        }
        const result = await bootstrapSeedAdmins();
        res.json(result);
      } catch (error: any) {
        sendRouteError(res, error, "OPERATION_FAILED");
      }
    },
  );

  app.post("/api/admin/auth/login", (_req: Request, res: Response) => {
    return sendApiError(
      res,
      "ADMIN_AUTH_REQUIRED",
      "Admin password login is disabled. Sign in with your admin email at /admin/login.",
    );
  });

  app.post("/api/admin/auth/logout", (_req: Request, res: Response) => {
    res.json({ success: true });
  });

  app.get(
    "/api/admin/auth/check",
    adminAuthLimiter,
    async (req: Request, res: Response) => {
      try {
        const token = extractBearerToken(req);
        const state = await peekAdminSession(token);
        res.json(state);
      } catch {
        res.json({ authenticated: false, mfaRequired: false });
      }
    },
  );

  app.get("/api/admin/auth/me", requireAdminAuth, (req: Request, res: Response) => {
    res.json({
      authenticated: true,
      admin: publicAdminDto(req.adminAuth!.admin),
    });
  });

  app.get("/api/admin/auth/admins", requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const rows = await listAdmins();
      res.json(rows.map(publicAdminDto));
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.get(
    "/api/admin/auth/audit-log",
    requireAdminAuth,
    requireSuperAdmin,
    async (req: Request, res: Response) => {
      try {
        const limit = Number(req.query.limit) || 100;
        const rows = await listAdminAuditLogs(limit);
        res.json(rows.map(publicAuditDto));
      } catch (error: any) {
        sendRouteError(res, error, "OPERATION_FAILED");
      }
    },
  );

  app.post(
    "/api/admin/auth/invite",
    requireAdminAuth,
    requireSuperAdmin,
    adminAuthLimiter,
    async (req: Request, res: Response) => {
      try {
        const email = normalizeAdminEmail(req.body?.email);
        const created = await invitePendingAdmin(email, req.adminAuth!.admin);
        res.status(201).json(publicAdminDto(created));
      } catch (error: any) {
        sendRouteError(res, error, "OPERATION_FAILED");
      }
    },
  );

  app.post(
    "/api/admin/auth/admins/:id/approve",
    requireAdminAuth,
    requireSuperAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const pending = await getAdminById(id);
        if (!pending) return sendApiError(res, "ADMIN_INVITE_INVALID");
        const updated = await approvePendingAdmin(pending, req.adminAuth!.admin);
        res.json(publicAdminDto(updated));
      } catch (error: any) {
        sendRouteError(res, error, "OPERATION_FAILED");
      }
    },
  );

  app.post(
    "/api/admin/auth/admins/:id/reject",
    requireAdminAuth,
    requireSuperAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const pending = await getAdminById(id);
        if (!pending) return sendApiError(res, "ADMIN_INVITE_INVALID");
        const updated = await rejectPendingAdmin(pending, req.adminAuth!.admin);
        res.json(publicAdminDto(updated));
      } catch (error: any) {
        sendRouteError(res, error, "OPERATION_FAILED");
      }
    },
  );

  app.delete(
    "/api/admin/auth/admins/:id",
    requireAdminAuth,
    requireSuperAdmin,
    async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);
        const target = await getAdminById(id);
        if (!target) return sendApiError(res, "ADMIN_INVITE_INVALID");
        const updated = await revokeAdmin(target, req.adminAuth!.admin);
        res.json(publicAdminDto(updated));
      } catch (error: any) {
        sendRouteError(res, error, "OPERATION_FAILED");
      }
    },
  );

  app.post(
    "/api/admin/auth/clear-mfa",
    requireAdminAuth,
    requireSuperAdmin,
    async (req: Request, res: Response) => {
      try {
        const adminId = req.body?.adminId != null ? Number(req.body.adminId) : undefined;
        const email = typeof req.body?.email === "string" ? req.body.email : undefined;
        if (adminId == null && !email) {
          return sendApiError(res, "VALIDATION_FAILED", "Provide either an admin ID or an email address to look up.");
        }
        const result = await clearAdminMfa(
          { adminId, email },
          req.adminAuth!.admin,
        );
        res.json(result);
      } catch (error: any) {
        sendRouteError(res, error, "OPERATION_FAILED");
      }
    },
  );

  app.get("/api/admin/email/status", requireAdminAuth, (_req: Request, res: Response) => {
    res.json(getEmailConfigStatus());
  });

  app.post("/api/admin/email/test", requireAdminAuth, async (_req: Request, res: Response) => {
    const result = await sendTestEmail();
    res.status(result.ok ? 200 : 502).json(result);
  });

  app.post("/api/admin/seed-demo", requireAdminAuth, async (_req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query("SELECT count(*)::int AS cnt FROM singers WHERE email LIKE '%@example.com'");
      const beforeCount = rows[0].cnt;
      const demoOrgEmails = [
        'sarah.mitchell@metopera.org',
        'casting@lyricchicago.org',
        'casting@operasanjose.org',
        'casting@azopera.org',
        'casting@operatampa.org',
        'casting@madisonopera.org',
        'casting@pbopera.org',
      ];
      const demoSingerSubquery = "SELECT id FROM singers WHERE email LIKE '%@example.com'";
      const demoOrgSubquery = "SELECT id FROM organizations WHERE email = ANY($1::text[])";

      await client.query("BEGIN");
      await client.query(`DELETE FROM shortlists WHERE singer_id IN (${demoSingerSubquery})`);
      await client.query(`DELETE FROM contact_reveals WHERE singer_id IN (${demoSingerSubquery})`);
      await client.query(`DELETE FROM engagement_feedback WHERE singer_id IN (${demoSingerSubquery})`);
      await client.query(`DELETE FROM availabilities WHERE singer_id IN (${demoSingerSubquery})`);
      await client.query(`DELETE FROM singer_roles WHERE singer_id IN (${demoSingerSubquery})`);
      await client.query(`DELETE FROM singer_works WHERE singer_id IN (${demoSingerSubquery})`);
      await client.query("DELETE FROM singers WHERE email LIKE '%@example.com'");
      await client.query(`DELETE FROM shortlists WHERE org_id IN (${demoOrgSubquery})`, [demoOrgEmails]);
      await client.query(`DELETE FROM contact_reveals WHERE org_id IN (${demoOrgSubquery})`, [demoOrgEmails]);
      await client.query(`DELETE FROM engagement_feedback WHERE org_id IN (${demoOrgSubquery})`, [demoOrgEmails]);
      await client.query(`DELETE FROM credit_adjustments WHERE org_id IN (${demoOrgSubquery})`, [demoOrgEmails]);
      await client.query("DELETE FROM organizations WHERE email = ANY($1::text[])", [demoOrgEmails]);
      await seedDatabase(client);
      await client.query("COMMIT");

      const { rows: after } = await client.query("SELECT count(*)::int AS cnt FROM singers WHERE email LIKE '%@example.com'");
      res.json({
        success: true,
        message: "Demo data seeded successfully",
        demoSingersBefore: beforeCount,
        demoSingersAfter: after[0].cnt,
      });
    } catch (error: any) {
      try { await client.query("ROLLBACK"); } catch {}
      console.error("[seed-demo] error:", error);
      sendRouteError(res, error, "OPERATION_FAILED");
    } finally {
      client.release();
    }
  });

  app.get("/api/admin/stats", requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.get("/api/admin/singers", requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const result = await db.select({
        id: singers.id,
        email: singers.email,
        first_name: singers.first_name,
        last_name: singers.last_name,
        primary_voice_type: singers.primary_voice_type,
        city: singers.city,
        state: singers.state,
        short_bio: singers.short_bio,
        admin_approved: singers.admin_approved,
        admin_rejected: singers.admin_rejected,
        founding_artist: singers.founding_artist,
        is_gifted: singers.is_gifted,
        pro_expires_at: singers.pro_expires_at,
        subscription_tier: singers.subscription_tier,
        subscription_status: singers.subscription_status,
        is_pro_verified: singers.is_pro_verified,
        is_emergency_ready: singers.is_emergency_ready,
        is_management_verified: singers.is_management_verified,
        reliability_score: singers.reliability_score,
        total_gigs: singers.total_gigs,
        confidence_tier: singers.confidence_tier,
        confidence_points: singers.confidence_points,
        flagged_for_review: singers.flagged_for_review,
        emergency_status_requested: singers.emergency_status_requested,
        created_at: singers.created_at,
      }).from(singers).orderBy(singers.created_at);
      res.json(result);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/admin/singers/:id/approve", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      const singer = await storage.updateSinger(singerId, { admin_approved: true, admin_rejected: false });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      void notifySingerApproved({
        email: singer.email,
        displayName: `${singer.first_name} ${singer.last_name}`.trim(),
      });
      res.json({ message: "Singer approved", id: singer.id, admin_approved: singer.admin_approved, admin_rejected: singer.admin_rejected });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/admin/singers/:id/reject", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      const singer = await storage.updateSinger(singerId, { admin_approved: false, admin_rejected: true });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      res.json({ message: "Singer rejected", id: singer.id, admin_approved: singer.admin_approved, admin_rejected: singer.admin_rejected });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/admin/singers/:id/deactivate", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      const singer = await storage.updateSinger(singerId, { subscription_status: "inactive" });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      res.json({ message: "Singer deactivated", id: singer.id });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/admin/singers/:id/activate", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      const singer = await storage.updateSinger(singerId, { subscription_status: "active" });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      res.json({ message: "Singer activated", id: singer.id });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.delete("/api/admin/singers/:id", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      await storage.deleteContactRevealsBySinger(singerId);
      await storage.deleteShortlistsBySinger(singerId);
      await storage.deleteSingerRoles(singerId);
      await storage.deleteSingerWorks(singerId);
      await storage.deleteAvailabilities(singerId);
      await storage.deleteSinger(singerId);
      res.json({ message: "Singer deleted" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/admin/singers/:id/edit", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      const { password, id, created_at, viewed_count, is_trending, pro_expires_at, founding_artist, is_gifted, ...updates } = req.body;
      if (updates.email && typeof updates.email === "string") {
        updates.email = updates.email.trim().toLowerCase();
      }
      const before = await storage.getSinger(singerId);
      const cityChanged = before && (
        (updates.city ?? before.city) !== before.city ||
        (updates.state ?? before.state) !== before.state
      );
      let singer = await storage.updateSinger(singerId, updates);
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      if (cityChanged) {
        if (!singer.city || !singer.state) {
          singer = (await storage.updateSinger(singer.id, { latitude: null, longitude: null })) || singer;
        } else {
          const targetCity = singer.city;
          const targetState = singer.state;
          try {
            const coords = await geocodeCityState(targetCity, targetState);
            const current = await storage.getSinger(singer.id);
            if (current && current.city === targetCity && current.state === targetState) {
              singer = (await storage.updateSinger(singer.id, coords
                ? { latitude: coords.lat, longitude: coords.lng }
                : { latitude: null, longitude: null }
              )) || singer;
            }
          } catch (e) {
            console.warn(`[geocode] Failed for singer ${singer.id} on admin edit:`, e);
          }
        }
      }
      const { password: _, ...safe } = singer;
      res.json(await signSingerFiles(safe));
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.get("/api/admin/singers/:id", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      const singer = await storage.getSinger(singerId);
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      const [roles, works, avails, giftHistory] = await Promise.all([
        storage.getSingerRoles(singerId),
        storage.getSingerWorks(singerId),
        storage.getAvailabilities(singerId),
        storage.getAdminGifts('singer', singerId),
      ]);
      const { password: _, ...safe } = singer;
      res.json(await signSingerFiles({ ...safe, roles, works, availabilities: avails, gift_history: giftHistory }));
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Admin Gift Pro ───────────────────────────────────────────────────────
  const computeGiftExpiry = (duration: string, customDate?: string): { expiresAt: Date; durationDays: number } | null => {
    const PRESETS: Record<string, number> = { '1m': 30, '3m': 90, '6m': 180, '1y': 365 };
    if (PRESETS[duration]) {
      const days = PRESETS[duration];
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      return { expiresAt, durationDays: days };
    }
    if (duration === 'custom' && customDate) {
      const expiresAt = new Date(customDate);
      if (isNaN(expiresAt.getTime())) return null;
      const now = new Date();
      if (expiresAt <= now) return null;
      const durationDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { expiresAt, durationDays };
    }
    return null;
  };

  app.post("/api/admin/singers/:id/gift-pro", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      const { duration, customDate, reason } = req.body;
      const computed = computeGiftExpiry(duration, customDate);
      if (!computed) return sendApiError(res, "INVALID_DURATION");

      const singer = await storage.getSinger(singerId);
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");

      const existing = singer.pro_expires_at ? new Date(singer.pro_expires_at) : null;
      const finalExpiry = existing && existing > computed.expiresAt ? existing : computed.expiresAt;
      const updated = await storage.updateSinger(singerId, {
        subscription_tier: 'pro',
        subscription_status: 'active',
        pro_expires_at: finalExpiry,
        is_gifted: true,
      });
      const gift = await storage.createAdminGift({
        recipient_type: 'singer',
        recipient_id: singerId,
        duration_days: computed.durationDays,
        expires_at: computed.expiresAt,
        reason: reason || null,
      });
      const { password: _, ...safe } = updated!;
      res.json({ singer: await signSingerFiles(safe), gift });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/admin/orgs/:id/gift-pro", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const orgId = parseInt(req.params.id as string);
      const { duration, customDate, reason } = req.body;
      const computed = computeGiftExpiry(duration, customDate);
      if (!computed) return sendApiError(res, "INVALID_DURATION");

      const org = await storage.getOrganization(orgId);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      const existing = org.pro_expires_at ? new Date(org.pro_expires_at) : null;
      const finalExpiry = existing && existing > computed.expiresAt ? existing : computed.expiresAt;
      const updated = await storage.updateOrganization(orgId, {
        subscription_tier: 'pro',
        pro_expires_at: finalExpiry,
        is_gifted: true,
      });
      const gift = await storage.createAdminGift({
        recipient_type: 'org',
        recipient_id: orgId,
        duration_days: computed.durationDays,
        expires_at: computed.expiresAt,
        reason: reason || null,
      });
      const { password: _, ...safe } = updated!;
      res.json({ org: safe, gift });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/admin/singers/:id/grant-founding", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      const singer = await storage.getSinger(singerId);
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");

      const proExpires = new Date();
      proExpires.setFullYear(proExpires.getFullYear() + 1);
      const updated = await storage.updateSinger(singerId, {
        founding_artist: true,
        subscription_tier: 'pro',
        subscription_status: 'active',
        pro_expires_at: proExpires,
      });
      const { password: _, ...safe } = updated!;
      res.json(await signSingerFiles(safe));
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/admin/singers/:id/revoke-founding", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      const singer = await storage.getSinger(singerId);
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");

      const updates = hasActiveStripeSubscription(singer)
        ? { founding_artist: false }
        : { subscription_tier: 'free' as const, pro_expires_at: null, founding_artist: false, is_gifted: false };
      const updated = await storage.updateSinger(singerId, updates);
      const { password: _, ...safe } = updated!;
      res.json(await signSingerFiles(safe));
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/admin/orgs/:id/grant-founding", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const orgId = parseInt(req.params.id as string);
      const org = await storage.getOrganization(orgId);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      const proExpires = new Date();
      proExpires.setFullYear(proExpires.getFullYear() + 1);
      const updated = await storage.updateOrganization(orgId, {
        founding_org: true,
        subscription_tier: 'pro',
        pro_expires_at: proExpires,
      });
      const { password: _, ...safe } = updated!;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/admin/orgs/:id/revoke-founding", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const orgId = parseInt(req.params.id as string);
      const org = await storage.getOrganization(orgId);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      const updates = hasActiveStripeSubscription(org)
        ? { founding_org: false }
        : { subscription_tier: 'free' as const, pro_expires_at: null, founding_org: false, is_gifted: false };
      const updated = await storage.updateOrganization(orgId, updates);
      const { password: _, ...safe } = updated!;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/singer/resume", requireAuth, requireSinger, handleUpload(resumeUpload.single("resume")), async (req: Request, res: Response) => {
    try {
      if (!req.file) return sendApiError(res, "FILE_MISSING");
      const resumePath = await uploadToSupabaseStorage("resumes", req.file);
      const singer = await storage.updateSinger(currentUserId(req), { resume_url: resumePath });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      const signedResumeUrl = await signStoragePath(resumePath);
      res.json({ resume_url: signedResumeUrl, message: "Resume uploaded successfully" });
    } catch (error: any) {
      if (error.message === "Only PDF files are allowed") {
        return sendApiError(res, "FILE_TYPE_INVALID", {
          message: "Resumes must be a PDF. Please export your file as PDF and upload it again.",
        });
      }
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/roles/:id", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id as string);
      const singerId = currentUserId(req);
      const VALID_DEPTHS = ['1-2', '3-5', '6-10', '10+'];
      const VALID_STATUSES = ['performed', 'in_preparation'];
      const roles = await storage.getSingerRoles(singerId);
      const ownsRole = roles.some((r) => r.id === roleId);
      if (!ownsRole)
        return sendApiError(res, "NOT_RESOURCE_OWNER", {
          message: "That role is on another singer's profile, so you can't change it.",
        });
      const { last_performed_date, experience_depth, work_title, status } = req.body;
      if (experience_depth && !VALID_DEPTHS.includes(experience_depth)) {
        return sendApiError(res, "INVALID_EXPERIENCE_DEPTH", {
          message: `Experience level must be one of: ${VALID_DEPTHS.join(", ")}.`,
        });
      }
      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return sendApiError(res, "INVALID_STATUS", {
          message: `Status must be one of: ${VALID_STATUSES.join(", ")}.`,
        });
      }
      if (last_performed_date) {
        const d = new Date(last_performed_date + "-01");
        const now = new Date();
        if (d > now) return sendApiError(res, "DATE_IN_FUTURE");
        if (d < new Date("1900-01-01")) return sendApiError(res, "DATE_TOO_EARLY");
      }
      let composer = req.body.composer;
      if (work_title) {
        const repoResult = await pool.query(
          `SELECT composer FROM repertoire_reference WHERE LOWER(work_title) = LOWER($1) AND composer IS NOT NULL LIMIT 1`,
          [work_title]
        );
        if (repoResult.rows[0]?.composer) composer = repoResult.rows[0].composer;
      }
      const updated = await storage.updateSingerRole(roleId, { ...req.body, ...(composer ? { composer } : {}) });
      res.json(updated);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/singer/headshot", requireAuth, requireSinger, handleUpload(headshotUpload.single("headshot")), async (req: Request, res: Response) => {
    try {
      if (!req.file) return sendApiError(res, "FILE_MISSING");
      const headshotPath = await uploadToSupabaseStorage("headshots", req.file);
      const singer = await storage.updateSinger(currentUserId(req), { headshot_url: headshotPath });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      const { password: _, ...safe } = singer;
      const signed = await signSingerFiles(safe);
      res.json({ ...signed, headshot_url: signed?.headshot_url ?? (await signStoragePath(headshotPath)) });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/password", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return sendApiError(res, "PASSWORD_FIELDS_REQUIRED");
      }
      if (newPassword.length < 8) {
        return sendApiError(res, "PASSWORD_TOO_SHORT", {
          message: "Your new password must be at least 8 characters.",
          field: "newPassword",
        });
      }
      const singer = await storage.getSinger(currentUserId(req));
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      if (!singer.auth_user_id) return sendApiError(res, "CURRENT_PASSWORD_INCORRECT");
      const valid = await verifyAccountPassword(singer.email, currentPassword);
      if (!valid) return sendApiError(res, "CURRENT_PASSWORD_INCORRECT");
      await changeAccountPassword(singer.auth_user_id, newPassword);
      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/org/password", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return sendApiError(res, "PASSWORD_FIELDS_REQUIRED");
      }
      if (newPassword.length < 8) {
        return sendApiError(res, "PASSWORD_TOO_SHORT", {
          message: "Your new password must be at least 8 characters.",
          field: "newPassword",
        });
      }
      const org = await storage.getOrganization(currentUserId(req));
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");
      if (!org.auth_user_id) return sendApiError(res, "CURRENT_PASSWORD_INCORRECT");
      const valid = await verifyAccountPassword(org.email, currentPassword);
      if (!valid) return sendApiError(res, "CURRENT_PASSWORD_INCORRECT");
      await changeAccountPassword(org.auth_user_id, newPassword);
      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Login email change (gated by current password) ──────────────────────
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  app.put("/api/singer/email", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const { email: emailRaw, currentPassword } = req.body;
      const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
      if (!email || !EMAIL_REGEX.test(email)) {
        return sendApiError(res, "INVALID_EMAIL");
      }
      const singer = await storage.getSinger(currentUserId(req));
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      if (!singer.auth_user_id || !currentPassword || !(await verifyAccountPassword(singer.email, currentPassword))) {
        return sendApiError(res, "CURRENT_PASSWORD_INCORRECT");
      }
      if (email !== singer.email) {
        const existing = await storage.getSingerByEmail(email);
        if (existing && existing.id !== singer.id) {
          return sendApiError(res, "EMAIL_ALREADY_REGISTERED");
        }
      }
      await changeAccountEmail(singer.auth_user_id, email);
      const updated = await storage.updateSinger(singer.id, { email });
      if (!updated) return sendApiError(res, "SINGER_NOT_FOUND");
      const { password: _, ...safe } = updated;
      res.json(safe);
    } catch (error: any) {
      if (error?.code === "23505") return sendApiError(res, "EMAIL_ALREADY_REGISTERED");
      sendRouteError(res, error, "PROFILE_UPDATE_FAILED");
    }
  });

  app.put("/api/org/email", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const { email: emailRaw, currentPassword } = req.body;
      const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
      if (!email || !EMAIL_REGEX.test(email)) {
        return sendApiError(res, "INVALID_EMAIL");
      }
      const org = await storage.getOrganization(currentUserId(req));
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");
      if (!org.auth_user_id || !currentPassword || !(await verifyAccountPassword(org.email, currentPassword))) {
        return sendApiError(res, "CURRENT_PASSWORD_INCORRECT");
      }
      if (email !== org.email) {
        const existing = await storage.getOrganizationByEmail(email);
        if (existing && existing.id !== org.id) {
          return sendApiError(res, "EMAIL_ALREADY_REGISTERED");
        }
      }
      await changeAccountEmail(org.auth_user_id, email);
      const updated = await storage.updateOrganization(org.id, { email });
      if (!updated) return sendApiError(res, "ORG_NOT_FOUND");
      const { password: _, ...safe } = updated;
      res.json(safe);
    } catch (error: any) {
      if (error?.code === "23505") return sendApiError(res, "EMAIL_ALREADY_REGISTERED");
      sendRouteError(res, error, "PROFILE_UPDATE_FAILED");
    }
  });

  // ── Org: Shortlist (Favorites) ──────────────────────────────────────────
  app.post("/api/shortlist/:singerId", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.singerId as string, 10);
      if (!Number.isFinite(singerId)) {
        return sendApiError(res, "INVALID_ID", {
          message: "That singer reference isn't valid. Please reopen the profile and try again.",
        });
      }
      const singer = await storage.getSinger(singerId);
      if (!singer || !singer.admin_approved) {
        return sendApiError(res, "SINGER_NOT_FOUND");
      }
      const result = await storage.toggleShortlist(currentUserId(req), singerId);
      res.json(result);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.get("/api/shortlist", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const orgId = currentUserId(req);
      const [singersList, ids] = await Promise.all([
        storage.getShortlistedSingersWithData(orgId),
        storage.getRevealedSingerIds(orgId),
      ]);
      const revealedSet = new Set(ids);
      const visible = singersList.filter((s: any) => s.admin_approved === true);
      const safe = await signSingerFilesBatch(
        visible.map(({ password, ...s }: any) => {
          const isRevealed = revealedSet.has(s.id);
          if (isRevealed) {
            return { ...s, revealed: true };
          }
          const { email, agent_name, agent_email, manager_name, manager_email, manager_phone, ...redacted } = s;
          return { ...redacted, revealed: false };
        }),
      );
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Org: Revealed Singers History ───────────────────────────────────────
  app.get("/api/org/revealed-singers", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const singers = await storage.getRevealedSingersWithData(currentUserId(req));
      const safeSingers = await signSingerFilesBatch(singers.map(({ password, ...s }: any) => s));
      res.json(safeSingers);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Engagement Feedback ──────────────────────────────────────────────────
  app.post("/api/feedback/submit", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const { singer_id, role_name, engagement_date, was_prepared, was_professional, was_accurate } = req.body;
      if (!singer_id || !role_name || !engagement_date) {
        return sendApiError(res, "FEEDBACK_FIELDS_REQUIRED");
      }
      const orgId = currentUserId(req);

      const isDuplicate = await storage.checkDuplicateFeedback(Number(singer_id), orgId, engagement_date);
      if (isDuplicate) {
        return sendApiError(res, "FEEDBACK_ALREADY_SUBMITTED");
      }

      const parsed = insertEngagementFeedbackSchema.parse({
        singer_id: Number(singer_id),
        org_id: orgId,
        role_name,
        engagement_date,
        was_prepared: !!was_prepared,
        was_professional: !!was_professional,
        was_accurate: !!was_accurate,
      });

      await storage.submitEngagementFeedback(parsed);
      await storage.recalculateReliabilityScore(Number(singer_id));

      // Confidence tier logic
      const singerData = await storage.getSinger(Number(singer_id));
      if (singerData) {
        let newPoints = singerData.confidence_points ?? 0;
        let updates: Partial<typeof singerData> = {};

        if (!was_accurate) {
          // Accuracy penalty: deduct points and flag for review
          newPoints = Math.max(0, newPoints - 5);
          updates.confidence_points = newPoints;
          updates.flagged_for_review = true;
        } else {
          // Positive signal: add points
          newPoints = newPoints + 3;
          updates.confidence_points = newPoints;
          // Auto-promote to Tier 2 after 3 unique org verifications
          if ((singerData.confidence_tier ?? 1) < 2) {
            const uniqueVerifications = await db
              .selectDistinct({ orgId: engagementFeedback.org_id })
              .from(engagementFeedback)
              .where(and(
                eq(engagementFeedback.singer_id, Number(singer_id)),
                eq(engagementFeedback.was_accurate, true)
              ));
            if (uniqueVerifications.length >= 3) {
              updates.confidence_tier = 2;
            }
          }
        }
        await storage.updateSinger(Number(singer_id), updates);
      }

      res.json({ message: "Feedback submitted successfully" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Singer: Search Appearances (last 30 days) ───────────────────────────
  app.get("/api/singer/search-appearances", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const count = await storage.countSearchAppearances(currentUserId(req), 30);
      res.json({ count, days: 30 });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Singer: Request Emergency Status ────────────────────────────────────
  app.post("/api/singer/request-emergency", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singer = await storage.updateSinger(currentUserId(req), { emergency_status_requested: true });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      res.json({ message: "Emergency status request submitted. An admin will review your request." });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Singer: Suggest a Work or Role ───────────────────────────────────────
  app.post("/api/suggest-repertoire", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const parsed = insertRepertoireSuggestionSchema.parse(req.body);
      if (!parsed.work_title || !parsed.work_title.trim()) {
        return sendApiError(res, "WORK_TITLE_REQUIRED");
      }
      const created = await storage.createRepertoireSuggestion({
        ...parsed,
        singer_id: currentUserId(req),
      });
      res.json(created);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Admin: Repertoire Suggestions (read-only list) ───────────────────────
  app.get("/api/admin/repertoire-suggestions", requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const rows = await storage.listRepertoireSuggestions();
      res.json(rows);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Admin: Organizations ─────────────────────────────────────────────────
  app.get("/api/admin/orgs", requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT
          o.id, o.email, o.organization_name, o.organization_type, o.website_url,
          o.city, o.state, o.subscription_tier, o.contact_reveal_limit,
          o.contact_reveals_used_this_month, o.contact_person_name, o.contact_person_email,
          o.admin_notes, o.admin_approved, o.verified, o.created_at,
          o.founding_org, o.is_gifted, o.pro_expires_at,
          COALESCE(rc.reveal_count, 0)::int AS reveal_count,
          COALESCE(sc.search_count, 0)::int AS search_count
        FROM organizations o
        LEFT JOIN (SELECT org_id, COUNT(*) AS reveal_count FROM contact_reveals GROUP BY org_id) rc ON rc.org_id = o.id
        LEFT JOIN (SELECT org_id, COUNT(*) AS search_count FROM search_logs WHERE org_id IS NOT NULL GROUP BY org_id) sc ON sc.org_id = o.id
        ORDER BY o.created_at DESC
      `);
      res.json(result.rows);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.get("/api/admin/orgs/:id", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const orgId = parseInt(req.params.id as string);
      const org = await storage.getOrganization(orgId);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");
      const { password: _, ...safeOrg } = org;

      const revealHistory = await pool.query(`
        SELECT cr.id, cr.revealed_at, cr.singer_id, cr.is_emergency,
               s.first_name, s.last_name, s.primary_voice_type
        FROM contact_reveals cr
        LEFT JOIN singers s ON s.id = cr.singer_id
        WHERE cr.org_id = $1
        ORDER BY cr.revealed_at DESC
        LIMIT 50
      `, [orgId]);

      const searchHistory = await pool.query(`
        SELECT id, search_filters, created_at
        FROM search_logs
        WHERE org_id = $1
        ORDER BY created_at DESC
        LIMIT 20
      `, [orgId]);

      const feedbackHistory = await pool.query(`
        SELECT ef.id, ef.role_name, ef.engagement_date, ef.was_prepared,
               ef.was_professional, ef.was_accurate, ef.created_at,
               s.first_name, s.last_name, s.id AS singer_id
        FROM engagement_feedback ef
        LEFT JOIN singers s ON s.id = ef.singer_id
        WHERE ef.org_id = $1
        ORDER BY ef.created_at DESC
      `, [orgId]);

      const giftHistory = await storage.getAdminGifts('org', orgId);

      res.json({
        ...safeOrg,
        reveal_history: revealHistory.rows,
        search_history: searchHistory.rows,
        feedback_history: feedbackHistory.rows,
        gift_history: giftHistory,
      });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/admin/orgs/:id/edit", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const orgId = parseInt(req.params.id as string);
      const { password, id, created_at, contact_reveals_used_this_month, login_count, pro_expires_at, founding_org, is_gifted, ...updates } = req.body;
      const org = await storage.updateOrganization(orgId, updates);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");
      const { password: _, ...safe } = org;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/admin/orgs/:id/subscription", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const orgId = parseInt(req.params.id as string);
      const { tier } = req.body;
      if (!["free", "pro"].includes(tier)) {
        return sendApiError(res, "INVALID_ACCOUNT_TIER");
      }
      const org = await storage.updateOrganization(orgId, { subscription_tier: tier });
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");
      const { password: _, ...safe } = org;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/admin/orgs/:id/credits", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const orgId = parseInt(req.params.id as string);
      const { amount, reason } = req.body;
      const amt = parseInt(amount);
      if (!Number.isFinite(amt) || amt === 0) {
        return sendApiError(res, "CREDIT_AMOUNT_INVALID");
      }
      const VALID_REASONS = ["Promotional Grant", "Support Adjustment", "Refund", "Correction", "Other"];
      if (!reason || !VALID_REASONS.includes(reason)) {
        return sendApiError(res, "CREDIT_REASON_INVALID", {
          message: `Reason must be one of: ${VALID_REASONS.join(", ")}.`,
        });
      }
      const org = await storage.getOrganization(orgId);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      const used = org.contact_reveals_used_this_month ?? 0;
      const limit = org.contact_reveal_limit ?? 0;
      const previousBalance = limit - used;
      const newBalance = previousBalance + amt;
      if (newBalance < 0) {
        return sendApiError(res, "CREDIT_BALANCE_NEGATIVE", {
          message: `That adjustment would push the balance below zero — the current balance is ${previousBalance} and you requested ${amt}.`,
        });
      }

      const newLimit = limit + amt;
      if (newLimit < used) {
        return sendApiError(res, "CREDIT_LIMIT_BELOW_USED", {
          message: `That adjustment would set the limit to ${newLimit}, below the ${used} credits already used this month.`,
        });
      }
      const updated = await storage.updateOrganization(orgId, { contact_reveal_limit: newLimit });
      await db.insert(creditAdjustments).values({
        org_id: orgId,
        admin_action: reason,
        amount: amt,
        previous_balance: previousBalance,
        new_balance: newBalance,
      });

      const { password: _, ...safe } = updated!;
      res.json({ ...safe, previous_balance: previousBalance, new_balance: newBalance });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.get("/api/admin/orgs/:id/credit-adjustments", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const orgId = parseInt(req.params.id as string);
      const rows = await db.select().from(creditAdjustments)
        .where(eq(creditAdjustments.org_id, orgId))
        .orderBy(desc(creditAdjustments.created_at));
      res.json(rows);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.delete("/api/admin/orgs/:id", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const orgId = parseInt(req.params.id as string);
      await pool.query(`DELETE FROM contact_reveals WHERE org_id = $1`, [orgId]);
      await pool.query(`DELETE FROM shortlists WHERE org_id = $1`, [orgId]);
      await pool.query(`DELETE FROM search_logs WHERE org_id = $1`, [orgId]);
      await pool.query(`DELETE FROM engagement_feedback WHERE org_id = $1`, [orgId]);
      await pool.query(`DELETE FROM credit_adjustments WHERE org_id = $1`, [orgId]);
      await pool.query(`DELETE FROM organizations WHERE id = $1`, [orgId]);
      res.json({ message: "Organization deleted" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // Extended admin stats — pro org count + reveals this month
  app.get("/api/admin/stats-extended", requireAdminAuth, async (_req: Request, res: Response) => {
    try {
      const proRes = await pool.query(`SELECT COUNT(*)::int AS c FROM organizations WHERE subscription_tier = 'pro'`);
      const monthRes = await pool.query(`SELECT COUNT(*)::int AS c FROM contact_reveals WHERE revealed_at >= date_trunc('month', now())`);
      res.json({
        pro_orgs: proRes.rows[0].c,
        reveals_this_month: monthRes.rows[0].c,
      });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Admin: Badge Toggles ─────────────────────────────────────────────────
  app.put("/api/admin/singers/:id/badges", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const singerId = parseInt(req.params.id as string);
      const { field, value } = req.body;
      const allowedFields = ["is_pro_verified", "is_emergency_ready", "is_management_verified", "flagged_for_review"];
      if (!allowedFields.includes(field)) {
        return sendApiError(res, "INVALID_BADGE_FIELD");
      }
      const updateData: Record<string, any> = { [field]: !!value };
      // When granting emergency ready, clear the request flag
      if (field === "is_emergency_ready" && !!value) {
        updateData.emergency_status_requested = false;
      }
      // When clearing flagged_for_review, that's an explicit admin action
      const singer = await storage.updateSinger(singerId, updateData);
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      res.json({ message: "Badge updated", id: singer.id, [field]: (singer as any)[field] });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  return httpServer;
}
