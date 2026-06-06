# Preview vs production deploy workflow

Vercel serves the frontend. Railway runs the API. The Vercel serverless proxy at `api/[...path].ts` forwards `/api/*` to Railway using **`RAILWAY_API_URL`** — different values per Vercel environment.

You no longer edit `vercel.json` when switching between production and preview Railway.

---

## How it works

```text
Browser → Vercel (frontend + /api proxy) → Railway API
                ↑
         RAILWAY_API_URL (env var)
```

| Vercel deployment | Vercel env scope | Typical branch | Railway target |
|-------------------|------------------|----------------|----------------|
| Production | **Production** | `main` | Railway **Production** URL |
| Preview | **Preview** | `email-integration`, PRs, etc. | Railway **Preview** URL |

---

## One-time setup

### 1. Vercel — `RAILWAY_API_URL`

[Vercel](https://vercel.com) → your project → **Settings** → **Environment Variables**

| Name | Production value | Preview value |
|------|------------------|---------------|
| `RAILWAY_API_URL` | `https://graham-singersearch-production.up.railway.app` | Your Railway **preview** public URL (no trailing slash) |

Do **not** add a trailing slash. Example preview URL shape: `https://graham-singersearch-preview.up.railway.app`

Apply each value to the correct scope only (Production vs Preview).

Redeploy after saving.

### 2. Railway — two environments

In [Railway](https://railway.app) → your API service:

**Production environment** (tracks `main`):

- `NODE_ENV=production`
- `SERVE_CLIENT=false`
- Supabase vars, `SESSION_SECRET`, `ADMIN_PASSWORD`
- Resend vars when you want email on production

**Preview environment** (tracks feature branches, e.g. `email-integration`):

- Same structural vars as production (`NODE_ENV=production`, `SERVE_CLIENT=false`, Supabase, etc.)
- Use **preview-specific** Resend keys or the same keys for testing
- Copy the **preview public URL** into Vercel’s **Preview** `RAILWAY_API_URL`

Enable preview deployments for the `email-integration` branch (Railway → service → Settings → branch / PR deploys).

### 3. Git branches

| Branch | Purpose |
|--------|---------|
| `main` | Live app — Vercel Production + Railway Production |
| `email-integration` | Email and API experiments — Vercel Preview + Railway Preview |

---

## Day-to-day workflow (email testing)

1. Push to **`email-integration`**.
2. Vercel builds a **Preview** deployment → proxy uses **Preview** `RAILWAY_API_URL`.
3. Railway deploys **Preview** from the same branch (if configured).
4. Open the Vercel preview URL, register a test user, check **Railway Preview** logs and Resend.
5. When ready, merge **`email-integration` → `main`**.
6. Production Vercel + Production Railway pick up the merge automatically (with production env vars).

---

## Verify the proxy

**Production site** — browser console (after deploy):

```javascript
await fetch("/api/public/founding-status?type=singer").then(r => r.json())
```

Should return JSON, not `RAILWAY_API_URL is not set`.

**Missing env** — you get:

```json
{ "message": "RAILWAY_API_URL is not set on Vercel. ..." }
```

**Admin email test** (on preview or prod, after admin login):

```javascript
await fetch("/api/admin/email/status", { credentials: "include" }).then(r => r.json())
await fetch("/api/admin/email/test", { method: "POST", credentials: "include" }).then(r => r.json())
```

Check the matching **Railway** environment logs for `[email]` lines.

---

## Local development

`npm run dev` runs frontend + API on one port — **no Vercel proxy**. `RAILWAY_API_URL` is not used locally.

---

## `NODE_ENV` on Railway preview

Keep **`NODE_ENV=production`** on Railway preview and production.

Preview vs production on Railway is controlled by **which environment** and **which variables** you set — not by setting `NODE_ENV=development` on preview (that breaks secure cookies for Vercel ↔ Railway).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **404 on every `/api/*` request** | Ensure `vercel.json` includes the `/api/:path*` rewrite (routes static deploys to the proxy). Redeploy Vercel after pulling latest. Confirm `api/[...path].ts` exists at project root. |
| Preview site hits production API | Set **Preview** `RAILWAY_API_URL` on Vercel to Railway **preview** URL; redeploy preview |
| `RAILWAY_API_URL is not set` (500 JSON) | Add variable on Vercel for the environment you’re testing |
| `Failed to reach Railway API` (502) | Wrong Railway URL, Railway service down, or URL has a typo — open `RAILWAY_API_URL/api/public/founding-status?type=singer` in a browser |
| Email works on prod, not preview | Resend vars on **Railway Preview**, not only Production |
| Login/session broken on preview | Keep `NODE_ENV=production` on Railway; ensure preview Railway URL is in Vercel Preview `RAILWAY_API_URL` |

---

## Files

- `api/[...path].ts` — proxies `/api/*` to `RAILWAY_API_URL`
- `vercel.json` — client build only (no hardcoded Railway URL)
