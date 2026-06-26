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
import { scrypt, randomBytes, timingSafeEqual, createHmac } from "crypto";
import { promisify } from "util";
import multer from "multer";
import express from "express";
import { uploadToSupabaseStorage, signStoragePath, signSingerFiles, signSingerFilesBatch } from "./lib/file-upload";
import { getSessionSecret } from "./lib/env";
import {
  notifyNewRegistration,
  notifyRegistrationConfirmation,
  notifySingerApproved,
  notifyPasswordReset,
  getEmailConfigStatus,
  sendTestEmail,
} from "./lib/email";
import { eq, desc, and } from "drizzle-orm";
import { sendApiError, sendRouteError } from "./lib/api-response";

const scryptAsync = promisify(scrypt);

declare module "express-session" {
  interface SessionData {
    userId?: number;
    userType?: "singer" | "organization";
    adminAuthenticated?: boolean;
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}.${hash.toString("hex")}`;
}

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

function hashResetToken(token: string): string {
  const secret = getSessionSecret();
  return createHmac("sha256", secret).update(token).digest("hex");
}

const PASSWORD_RESET_GENERIC_MESSAGE =
  "If an account exists for that email, password reset instructions have been sent.";

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminAuthenticated) {
    return sendApiError(res, "ADMIN_AUTH_REQUIRED");
  }
  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return sendApiError(res, "NOT_AUTHENTICATED");
  }
  next();
}

function requireSinger(req: Request, res: Response, next: NextFunction) {
  if (req.session.userType !== "singer") {
    return sendApiError(res, "SINGER_ACCESS_REQUIRED");
  }
  next();
}

function requireOrg(req: Request, res: Response, next: NextFunction) {
  if (req.session.userType !== "organization") {
    return sendApiError(res, "ORG_ACCESS_REQUIRED");
  }
  next();
}

// Keep under the Vercel edge proxy body limit (~4.5MB) so prod uploads through
// middleware.ts are not rejected before reaching the API.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed") as any, false);
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
      cb(new Error("Only JPG, PNG, and WebP files are allowed") as any, false);
    }
  },
});

// Multer's middleware errors (size/type) bypass the route try/catch and would
// otherwise surface as a generic 500 (and a hung client spinner). Wrap it so
// those become a clean 400 JSON response the client can act on.
function handleUpload(mw: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    mw(req, res, (err: any) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File must be under 4MB" });
      }
      return res.status(400).json({ message: err.message || "Upload failed" });
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

  // Auth Routes

  app.post("/api/auth/register/singer", async (req: Request, res: Response) => {
    try {
      const { email: emailRaw, password, ...rest } = req.body;
      if (!emailRaw || !password) {
        return sendApiError(res, "EMAIL_PASSWORD_REQUIRED");
      }
      const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : emailRaw;

      const existing = await storage.getSingerByEmail(email);
      if (existing) {
        return sendApiError(res, "EMAIL_ALREADY_REGISTERED");
      }

      const singerCount = await storage.getSingerCount();
      const isFounding = singerCount < 50;

      const hashedPassword = await hashPassword(password);
      const parsed = insertSingerSchema.parse({
        email,
        password: hashedPassword,
        ...rest,
        // Enforce location invariant: never trust client-supplied coords on create
        latitude: null,
        longitude: null,
        subscription_tier: isFounding ? 'pro' : 'free',
        subscription_status: 'active',
      });
      const singer = await storage.createSinger(parsed);

      if (isFounding) {
        const proExpires = new Date();
        proExpires.setFullYear(proExpires.getFullYear() + 1);
        await storage.updateSinger(singer.id, { pro_expires_at: proExpires, founding_artist: true });
      }

      req.session.userId = singer.id;
      req.session.userType = "singer";

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
        isFoundingMember: isFounding,
        registeredAt: updated!.created_at ?? new Date(),
      });
      void notifyRegistrationConfirmation({
        userType: "singer",
        email: updated!.email,
        displayName,
      });

      const { password: _, ...safe } = updated!;
      res.status(201).json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "REGISTRATION_FAILED");
    }
  });

  app.post("/api/auth/register/organization", async (req: Request, res: Response) => {
    try {
      const { email: emailRaw, password, ...rest } = req.body;
      if (!emailRaw || !password) {
        return sendApiError(res, "EMAIL_PASSWORD_REQUIRED");
      }
      const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : emailRaw;

      const existing = await storage.getOrganizationByEmail(email);
      if (existing) {
        return sendApiError(res, "EMAIL_ALREADY_REGISTERED");
      }

      const orgCount = await storage.getOrganizationCount();
      const isFounding = orgCount < 10;

      const hashedPassword = await hashPassword(password);
      const parsed = insertOrganizationSchema.parse({
        email,
        password: hashedPassword,
        ...rest,
        subscription_tier: isFounding ? 'pro' : 'free',
      });
      let org = await storage.createOrganization(parsed);

      if (isFounding) {
        const proExpires = new Date();
        proExpires.setFullYear(proExpires.getFullYear() + 1);
        org = (await storage.updateOrganization(org.id, { pro_expires_at: proExpires, founding_org: true }))!;
      }

      req.session.userId = org.id;
      req.session.userType = "organization";

      void notifyNewRegistration({
        userType: "organization",
        userId: org.id,
        email: org.email,
        displayName: org.organization_name,
        city: org.city,
        state: org.state,
        detailLabel: "Organization type",
        detailValue: org.organization_type,
        isFoundingMember: isFounding,
        registeredAt: org.created_at ?? new Date(),
      });
      void notifyRegistrationConfirmation({
        userType: "organization",
        email: org.email,
        displayName: org.organization_name,
      });

      const { password: _, ...safe } = org;
      res.status(201).json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "REGISTRATION_FAILED");
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email: emailRaw, password, userType } = req.body;
      if (!emailRaw || !password || !userType) {
        return sendApiError(res, "EMAIL_USER_TYPE_REQUIRED", "Email, password, and account type are required.");
      }
      const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : emailRaw;

      let user: any;
      if (userType === "singer") {
        user = await storage.getSingerByEmail(email);
      } else if (userType === "organization") {
        user = await storage.getOrganizationByEmail(email);
      } else {
        return sendApiError(res, "INVALID_USER_TYPE");
      }

      if (!user) {
        return sendApiError(res, "USER_NOT_FOUND");
      }

      const valid = await comparePasswords(password, user.password);
      if (!valid) {
        return sendApiError(res, "INVALID_PASSWORD");
      }

      req.session.userId = user.id;
      req.session.userType = userType;

      if (userType === "organization") {
        await storage.updateOrganization(user.id, { login_count: (user.login_count || 0) + 1 });
        user = { ...user, login_count: (user.login_count || 0) + 1 };
      }

      const { password: _, ...safe } = user;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "LOGIN_FAILED");
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email, userType } = req.body;
      if (!email || !userType) {
        return res.status(400).json({ message: "Email and userType are required" });
      }
      if (userType !== "singer" && userType !== "organization") {
        return sendApiError(res, "INVALID_USER_TYPE");
      }

      const normalizedEmail = String(email).trim();
      let user: { id: number; email: string; displayName: string } | undefined;

      if (userType === "singer") {
        const singer = await storage.getSingerByEmail(normalizedEmail);
        if (singer) {
          user = {
            id: singer.id,
            email: singer.email,
            displayName: `${singer.first_name} ${singer.last_name}`.trim(),
          };
        }
      } else {
        const org = await storage.getOrganizationByEmail(normalizedEmail);
        if (org) {
          user = {
            id: org.id,
            email: org.email,
            displayName: org.organization_name,
          };
        }
      }

      if (user && !normalizedEmail.toLowerCase().endsWith("@example.com")) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentRequests = await storage.countRecentPasswordResetRequests(
          userType,
          user.id,
          oneHourAgo,
        );
        if (recentRequests < 3) {
          await storage.invalidatePasswordResetTokensForUser(userType, user.id);
          const rawToken = randomBytes(32).toString("hex");
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
          await storage.createPasswordResetToken({
            tokenHash: hashResetToken(rawToken),
            userType,
            userId: user.id,
            expiresAt,
          });
          void notifyPasswordReset({
            userType,
            email: user.email,
            displayName: user.displayName,
            resetToken: rawToken,
          });
        }
      }

      res.json({ message: PASSWORD_RESET_GENERIC_MESSAGE });
    } catch (error: any) {
      sendRouteError(res, error, "FORGOT_PASSWORD_FAILED");
    }
  });

  app.get("/api/auth/reset-password/validate", async (req: Request, res: Response) => {
    try {
      const token = String(req.query.token || "");
      const userType = String(req.query.userType || req.query.type || "");
      if (!token || (userType !== "singer" && userType !== "organization")) {
        return res.json({ valid: false });
      }

      const record = await storage.findValidPasswordResetToken(hashResetToken(token));
      if (!record || record.user_type !== userType) {
        return res.json({ valid: false });
      }

      res.json({ valid: true });
    } catch (error: any) {
      sendRouteError(res, error, "VALIDATION_FAILED");
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password, userType } = req.body;
      if (!token || !password || !userType) {
        return res.status(400).json({ message: "Token, password, and userType are required" });
      }
      if (userType !== "singer" && userType !== "organization") {
        return sendApiError(res, "INVALID_USER_TYPE");
      }
      if (String(password).length < 8) {
        return sendApiError(res, "PASSWORD_TOO_SHORT");
      }

      const record = await storage.findValidPasswordResetToken(hashResetToken(String(token)));
      if (!record || record.user_type !== userType) {
        return sendApiError(res, "RESET_LINK_INVALID");
      }

      const hashedPassword = await hashPassword(String(password));
      if (userType === "singer") {
        const updated = await storage.updateSinger(record.user_id, { password: hashedPassword });
        if (!updated) return sendApiError(res, "ACCOUNT_NOT_FOUND");
      } else {
        const updated = await storage.updateOrganization(record.user_id, { password: hashedPassword });
        if (!updated) return sendApiError(res, "ACCOUNT_NOT_FOUND");
      }

      await storage.markPasswordResetTokenUsed(record.id);
      await storage.invalidatePasswordResetTokensForUser(userType, record.user_id);

      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      sendRouteError(res, error, "PASSWORD_RESET_FAILED");
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return sendApiError(res, "LOGOUT_FAILED");
      }
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return sendApiError(res, "NOT_AUTHENTICATED");
      }

      if (req.session.userType === "singer") {
        let singer = await storage.getSinger(req.session.userId);
        if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");

        if (singer.subscription_tier === 'founding' && singer.founding_expires_at && new Date(singer.founding_expires_at) < new Date()) {
          singer = (await storage.updateSinger(singer.id, { subscription_tier: 'standard', founding_expires_at: null }))!;
        }

        if (singer.subscription_tier === 'pro' && singer.pro_expires_at && new Date(singer.pro_expires_at) < new Date()) {
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

      if (req.session.userType === "organization") {
        let org = await storage.getOrganization(req.session.userId);
        if (!org) return sendApiError(res, "ORG_NOT_FOUND");

        if (org.subscription_tier === 'pro' && org.pro_expires_at && new Date(org.pro_expires_at) < new Date()) {
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
      const singer = await storage.getSinger(req.session.userId!);
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
        confidence_tier, reliability_score, total_gigs,
        is_emergency_ready, latitude, longitude, email,
        ...updates
      } = req.body;
      if (updates.short_bio && updates.short_bio.length > 1700) {
        return res.status(400).json({ message: "Bio exceeds 1700 character limit" });
      }
      if (updates.website_url && !/^https?:\/\//i.test(updates.website_url)) {
        return res.status(400).json({ message: "Website URL must start with http:// or https://" });
      }
      for (const field of ["video_link_1", "video_link_2", "audio_link_1"]) {
        if (updates[field] && !/^https?:\/\//i.test(updates[field])) {
          return res.status(400).json({ message: `${field} must start with http:// or https://` });
        }
      }
      const existing = await storage.getSinger(req.session.userId!);
      const cityChanged = existing && (
        (updates.city ?? existing.city) !== existing.city ||
        (updates.state ?? existing.state) !== existing.state
      );
      let singer = await storage.updateSinger(req.session.userId!, { ...updates, last_updated: new Date() });
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
      const singer = await storage.updateSinger(req.session.userId!, {
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
      const singer = await storage.updateSinger(req.session.userId!, {
        subscription_tier: 'free',
        pro_expires_at: null,
        founding_artist: false,
        is_gifted: false,
      });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      const { password: _, ...safe } = singer;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/org/downgrade", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const org = await storage.updateOrganization(req.session.userId!, {
        subscription_tier: 'free',
        pro_expires_at: null,
        founding_org: false,
        is_gifted: false,
        contact_reveal_limit: 3,
      });
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");
      const { password: _, ...safe } = org;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/approval-seen", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singer = await storage.updateSinger(req.session.userId!, { approval_seen: true });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      const { password: _, ...safe } = singer;
      res.json(await signSingerFiles(safe));
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.post("/api/singer/roles", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singerId = req.session.userId!;
      const { role_name, work_title, last_performed_date, experience_depth, status } = req.body;
      const VALID_DEPTHS = ['1-2', '3-5', '6-10', '10+'];
      const VALID_STATUSES = ['performed', 'in_preparation'];

      if (!role_name || !work_title) {
        return res.status(400).json({ message: "Role name and work title are required" });
      }
      const dup = await pool.query(
        `SELECT id FROM singer_roles WHERE singer_id = $1 AND LOWER(role_name) = LOWER($2) AND LOWER(work_title) = LOWER($3) LIMIT 1`,
        [singerId, role_name, work_title]
      );
      if (dup.rows.length > 0) {
        return res.status(400).json({ message: "You have already added this role. Edit the existing entry instead." });
      }
      if (experience_depth && !VALID_DEPTHS.includes(experience_depth)) {
        return res.status(400).json({ message: `Experience depth must be one of: ${VALID_DEPTHS.join(", ")}` });
      }
      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      if (last_performed_date) {
        const d = new Date(last_performed_date + "-01");
        const now = new Date();
        if (d > now) return res.status(400).json({ message: "Last performed date cannot be in the future" });
        if (d < new Date("1900-01-01")) return res.status(400).json({ message: "Last performed date cannot be before 1900" });
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
      const roles = await storage.getSingerRoles(req.session.userId!);
      const ownsRole = roles.some((r) => r.id === roleId);
      if (!ownsRole) return res.status(403).json({ message: "Not your role" });

      await storage.deleteSingerRole(roleId);
      res.json({ message: "Role deleted" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/roles", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singerId = req.session.userId!;
      await storage.deleteSingerRoles(singerId);

      const rolesData = req.body as any[];
      const VALID_STATUSES = ['performed', 'in_preparation'];
      for (const r of rolesData) {
        if (r.status !== undefined && !VALID_STATUSES.includes(r.status)) {
          return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
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
      const singerId = req.session.userId!;
      const { work_title, last_performed_date, experience_depth, notable_ensembles, status } = req.body;
      const VALID_DEPTHS = ['1-2', '3-5', '6-10', '10+'];
      const VALID_STATUSES = ['performed', 'in_preparation'];

      if (!work_title) {
        return res.status(400).json({ message: "Work title is required" });
      }
      const dup = await pool.query(
        `SELECT id FROM singer_works WHERE singer_id = $1 AND LOWER(work_title) = LOWER($2) LIMIT 1`,
        [singerId, work_title]
      );
      if (dup.rows.length > 0) {
        return res.status(400).json({ message: "You have already added this work. Edit the existing entry instead." });
      }
      if (experience_depth && !VALID_DEPTHS.includes(experience_depth)) {
        return res.status(400).json({ message: `Experience depth must be one of: ${VALID_DEPTHS.join(", ")}` });
      }
      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      if (last_performed_date) {
        const d = new Date(last_performed_date + "-01");
        const now = new Date();
        if (d > now) return res.status(400).json({ message: "Last performed date cannot be in the future" });
        if (d < new Date("1900-01-01")) return res.status(400).json({ message: "Last performed date cannot be before 1900" });
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
      const singerId = req.session.userId!;
      const VALID_DEPTHS = ['1-2', '3-5', '6-10', '10+'];
      const VALID_STATUSES = ['performed', 'in_preparation'];
      const works = await storage.getSingerWorks(singerId);
      const ownsWork = works.some((w) => w.id === workId);
      if (!ownsWork) return res.status(403).json({ message: "Not your work" });
      const { last_performed_date, experience_depth, work_title, notable_ensembles, status } = req.body;
      if (experience_depth && !VALID_DEPTHS.includes(experience_depth)) {
        return res.status(400).json({ message: `Experience depth must be one of: ${VALID_DEPTHS.join(", ")}` });
      }
      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      if (last_performed_date) {
        const d = new Date(last_performed_date + "-01");
        const now = new Date();
        if (d > now) return res.status(400).json({ message: "Last performed date cannot be in the future" });
        if (d < new Date("1900-01-01")) return res.status(400).json({ message: "Last performed date cannot be before 1900" });
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
      const works = await storage.getSingerWorks(req.session.userId!);
      const ownsWork = works.some((w) => w.id === workId);
      if (!ownsWork) return res.status(403).json({ message: "Not your work" });

      await storage.deleteSingerWork(workId);
      res.json({ message: "Work deleted" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/works", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singerId = req.session.userId!;
      await storage.deleteSingerWorks(singerId);

      const worksData = req.body as any[];
      const VALID_STATUSES = ['performed', 'in_preparation'];
      for (const w of worksData) {
        if (w.status !== undefined && !VALID_STATUSES.includes(w.status)) {
          return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
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
      const parsed = insertAvailabilitySchema.parse({ ...req.body, singer_id: req.session.userId! });
      const avail = await storage.createAvailability(parsed);
      res.status(201).json(avail);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.delete("/api/singer/availability/:id", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const availId = parseInt(req.params.id as string);
      const avails = await storage.getAvailabilities(req.session.userId!);
      const ownsAvail = avails.some((a) => a.id === availId);
      if (!ownsAvail) return res.status(403).json({ message: "Not your availability" });

      await storage.deleteAvailability(availId);
      res.json({ message: "Availability deleted" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/emergency", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const { opt_in, lead_time, radius, modes, notes } = req.body;
      const singer = await storage.updateSinger(req.session.userId!, {
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
      res.status(500).json({ message: "Failed to load search options" });
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
      res.status(500).json({ message: err.message || "Failed to search repertoire" });
    }
  });

  app.get("/api/search", async (req, res) => {
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
        return res.status(400).json({
          message: "Please enter both city and state to search by location.",
          field: "location",
        });
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
            return res.status(422).json({
              message: `Could not find coordinates for "${resolvedCity}, ${trimmedState}". Please check the city and state.`,
              field: "location",
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
          return res.status(503).json({
            message: "Location search is temporarily unavailable. Please try again.",
            field: "location",
          });
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

      await storage.createSearchLog(req.session.userId!, filters);

      let results = await storage.searchSingers(filters);
      const cityFallback = false;
      const searchedCity = resolvedCity || null;

      const org = await storage.getOrganization(req.session.userId!);
      if (filters.emergencyMode && org && org.subscription_tier !== 'pro') {
        results = results.slice(0, 5);
      }

      const revealedIds = await storage.getRevealedSingerIds(req.session.userId!);
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
      const orgId = req.session.userId!;

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
      const org = await storage.getOrganization(req.session.userId!);
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
        ...updates
      } = req.body;
      const org = await storage.updateOrganization(req.session.userId!, updates);
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
      const revealLimit = tier === "pro" ? 50 : 3;

      const org = await storage.updateOrganization(req.session.userId!, {
        subscription_tier: tier,
        contact_reveal_limit: revealLimit,
      });
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      const { password: _, ...safe } = org;
      res.json(safe);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // Admin Auth Routes
  app.post("/api/admin/auth/login", (req: Request, res: Response) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return sendApiError(res, "ADMIN_PASSWORD_NOT_CONFIGURED");
    }
    if (password === adminPassword) {
      req.session.adminAuthenticated = true;
      return res.json({ success: true });
    }
    return sendApiError(res, "ADMIN_INVALID_PASSWORD");
  });

  app.post("/api/admin/auth/logout", (req: Request, res: Response) => {
    req.session.adminAuthenticated = false;
    res.json({ success: true });
  });

  app.get("/api/admin/auth/check", (req: Request, res: Response) => {
    res.json({ authenticated: !!req.session.adminAuthenticated });
  });

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

  // ── Public Founding Status ───────────────────────────────────────────────
  app.get("/api/public/founding-status", async (req: Request, res: Response) => {
    try {
      const type = (req.query.type as string) === 'org' ? 'org' : 'singer';
      const total = type === 'org' ? 10 : 50;
      const taken = type === 'org' ? await storage.getOrganizationCount() : await storage.getSingerCount();
      const remaining = Math.max(0, total - taken);
      res.json({
        type,
        spotsTotal: total,
        spotsTaken: taken,
        spotsRemaining: remaining,
        isAvailable: remaining > 0,
      });
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
      if (!computed) return res.status(400).json({ message: "Invalid duration or custom date" });

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
      if (!computed) return res.status(400).json({ message: "Invalid duration or custom date" });

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

  app.post("/api/singer/resume", requireAuth, requireSinger, handleUpload(resumeUpload.single("resume")), async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const resumePath = await uploadToSupabaseStorage("resumes", req.file);
      const singer = await storage.updateSinger(req.session.userId!, { resume_url: resumePath });
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      const signedResumeUrl = await signStoragePath(resumePath);
      res.json({ resume_url: signedResumeUrl, message: "Resume uploaded successfully" });
    } catch (error: any) {
      if (error.message === "Only PDF files are allowed") {
        return res.status(400).json({ message: "Only PDF files are allowed" });
      }
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/singer/roles/:id", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id as string);
      const singerId = req.session.userId!;
      const VALID_DEPTHS = ['1-2', '3-5', '6-10', '10+'];
      const VALID_STATUSES = ['performed', 'in_preparation'];
      const roles = await storage.getSingerRoles(singerId);
      const ownsRole = roles.some((r) => r.id === roleId);
      if (!ownsRole) return res.status(403).json({ message: "Not your role" });
      const { last_performed_date, experience_depth, work_title, status } = req.body;
      if (experience_depth && !VALID_DEPTHS.includes(experience_depth)) {
        return res.status(400).json({ message: `Experience depth must be one of: ${VALID_DEPTHS.join(", ")}` });
      }
      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      if (last_performed_date) {
        const d = new Date(last_performed_date + "-01");
        const now = new Date();
        if (d > now) return res.status(400).json({ message: "Last performed date cannot be in the future" });
        if (d < new Date("1900-01-01")) return res.status(400).json({ message: "Last performed date cannot be before 1900" });
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
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const headshotPath = await uploadToSupabaseStorage("headshots", req.file);
      const singer = await storage.updateSinger(req.session.userId!, { headshot_url: headshotPath });
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
        return res.status(400).json({ message: "Current and new password are required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }
      const singer = await storage.getSinger(req.session.userId!);
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      const valid = await comparePasswords(currentPassword, singer.password);
      if (!valid) return sendApiError(res, "CURRENT_PASSWORD_INCORRECT");
      const hashed = await hashPassword(newPassword);
      await storage.updateSinger(req.session.userId!, { password: hashed });
      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.put("/api/org/password", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }
      const org = await storage.getOrganization(req.session.userId!);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");
      const valid = await comparePasswords(currentPassword, org.password);
      if (!valid) return sendApiError(res, "CURRENT_PASSWORD_INCORRECT");
      const hashed = await hashPassword(newPassword);
      await storage.updateOrganization(req.session.userId!, { password: hashed });
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
      const singer = await storage.getSinger(req.session.userId!);
      if (!singer) return sendApiError(res, "SINGER_NOT_FOUND");
      if (!currentPassword || !(await comparePasswords(currentPassword, singer.password))) {
        return sendApiError(res, "CURRENT_PASSWORD_INCORRECT");
      }
      if (email !== singer.email) {
        const existing = await storage.getSingerByEmail(email);
        if (existing && existing.id !== singer.id) {
          return sendApiError(res, "EMAIL_ALREADY_REGISTERED");
        }
      }
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
      const org = await storage.getOrganization(req.session.userId!);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");
      if (!currentPassword || !(await comparePasswords(currentPassword, org.password))) {
        return sendApiError(res, "CURRENT_PASSWORD_INCORRECT");
      }
      if (email !== org.email) {
        const existing = await storage.getOrganizationByEmail(email);
        if (existing && existing.id !== org.id) {
          return sendApiError(res, "EMAIL_ALREADY_REGISTERED");
        }
      }
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
        return res.status(400).json({ message: "Invalid singer id" });
      }
      const singer = await storage.getSinger(singerId);
      if (!singer || !singer.admin_approved) {
        return sendApiError(res, "SINGER_NOT_FOUND");
      }
      const result = await storage.toggleShortlist(req.session.userId!, singerId);
      res.json(result);
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  app.get("/api/shortlist", requireAuth, requireOrg, async (req: Request, res: Response) => {
    try {
      const orgId = req.session.userId!;
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
      const singers = await storage.getRevealedSingersWithData(req.session.userId!);
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
        return res.status(400).json({ message: "singer_id, role_name, and engagement_date are required" });
      }
      const orgId = req.session.userId!;

      const isDuplicate = await storage.checkDuplicateFeedback(Number(singer_id), orgId, engagement_date);
      if (isDuplicate) {
        return res.status(409).json({ message: "You have already submitted feedback for this singer on this engagement date." });
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
      const count = await storage.countSearchAppearances(req.session.userId!, 30);
      res.json({ count, days: 30 });
    } catch (error: any) {
      sendRouteError(res, error, "OPERATION_FAILED");
    }
  });

  // ── Singer: Request Emergency Status ────────────────────────────────────
  app.post("/api/singer/request-emergency", requireAuth, requireSinger, async (req: Request, res: Response) => {
    try {
      const singer = await storage.updateSinger(req.session.userId!, { emergency_status_requested: true });
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
        return res.status(400).json({ message: "Work title is required" });
      }
      const created = await storage.createRepertoireSuggestion({
        ...parsed,
        singer_id: req.session.userId!,
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
        return res.status(400).json({ message: "Tier must be 'free' or 'pro'" });
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
        return res.status(400).json({ message: "Amount must be a non-zero integer" });
      }
      const VALID_REASONS = ["Promotional Grant", "Support Adjustment", "Refund", "Correction", "Other"];
      if (!reason || !VALID_REASONS.includes(reason)) {
        return res.status(400).json({ message: `Reason must be one of: ${VALID_REASONS.join(", ")}` });
      }
      const org = await storage.getOrganization(orgId);
      if (!org) return sendApiError(res, "ORG_NOT_FOUND");

      const used = org.contact_reveals_used_this_month ?? 0;
      const limit = org.contact_reveal_limit ?? 0;
      const previousBalance = limit - used;
      const newBalance = previousBalance + amt;
      if (newBalance < 0) {
        return res.status(400).json({ message: `Adjustment would make balance negative (current: ${previousBalance}, requested: ${amt})` });
      }

      const newLimit = limit + amt;
      if (newLimit < used) {
        return res.status(400).json({ message: `Adjustment would set credit limit (${newLimit}) below already-used credits (${used}) this month` });
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
        return res.status(400).json({ message: "Invalid badge field" });
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
