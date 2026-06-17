# LifeOnHorse — Rebuild Handoff

**Read this first.** This project is a **rebuild** of a deleted app. Do not treat it as a greenfield idea.

## What happened (2026-06-17)

During a C: drive cleanup, the entire local project was permanently deleted:

```
C:\Users\MULTILAPTOP\Downloads\LifeOnHorse_FULL_LAUNCH\
└── lifeonhorse-app\          ← full Next.js app (GONE)
```

- Deleted with `Remove-Item -Recurse -Force` (not Recycle Bin)
- Recycle Bin was also emptied
- No git remote, no GitHub backup, no OneDrive/File History
- Previous Versions / shadow copies: none available
- Windows File Recovery was not completed

**This was a mistake.** The folder was active Cursor work, not disposable archive clutter.

## What still exists (use these to rebuild)

| Resource | Location |
|----------|----------|
| Product plan | `C:\Users\MULTILAPTOP\.cursor\plans\lifeonhorse_ecosystem_c5384fe9.plan.md` |
| Copy in this repo | `docs/lifeonhorse_ecosystem_plan.md` |
| Build chat history | `C:\Users\MULTILAPTOP\.cursor\projects\c-Users-MULTILAPTOP-Downloads-LifeOnHorse-FULL-LAUNCH\agent-transcripts\` (20 files, ~1.4 MB) |
| Main build transcript | `...\agent-transcripts\96f9d19e-e6fa-498a-9b82-715d883305ea\` |
| Build worker transcript | `...\subagents\bd728bf6-754d-4f1b-a5bc-02e0afe7901c.jsonl` |
| Cursor assets (2 hero images) | `...\c-Users-MULTILAPTOP-Downloads-LifeOnHorse-FULL-LAUNCH\assets\` |
| **Live Supabase project** | `ebgzqmnewtdippegphou` — [dashboard](https://supabase.com/dashboard/project/ebgzqmnewtdippegphou) |

## What the deleted app was

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase (`@supabase/ssr`), Zod

**Build result before deletion:**
- 50+ routes, `npm run build` succeeded
- 5 local migration files (`001`–`005`)
- Auth, marketplace, clubs, trainers, events, courses, blog, community, admin, PWA, legal pages

### Core modules (rebuild target)

- Auth (email signup/login)
- Profiles with roles: member, seller, trainer, club_owner, course_creator, moderator, admin
- Marketplace: horses, products, services, seller directory
- Clubs (polo, tent pegging, racing, riding school, breeding, etc.) — publish immediately
- Trainers & experts directory
- Events, courses, blog, community
- Horse Health & Expert Help (emergency disclaimers, photo/video uploads)
- Country landing pages `/countries/[code]`
- Supabase Storage (`uploads` bucket)
- Admin dashboard (users, reports, health requests, billing, analytics)
- Seller/expert dashboards, favorites, inquiries, reviews

### Database migrations (were in deleted repo)

Recreate from build transcript `bd728bf6-754d-4f1b-a5bc-02e0afe7901c.jsonl` which contains full SQL writes:

| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | Core schema, RLS, `handle_new_user` trigger (`SET search_path = ''`) |
| `002_trust_safety.sql` | Verification docs, audit log, rate limits |
| `003_monetization.sql` | Billing, orders, featured requests |
| `004_mobile_growth.sql` | Favorites, inquiry notifications |
| `005_enterprise_scale.sql` | Reviews, analytics view |

**Important:** Remote Supabase may already have `001` applied and trigger fixes. Inspect live schema before re-applying. Signup bug was fixed: `handle_new_user` must use `public.profiles` with `SET search_path = ''`.

### Key routes (from deleted app)

```
/                           Homepage
/auth/signup, /auth/login
/marketplace/horses, /marketplace/horses/[id], /marketplace/horses/new
/marketplace/products, /marketplace/services
/clubs, /clubs/[id], /clubs/new
/trainers, /trainers/[id], /trainers/new
/events, /courses, /blog, /community
/health, /health/request
/countries/[code]
/dashboard/seller, /dashboard/expert, /dashboard/favorites, /dashboard/inquiries
/admin                      Admin dashboard (role = admin)
/legal/*                    terms, privacy, cookies, marketplace-safety, etc.
/payments
/support
/api/health
```

### Env vars needed

```env
NEXT_PUBLIC_SUPABASE_URL=https://ebgzqmnewtdippegphou.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase API settings>
SUPABASE_SERVICE_ROLE_KEY=<JWT service role key — NOT a URL>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get keys: https://supabase.com/dashboard/project/ebgzqmnewtdippegphou/settings/api

### Admin setup (after rebuild)

1. Sign up at `/auth/signup`
2. In Supabase SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
3. Open `/admin`

## Rebuild strategy for agents

1. **Inspect live Supabase** — list tables, compare to migration list above; do not blindly re-run `001` if schema exists
2. **Recreate app scaffold** — Next.js 16 + Supabase SSR + Tailwind 4 matching deleted `package.json` deps
3. **Restore migrations** — extract SQL from build transcript or regenerate from plan + live schema diff
4. **Rebuild routes in milestone order** — Foundation → Core directories → Admin → Events/Courses/Blog → Monetization
5. **Wire `.env.local`** — user must paste Supabase keys
6. **Verify** — `npm run build`, signup flow, admin access
7. **Initialize git + push to GitHub immediately** — never leave this un-backed-up again

## Product rules (from original plan)

- Clubs publish immediately; admin moderates later
- Business model flexible — manual commission first, payments later
- Do NOT use plain-text credentials from old `Admin_Credentials.txt`
- Target countries: Pakistan, India, Turkey, South Africa, Azerbaijan, Turkmenistan (expand later)

## New project location

```
C:\Users\MULTILAPTOP\Projects\lifeonhorse-app\
```

This is the canonical rebuild location. Do not put the app back in Downloads.
