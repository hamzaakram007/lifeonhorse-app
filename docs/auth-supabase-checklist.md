# Auth — Supabase dashboard checklist (LifeOnHorse)

Live project: [`ebgzqmnewtdippegphou`](https://supabase.com/dashboard/project/ebgzqmnewtdippegphou)  
App: https://lifeonhorse.com

## Root cause of “signed up but cannot log in” (2026-11-20)

| Check | Live value | Effect |
|-------|------------|--------|
| **Confirm email** (`mailer_autoconfirm`) | **Off** (confirmation required) | `signUp` creates the user **without** a session |
| App signup UX (before fix) | Always redirected to `/dashboard` | Middleware bounced to login; login failed with **Email not confirmed** |
| Profile trigger `handle_new_user` | OK (`public.profiles`, `search_path = ''`) | Profile was created; authz path was fine |
| Site URL | `https://lifeonhorse.com` | OK |
| Redirect allow list | `https://lifeonhorse.com/**`, `https://www.lifeonhorse.com/**` | OK for `/auth/callback` |
| Custom SMTP | **Not configured** | Confirmation / reset emails use Supabase’s built-in mailer (strict rate limits; often land in spam) |

Evidence for the reported account: `email_confirmed_at` was `null` while `confirmation_sent_at` was set — the user never completed email confirmation (or never received the mail).

## What the app does now

1. **Signup** — if Supabase returns a session → enter app; if not → **Confirm your email** screen with resend.
2. **Login** — clear “confirm your email” error + resend; forgot-password link.
3. **Forgot / reset password** — recovery email → `/auth/callback?next=…/auth/reset-password` → set new password.
4. **Callback** — exchanges PKCE `code` for a session; skips locale middleware so links are not rewritten to `/ur/auth/callback`.
5. **Authorization** — still uses `profiles.role` only (never `user_metadata`).

## Toggles to verify in the dashboard

Open **Authentication → Providers → Email** and **Authentication → URL Configuration**:

1. **Site URL** = `https://lifeonhorse.com`
2. **Redirect URLs** include:
   - `https://lifeonhorse.com/**`
   - `https://www.lifeonhorse.com/**`
   - (optional for local) `http://localhost:3000/**`
3. **Confirm email**
   - **Enabled (recommended for production):** keep current setting. Users must click the email link (or use Resend) before password login works. The app now explains this.
   - **Disabled (`mailer_autoconfirm` on):** signup returns a session immediately and users can log in without email. Faster launch UX; weaker email ownership guarantee.
4. **Secure email change** — leave enabled.
5. **Custom SMTP** (strongly recommended) — Authentication → Emails / Project Settings → SMTP. Without it, confirmation and reset mail are unreliable under load (built-in rate limit is very low).

## Manual smoke path after deploy

1. Sign up with a fresh email → see **Confirm your email** (when confirm is on).
2. Open the confirmation mail → should hit `/auth/callback` and land in the app (or login with “Email confirmed”).
3. Sign out → sign in with password.
4. Forgot password → mail → set new password → sign in.
5. Sign out from header → session cleared.

## One-time fix for a stuck unconfirmed user

In **SQL Editor** (only for accounts you control):

```sql
UPDATE auth.users
SET email_confirmed_at = coalesce(email_confirmed_at, now())
WHERE email = 'user@example.com';
```

Then they can log in with their password.
