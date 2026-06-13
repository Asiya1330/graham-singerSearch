# Email notifications (Resend)

Singer Search sends transactional email via Resend on the **Railway API** only (not Vercel).

| Email | Recipient | Trigger |
|-------|-----------|---------|
| Admin new registration | `ADMIN_NOTIFICATION_EMAIL` | Singer or org registers |
| Registration confirmation | User's email | Singer or org registers |
| Singer approved | Singer's email | Admin approves singer profile |
| Password reset | User's email | Forgot password (singer or org) |

Registration and password reset always succeed even if email fails — failures are logged on the server.

Demo/seed users with `@example.com` addresses never trigger notifications.

---

## 1. Create a Resend account

1. Go to [https://resend.com/signup](https://resend.com/signup) and create an account.
2. Open the [Resend Dashboard](https://resend.com/overview).

---

## 2. Get an API key

1. In Resend → **API Keys** → **Create API Key**.
2. Name it (e.g. `singer-search-production`).
3. Permission: **Sending access** (or Full access for simplicity).
4. Copy the key — it starts with `re_`. You will not see it again.

Store it as `RESEND_API_KEY` on Railway (see step 4).

---

## 3. Configure sender and recipient (no custom domain yet)

**Do not add `gmail.com` (or any public provider) under Domains.** Resend only accepts domains **you own** (e.g. `singersearch.net`). Gmail, Outlook, Yahoo, etc. cannot be added.

| Role | Where it goes | Value |
|------|----------------|-------|
| **Sender (From)** | Railway env `RESEND_FROM_EMAIL` | `onboarding@resend.dev` (test only) |
| **Recipient (To)** | Railway env `ADMIN_NOTIFICATION_EMAIL` | `admin@your-domain.com` |

Your Gmail address is only the **inbox that receives** notifications. It is **not** added in Resend → Domains.

### Test mode (`onboarding@resend.dev`)

Resend’s test sender is a **sandbox**. It can only deliver to the **email you used to sign up for Resend**.

1. Sign up / log in to Resend with **admin@your-domain.com** (same as `ADMIN_NOTIFICATION_EMAIL`).
2. Set Railway variables (step 4) and redeploy.
3. Register a test user on the site — notifications should arrive at that Gmail inbox.

If Resend was created with a different email, either:
- change `ADMIN_NOTIFICATION_EMAIL` to match your Resend account email, **or**
- add your own domain (below) so you can send to any address.

### Production: verified domain (singersearch.com)

Once the client has verified `singersearch.com` in Resend, you can email **any recipient** (Gmail, Outlook, etc.) — not just the Resend signup inbox.

Update **Railway** (and local `.env` for testing):

```env
RESEND_API_KEY=re_client_production_key
RESEND_FROM_EMAIL=Singer Search <notifications@singersearch.com>
ADMIN_NOTIFICATION_EMAIL=admin@singersearch.com
SITE_URL=https://singersearch.com
SUPPORT_EMAIL=support@singersearch.com
EMAIL_NOTIFICATIONS_ENABLED=true
```

Notes:
- `RESEND_FROM_EMAIL` must use an address on the **verified** domain (check Resend → Domains for the exact subdomain, e.g. `notifications@` or `hello@`).
- `SITE_URL` must match where users open the site (custom domain or Vercel URL).
- `ADMIN_NOTIFICATION_EMAIL` can be any inbox you want for admin alerts.
- Logo in emails loads from `{SITE_URL}/singer-search-logo.png` — ensure that URL works after Vercel deploy.

Redeploy Railway after saving variables. No code deploy is required beyond env updates (defaults in code fall back to `singersearch.com` if `SITE_URL` is unset).

---

## 4. Railway environment variables

In [Railway](https://railway.app) → your API service → **Variables**, add:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_NOTIFICATION_EMAIL=admin@your-domain.com
SITE_URL=https://graham-singer-search.vercel.app
```

Optional:

```env
EMAIL_NOTIFICATIONS_ENABLED=true
```

`SITE_URL` is your public Vercel URL (or custom domain later). It is used in registration confirmation emails and password-reset links.

Set `EMAIL_NOTIFICATIONS_ENABLED=false` to disable without removing the API key.

Redeploy Railway after saving variables.

**Vercel does not need Resend variables** — only `RAILWAY_API_URL` (see [SETUP-PREVIEW-DEPLOY.md](SETUP-PREVIEW-DEPLOY.md)). Email runs on whichever Railway environment handles the request.

---

## 5. Local development

Add the same variables to your local `.env` (copy from `.env.example`):

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_NOTIFICATION_EMAIL=admin@your-domain.com
SITE_URL=http://localhost:5000
```

If `RESEND_API_KEY` is unset, the app starts normally and logs:

`[email] Not ready (startup) — RESEND_API_KEY is missing or empty`

---

## 6. Test and read logs

### A. Check Railway startup logs

After deploy, open **Railway → your service → Deployments → Logs** and look for one of:

```
[email] Ready (startup) — from=onboarding@resend.dev to=admin@your-domain.com key=re_xxxx…
```

or:

```
[email] Not ready (startup) — RESEND_API_KEY is missing or empty
```

If you see **Not ready**, fix the missing variables on **production Railway** (the URL in `vercel.json`) and redeploy.

### B. Send a test email (admin API)

1. Log in to the **Admin dashboard** on your site (uses `ADMIN_PASSWORD`).
2. In the browser devtools console (while on the site), run:

```javascript
// 1) Check config (no secrets exposed)
await fetch("/api/admin/email/status", { credentials: "include" }).then(r => r.json())

// 2) Send test email
await fetch("/api/admin/email/test", { method: "POST", credentials: "include" }).then(r => r.json())
```

Expected status response:

```json
{ "enabled": true, "ready": true, "issues": [], "fromEmail": "onboarding@resend.dev", "adminNotificationEmail": "admin@your-domain.com", "apiKeySet": true, "apiKeyHint": "re_xxxx…" }
```

Expected test response on success:

```json
{ "ok": true, "message": "Email sent successfully", "resendId": "…" }
```

If `ready` is `false`, the `issues` array tells you exactly what is missing on Railway.

### C. Test via registration

1. Register a new singer or organization with a **real email** (not `@example.com`).
2. In Railway logs, search for `[email]`. You should see:

```
[email] Registration hook fired — type=singer id=123 email=someone@gmail.com
[email] registration notification for someone@gmail.com — sending from=… to=…
[email] registration notification for someone@gmail.com succeeded — resendId=…
```

3. Check **admin@your-domain.com** (and spam).
4. Check the **Resend dashboard → Emails** — an entry appears only after `succeeded` with a `resendId`.

### D. Direct curl against Railway (bypass Vercel)

Replace with your production Railway URL:

```bash
curl -s "https://your-railway-service.up.railway.app/api/admin/email/status" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

For a full test without admin session, use Railway logs after registration — the startup line alone confirms whether env vars are loaded.

---

## Sandbox testing (no custom domain)

With `onboarding@resend.dev`, Resend only **delivers** to the email you used to sign up for Resend. To test all flows:

1. Set `ADMIN_NOTIFICATION_EMAIL` to your Resend account email (e.g. `admin@your-domain.com`).
2. Register test singer/org accounts using **that same email**.
3. Set `SITE_URL` to your Vercel URL so reset links work.
4. Confirm sends in Railway logs (`resendId=…`) and Resend Dashboard → Emails.

## Re-testing with the same email address

Because registration requires a **unique email**, you must remove the test account before registering again with `admin@your-domain.com`.

### Option A — Admin dashboard (easiest)

1. Log in as **Admin**
2. Find the test singer → **Delete**
3. Find the test organization → **Delete** (Admin → Organizations)
4. Register again to trigger registration emails

### Option B — Supabase SQL

Run in **Supabase → SQL Editor** (replace the email):

```sql
-- Delete test singer and related data
DELETE FROM password_reset_tokens
WHERE user_type = 'singer'
  AND user_id IN (SELECT id FROM singers WHERE email = 'admin@your-domain.com');

DELETE FROM singer_roles WHERE singer_id IN (SELECT id FROM singers WHERE email = 'admin@your-domain.com');
DELETE FROM singer_works WHERE singer_id IN (SELECT id FROM singers WHERE email = 'admin@your-domain.com');
DELETE FROM availabilities WHERE singer_id IN (SELECT id FROM singers WHERE email = 'admin@your-domain.com');
DELETE FROM singers WHERE email = 'admin@your-domain.com';

-- Delete test organization
DELETE FROM password_reset_tokens
WHERE user_type = 'organization'
  AND user_id IN (SELECT id FROM organizations WHERE email = 'admin@your-domain.com');

DELETE FROM organizations WHERE email = 'admin@your-domain.com';
```

### Re-test without deleting

| Email type | How to re-trigger |
|------------|-------------------|
| Password reset | Use **Forgot password** again (max 3 requests/hour per account) |
| Singer approved | Admin → **Reject**, then **Approve** again |
| Admin test email | `POST /api/admin/email/test` anytime |
| Registration emails | Must delete account first (same email) |

You do **not** need to clear Resend, sessions, or Railway env vars between tests.

---

## Full test checklist

1. `GET /api/admin/email/status` → `ready: true`
2. `POST /api/admin/email/test` → email in inbox
3. Register singer → user confirmation + admin alert
4. Register org → user confirmation + admin alert
5. Admin approve singer → approval email
6. Forgot password (singer + org) → reset link → new password → login

## What the admin registration email includes

- User type (Singer / Organization)
- Name, email, voice type or org type
- City / state, founding member status
- User ID and registration timestamp (UTC)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "We don't allow free public domains" when adding domain | You tried to add Gmail/Outlook/etc. Use a domain **you own**, or skip Domains and use `onboarding@resend.dev` for testing |
| No email, log says disabled | Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ADMIN_NOTIFICATION_EMAIL` on Railway |
| Resend 403 / domain not allowed | With test sender, `ADMIN_NOTIFICATION_EMAIL` must match your **Resend account email**; or verify your own domain |
| Registration works, no email | Check Railway startup for `[email] Not ready`; use `/api/admin/email/status` and `/api/admin/email/test` |
| Nothing in Resend dashboard | Resend API was never called — config not ready on the Railway service handling `/api/*` |
| Demo users don't email | Expected — `@example.com` addresses are skipped |

---

## Code layout

```
server/lib/email/
  index.ts                              # send helpers + notify*()
  config.ts                             # env helpers + getSiteUrl()
  client.ts                             # Resend client
  templates/base-layout.ts
  templates/new-registration.ts         # admin alert
  templates/registration-confirmation.ts
  templates/singer-approved.ts
  templates/password-reset.ts
```

Hooks live in `server/routes.ts` on registration, admin approve, and `/api/auth/forgot-password`.

Email links use `SITE_URL` paths:

- `/login/singer` — singer sign-in
- `/login/organization` — organization sign-in
- `/reset-password?token=...&type=singer|organization` — password reset
- Logo image: `{SITE_URL}/singer-search-logo.png` (from `client/public/`)
