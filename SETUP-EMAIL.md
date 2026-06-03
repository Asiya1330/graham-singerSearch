# Email notifications (Resend)

Singer Search sends you an admin email when a real user registers as a **Singer** or **Organization**. Email runs on the **Railway API** only (not Vercel).

Registration always succeeds even if email fails — failures are logged on the server.

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
| **Recipient (To)** | Railway env `ADMIN_NOTIFICATION_EMAIL` | `gfarhan18@gmail.com` |

Your Gmail address is only the **inbox that receives** notifications. It is **not** added in Resend → Domains.

### Test mode (`onboarding@resend.dev`)

Resend’s test sender is a **sandbox**. It can only deliver to the **email you used to sign up for Resend**.

1. Sign up / log in to Resend with **gfarhan18@gmail.com** (same as `ADMIN_NOTIFICATION_EMAIL`).
2. Set Railway variables (step 4) and redeploy.
3. Register a test user on the site — notifications should arrive at that Gmail inbox.

If Resend was created with a different email, either:
- change `ADMIN_NOTIFICATION_EMAIL` to match your Resend account email, **or**
- add your own domain (below) so you can send to any address.

### Production: use a domain you own

When you have a domain (e.g. from Namecheap, Google Domains, Cloudflare):

1. Resend → **Domains** → **Add Domain** — enter **your** domain (e.g. `singersearch.net`), **not** `gmail.com`.
2. Add the DNS records Resend shows (SPF, DKIM) at your DNS provider.
3. Wait until status is **Verified**.
4. Update Railway:
   ```env
   RESEND_FROM_EMAIL=Singer Search <notifications@yourdomain.com>
   ```

After that, you can send to `gfarhan18@gmail.com` (or any address) without the sandbox restriction.

---

## 4. Railway environment variables

In [Railway](https://railway.app) → your API service → **Variables**, add:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_NOTIFICATION_EMAIL=gfarhan18@gmail.com
```

Optional:

```env
EMAIL_NOTIFICATIONS_ENABLED=true
```

Set `EMAIL_NOTIFICATIONS_ENABLED=false` to disable without removing the API key.

Redeploy Railway after saving variables.

**Vercel does not need these variables** — the frontend only proxies `/api/*` to Railway.

---

## 5. Local development

Add the same variables to your local `.env` (copy from `.env.example`):

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_NOTIFICATION_EMAIL=gfarhan18@gmail.com
```

If `RESEND_API_KEY` is unset, the app starts normally and logs once:

`[email] Notifications disabled — set RESEND_API_KEY (and related vars) to enable.`

---

## 6. Test

1. Register a new singer or organization with a **real email** (not `@example.com`).
2. Check Railway logs for:
   - `[email] New registration notification sent for singer #…`
   - or an error line if something failed
3. Check **gfarhan18@gmail.com** (and spam folder).

---

## What each email includes

- User type (Singer / Organization)
- Name
- Email
- Voice type or organization type
- City / state
- Founding member status
- User ID and registration timestamp (UTC)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "We don't allow free public domains" when adding domain | You tried to add Gmail/Outlook/etc. Use a domain **you own**, or skip Domains and use `onboarding@resend.dev` for testing |
| No email, log says disabled | Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ADMIN_NOTIFICATION_EMAIL` on Railway |
| Resend 403 / domain not allowed | With test sender, `ADMIN_NOTIFICATION_EMAIL` must match your **Resend account email**; or verify your own domain |
| Registration works, no email | Check Railway logs for `[email]` lines; API key and from-address must be valid |
| Demo users don't email | Expected — `@example.com` addresses are skipped |

---

## Code layout

```
server/lib/email/
  index.ts                    # notifyNewRegistration()
  config.ts                   # env helpers
  client.ts                   # Resend client
  templates/new-registration.ts
```

Hooks live in `server/routes.ts` on `POST /api/auth/register/singer` and `POST /api/auth/register/organization`.
