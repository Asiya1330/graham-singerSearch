# Singer Search — Supabase setup & local run

## 1. Supabase project

Copy **Project URL** from [Supabase Dashboard](https://supabase.com/dashboard) → your project → **API** into `SUPABASE_URL` in your local `.env`.

In [Supabase Dashboard](https://supabase.com/dashboard) → your project:

1. **API** — copy `Project URL`, `anon` key, and `service_role` key  
2. **Database** — copy **Transaction pooler** connection string (port `6543`) → `SUPABASE_DATABASE_URL`  
3. **Storage** — create a **public** bucket named `singer-uploads` (or set `SUPABASE_STORAGE_BUCKET`)

## 2. Create tables

Open **SQL Editor** and run the full script:

- [`create_missing_tables.sql`](create_missing_tables.sql)

This creates all tables including `sessions` (required for login).

Optional: run [`reseed_production_demo.sql`](reseed_production_demo.sql) in the SQL Editor for **fast** demo data (recommended).

If you skip that, the app auto-seeds in development when fewer than 50 singers exist — this takes **2–5 minutes** (many round-trips to Supabase). Watch for `[seed] 10/100 singers inserted...` in the terminal, or set `SKIP_DEMO_SEED=1` in `.env` to skip.

## 3. Local `.env`

Copy [`.env.example`](.env.example) to `.env` and fill in values from Supabase.

```bash
cp .env.example .env
```

## 4. Install & run

```bash
npm install
npm run dev
```

Open **http://localhost:5000**

The API and frontend run together in dev (same as Replit). The database is **Supabase** via `SUPABASE_DATABASE_URL`; file uploads go to **Supabase Storage**.

## 5. Schema updates

```bash
npm run db:push
```

Uses Drizzle against your Supabase database URL.

## 6. Split deploy (Phase 2 — config ready)

| Platform | Role | Build | Start |
|----------|------|-------|-------|
| **Railway** | API only | `npm run build:server` | `SERVE_CLIENT=false npm start` |
| **Vercel** | Frontend | `npm run build:client` | static `dist/public` |

1. Deploy Railway first; copy the public URL.  
2. In Vercel → **Environment Variables**, set `RAILWAY_API_URL` (Production and Preview scopes) — see [SETUP-PREVIEW-DEPLOY.md](SETUP-PREVIEW-DEPLOY.md).  
3. Deploy Vercel with env vars from `.env.example` (no secrets needed on Vercel except `SITE_URL` and `RAILWAY_API_URL`).

Railway environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL`, `SUPABASE_STORAGE_BUCKET`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `NODE_ENV=production`, `SERVE_CLIENT=false`.

Optional email notifications (Resend): see [SETUP-EMAIL.md](SETUP-EMAIL.md) — `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`.

## Troubleshooting

- **DB connection failed** — use the **pooler** URL (6543), add `?sslmode=require` if missing.  
- **Upload failed** — bucket must exist and be **public** (or use signed URLs later).  
- **Login/session issues on split deploy** — ensure Vercel `RAILWAY_API_URL` points at the correct Railway environment and cookies use `secure` + `sameSite: none` in production.
