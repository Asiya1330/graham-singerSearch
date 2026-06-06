import "./lib/load-env.js";
import express, { type Request, Response, NextFunction } from "express";
import { shouldServeClient } from "./lib/env";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { pool } from "./storage";
import { seedDatabase } from "./seed-data";
import { seedRepertoire } from "./seed-repertoire";
import { geocodeCityState } from "./lib/geocode";

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await pool.query(`
    -- singers schema backfill for migrated databases
    ALTER TABLE singers ADD COLUMN IF NOT EXISTS latitude double precision;
    ALTER TABLE singers ADD COLUMN IF NOT EXISTS longitude double precision;
    ALTER TABLE singers ADD COLUMN IF NOT EXISTS video_link_1 text;
    ALTER TABLE singers ADD COLUMN IF NOT EXISTS video_link_2 text;
    ALTER TABLE singers ADD COLUMN IF NOT EXISTS audio_link_1 text;
    ALTER TABLE singers ADD COLUMN IF NOT EXISTS founding_expires_at timestamp;
    ALTER TABLE singers ADD COLUMN IF NOT EXISTS performance_types text[];

    -- organizations schema backfill
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS founding_expires_at timestamp;

    -- role/work schema backfill
    ALTER TABLE singer_roles ADD COLUMN IF NOT EXISTS status text DEFAULT 'performed';
    ALTER TABLE singer_works ADD COLUMN IF NOT EXISTS status text DEFAULT 'performed';

    CREATE TABLE IF NOT EXISTS search_logs (
      id serial primary key,
      org_id integer,
      search_filters jsonb,
      created_at timestamp default now()
    );
  `);

  const { rows: untagged } = await pool.query(
    "SELECT count(*)::int as cnt FROM singers WHERE performance_types IS NULL"
  );
  if (untagged[0].cnt > 0) {
    log(`Tagging ${untagged[0].cnt} singers with performance_types...`);
    await pool.query(`
      UPDATE singers s SET performance_types = (
        SELECT array_agg(DISTINCT t.cat) FROM (
          SELECT 'Opera' AS cat FROM singer_roles r WHERE r.singer_id = s.id
          UNION
          SELECT 'Orchestra' AS cat FROM singer_works w WHERE w.singer_id = s.id AND lower(coalesce(w.context,'')) = 'orchestra'
          UNION
          SELECT 'Chorus' AS cat FROM singer_works w WHERE w.singer_id = s.id AND (lower(coalesce(w.context,'')) LIKE '%chor%' OR lower(coalesce(w.work_title,'')) LIKE '%mass%' OR lower(coalesce(w.work_title,'')) LIKE '%requiem%' OR lower(coalesce(w.work_title,'')) LIKE '%passion%' OR lower(coalesce(w.work_title,'')) LIKE '%messiah%' OR lower(coalesce(w.work_title,'')) LIKE '%carmina%' OR lower(coalesce(w.work_title,'')) LIKE '%oratorio%')
        ) t
      )
      WHERE s.performance_types IS NULL
    `);
    await pool.query("UPDATE singers SET performance_types = ARRAY['Other'] WHERE performance_types IS NULL OR array_length(performance_types, 1) IS NULL");
    log("Performance types tagged successfully.");
  }

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.SKIP_DEMO_SEED !== "1"
  ) {
    const { rows } = await pool.query("SELECT count(*)::int as cnt FROM singers");
    if (rows[0].cnt < 50) {
      log(
        `Only ${rows[0].cnt} singers found — re-seeding 100 demo profiles (first run can take 2–5 minutes over Supabase; set SKIP_DEMO_SEED=1 to skip)`,
      );
      await pool.query("DELETE FROM contact_reveals WHERE singer_id IN (SELECT id FROM singers WHERE email LIKE '%@example.com')");
      await pool.query("DELETE FROM availabilities WHERE singer_id IN (SELECT id FROM singers WHERE email LIKE '%@example.com')");
      await pool.query("DELETE FROM singer_roles WHERE singer_id IN (SELECT id FROM singers WHERE email LIKE '%@example.com')");
      await pool.query("DELETE FROM singer_works WHERE singer_id IN (SELECT id FROM singers WHERE email LIKE '%@example.com')");
      await pool.query("DELETE FROM singers WHERE email LIKE '%@example.com'");
      await pool.query("DELETE FROM contact_reveals WHERE org_id IN (SELECT id FROM organizations WHERE email IN ('sarah.mitchell@metopera.org','casting@lyricchicago.org','casting@operasanjose.org','casting@azopera.org','casting@operatampa.org','casting@madisonopera.org','casting@pbopera.org'))");
      await pool.query("DELETE FROM organizations WHERE email IN ('sarah.mitchell@metopera.org','casting@lyricchicago.org','casting@operasanjose.org','casting@azopera.org','casting@operatampa.org','casting@madisonopera.org','casting@pbopera.org')");
      await seedDatabase(pool);
      log("Demo data seeded successfully! (100 singers, 7 organizations)");
    } else {
      log(`${rows[0].cnt} singers present — skipping demo reseed.`);
    }
  }

  if (process.env.RESET_ORG_4_CREDITS === "1") {
    const EXPECTED_EMAIL = "sarah.mitchell@metopera.org";
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const orgLookup = await client.query(
        "SELECT id, email FROM organizations WHERE id = 4 FOR UPDATE"
      );
      if (orgLookup.rowCount !== 1) {
        await client.query("ROLLBACK");
        log(`[reset-org-4] ABORT: expected exactly 1 org with id=4, found ${orgLookup.rowCount}. No changes made.`);
      } else if (orgLookup.rows[0].email !== EXPECTED_EMAIL) {
        await client.query("ROLLBACK");
        log(`[reset-org-4] ABORT: org id=4 email is '${orgLookup.rows[0].email}', expected '${EXPECTED_EMAIL}'. Refusing to mutate wrong tenant. No changes made.`);
      } else {
        const del = await client.query("DELETE FROM contact_reveals WHERE org_id = 4");
        const upd = await client.query(
          "UPDATE organizations SET contact_reveal_limit = 50, contact_reveals_used_this_month = 0 WHERE id = 4 RETURNING id, email, contact_reveal_limit, contact_reveals_used_this_month"
        );
        if (upd.rowCount !== 1) {
          await client.query("ROLLBACK");
          log(`[reset-org-4] ABORT: UPDATE affected ${upd.rowCount} rows (expected 1). Rolled back.`);
        } else {
          await client.query("COMMIT");
          log(`[reset-org-4] OK. Deleted ${del.rowCount} contact_reveals rows; org row now: ${JSON.stringify(upd.rows[0])}. Unset RESET_ORG_4_CREDITS to disable on next deploy.`);
        }
      }
    } catch (e) {
      try { await client.query("ROLLBACK"); } catch {}
      log(`[reset-org-4] ERROR (rolled back): ${(e as Error).message}`);
    } finally {
      client.release();
    }
  }

  if (process.env.RUN_GEOCODE_BACKFILL === "1") {
    const { rows: pending } = await pool.query(
      "SELECT id, city, state FROM singers WHERE (latitude IS NULL OR longitude IS NULL) AND city IS NOT NULL AND state IS NOT NULL ORDER BY id"
    );
    if (pending.length === 0) {
      log("[geocode-backfill] No singers need geocoding — skipping.");
    } else {
      log(`[geocode-backfill] Backfilling coordinates for ${pending.length} singers (rate-limited, ~1.1s each)...`);
      let ok = 0;
      let failed = 0;
      for (const row of pending as Array<{ id: number; city: string; state: string }>) {
        try {
          const coords = await geocodeCityState(row.city, row.state);
          if (coords) {
            await pool.query(
              "UPDATE singers SET latitude = $1, longitude = $2 WHERE id = $3",
              [coords.lat, coords.lng, row.id]
            );
            ok++;
          } else {
            failed++;
            log(`[geocode-backfill] FAILED #${row.id} ${row.city}, ${row.state}`);
          }
        } catch (e) {
          failed++;
          log(`[geocode-backfill] ERROR #${row.id} ${row.city}, ${row.state}: ${(e as Error).message}`);
        }
      }
      log(`[geocode-backfill] Done. Success: ${ok}, Failed: ${failed}. Unset RUN_GEOCODE_BACKFILL to disable on next deploy.`);
    }
  }

  try {
    const insertedRep = await seedRepertoire(pool);
    if (insertedRep > 0) {
      log(`Repertoire reference seeded: ${insertedRep} entries.`);
    }
  } catch (err) {
    console.error("[repertoire-seed] failed:", err);
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production" && shouldServeClient()) {
    serveStatic(app);
  } else if (process.env.NODE_ENV !== "production") {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  httpServer.listen(port, host, () => {
    log(`serving on http://localhost:${port}`);
  });
})();
