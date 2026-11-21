# Auth — Supabase dashboard checklist (LifeOnHorse)

Live project: [`ebgzqmnewtdippegphou`](https://supabase.com/dashboard/project/ebgzqmnewtdippegphou)  
App: https://lifeonhorse.com

## Root cause of “signed up but cannot log in” (2026-11-20)

| Check | Live value | Effect |
|-------|------------|--------|
| **Confirm email** (`mailer_autoconfirm`) | **Off** (confirmation required) | `signUp` creates the user **without** a session |
| App signup UX (before fix) | Always redirected to `/dashboard` | Middleware bounced to login; login failed with **Email not confirmed** |
| Profile trigger `handle_new_user` | OK (`public.profiles`, `search_path = ''`) | Profile was created; authz path was fine |
| Site URL | `https://lifeonhorse.com` | OK — but also the **fallback** when redirectTo is rejected |
| Redirect allow list | See required entries below | Bare `/**` alone is **not** enough for `?next=` |
| Custom SMTP | Resend on port **587** (not 465) | Confirmation / reset mail |

Evidence for the reported account: `email_confirmed_at` was `null` while `confirmation_sent_at` was set — the user never completed email confirmation (or never received the mail).

## Root cause of reset email opening homepage (LOH-62, 2026-11-21)

Recovery `redirectTo` is `https://lifeonhorse.com/auth/callback?next=/auth/reset-password` (locale-aware `next` for ur/ar).  
When that exact URL (query string) is **not** accepted by Auth `uri_allow_list`, GoTrue falls back to **Site URL** (`https://lifeonhorse.com`). The user never hits `/auth/callback`, so PKCE exchange and the reset form never run.

App mitigations (code): `loh_auth_next` cookie backup + homepage `?code=` rescue → `/auth/callback`. **Dashboard allow-list entries remain required.**

## What the app does now

1. **Signup** — if Supabase returns a session → enter app; if not → **Confirm your email** screen with resend.
2. **Login** — clear “confirm your email” error + resend; forgot-password link.
3. **Forgot / reset password** — recovery email → `/auth/callback?code=…&next=…/auth/reset-password` → set new password. Cookie `loh_auth_next` backs up `next`.
4. **Callback** — exchanges PKCE `code` for a session; skips locale middleware so links are not rewritten to `/ur/auth/callback`.
5. **Site URL fallback rescue** — if `/?code=…` (or `/ur`, `/ar`) lands on the homepage, middleware redirects to `/auth/callback`.
6. **Sign out** — header uses a server action that redirects to locale home. `/auth/signout` is also excluded from next-intl (POST/GET → 303 home). Without that exclusion, next-intl treated `/auth/signout` as a missing `[locale]` page and returned **404**.
7. **Authorization** — still uses `profiles.role` only (never `user_metadata`).

## Toggles to verify in the dashboard

Open **Authentication → Providers → Email** and **Authentication → URL Configuration**:

1. **Site URL** = `https://lifeonhorse.com`
2. **Redirect URLs** — keep wildcards **and** these explicit entries (query-string / matcher safety):

```
https://lifeonhorse.com/**
https://www.lifeonhorse.com/**
https://lifeonhorse.com/auth/callback
https://lifeonhorse.com/auth/callback/**
https://www.lifeonhorse.com/auth/callback
https://www.lifeonhorse.com/auth/callback/**
https://lifeonhorse.com/auth/reset-password
https://lifeonhorse.com/ur/auth/reset-password
https://lifeonhorse.com/ar/auth/reset-password
https://www.lifeonhorse.com/auth/reset-password
https://www.lifeonhorse.com/ur/auth/reset-password
https://www.lifeonhorse.com/ar/auth/reset-password
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback/**
```

Optional for Vercel previews: `https://*-<team>.vercel.app/auth/callback` (and `/**`) if you test auth on preview deploys.

3. **Confirm email**
   - **Enabled (recommended for production):** keep current setting. Users must click the email link (or use Resend) before password login works. The app now explains this.
   - **Disabled (`mailer_autoconfirm` on):** signup returns a session immediately and users can log in without email. Faster launch UX; weaker email ownership guarantee.
4. **Secure email change** — leave enabled.
5. **Custom SMTP** — Resend host `smtp.resend.com`, user `resend`, port **587** (STARTTLS). Port 465 fails with GoTrue.

## Email templates

Dashboard **Authentication → Email Templates**. Keep default Supabase variables (`{{ .ConfirmationURL }}` / `{{ .Token }}` / `{{ .SiteURL }}`). Do not hardcode Site URL as the only CTA if the template should honor `redirectTo`. No custom templates are committed in this repo.

## Manual smoke path after deploy

1. Sign up with a fresh email → see **Confirm your email** (when confirm is on).
2. Open the confirmation mail → should hit `/auth/callback` and land in the app (or login with “Email confirmed”).
3. Sign out → sign in with password.
4. Forgot password → **new** mail (wait ≥60s if rate-limited) → `/auth/callback?code=…&next=…/auth/reset-password` → set new password → sign in.
5. Sign out from header → session cleared.

## One-time fix for a stuck unconfirmed user

In **SQL Editor** (only for accounts you control):

```sql
UPDATE auth.users
SET email_confirmed_at = coalesce(email_confirmed_at, now())
WHERE email = 'user@example.com';
```

Then they can log in with their password.
