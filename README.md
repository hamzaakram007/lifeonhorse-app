# LifeOnHorse

Global horse ecosystem: marketplace, clubs, trainers, events, courses, blog, community, and expert horse health help.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, and **Supabase** (`@supabase/ssr`).

## Quick start

```bash
cd lifeonhorse-app
cp .env.example .env.local
# Edit .env.local with your Supabase keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example` for all variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Publishable anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin ops | Server-only JWT (never expose to browser) |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL for auth redirects |
| `NEXT_PUBLIC_APP_ENV` | No | `development` / `staging` / `production` |

Env validation runs via `lib/env.ts` on server startup.

## Supabase setup

Project ref: `ebgzqmnewtdippegphou`

1. Create a project or use the existing one at [Supabase Dashboard](https://supabase.com/dashboard/project/ebgzqmnewtdippegphou).
2. Apply migrations in order from `supabase/migrations/`:
   - `001_initial_schema.sql` — core tables, RLS, auth trigger
   - `002_trust_safety.sql` — verification, audit log, rate limits
   - `003_monetization.sql` — billing, orders, featured requests
   - `004_mobile_growth.sql` — favorites, notifications
   - `005_enterprise_scale.sql` — reviews, analytics view

   Via Supabase CLI:
   ```bash
   supabase link --project-ref ebgzqmnewtdippegphou
   supabase db push
   ```

   Or paste each file into the [SQL Editor](https://supabase.com/dashboard/project/ebgzqmnewtdippegphou/sql/new).

3. Enable Email auth under Authentication → Providers.
4. Storage bucket `uploads` is created by migration 001.
5. Create your first admin:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```

## Scripts

- `npm run seed:all` — create 10 demo users + professional content (see `docs/DEMO_DATA.md`)
- `npm run seed:cleanup` — remove all demo data
- `docs/STAGING_CHECKLIST.md` — pre-launch smoke tests

## Deploy (Vercel)

1. Push repo to GitHub and import in [Vercel](https://vercel.com).
2. Set environment variables for **Production** and **Preview**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ebgzqmnewtdippegphou.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role JWT |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_ENV` | `production` |

3. In Supabase → Authentication → URL configuration:
   - **Site URL:** your Vercel production URL
   - **Redirect URLs:** `https://*.vercel.app/auth/callback` and `https://your-app.vercel.app/auth/callback`

4. Run `npm run seed:all` against staging Supabase for demo accounts.
5. Health check: `GET /api/health`
6. `vercel.json` includes security headers.

### Custom domain (when ready)

1. Add your domain in Vercel → Project Settings → Domains.
2. Point DNS (CNAME) to Vercel as instructed.
3. Update `NEXT_PUBLIC_APP_URL` to your custom domain and redeploy.
4. Update Supabase Site URL and redirect URLs to match.
5. Sitemap and Open Graph URLs update automatically via `metadataBase`.

## Features (5-phase roadmap)

- **Phase 1**: Legal pages, env validation, health API, staging checklist
- **Phase 2**: Verification badges, moderation queue, rate limits, health disclaimers
- **Phase 3**: Billing plans, orders, featured listings, commission tracking
- **Phase 4**: PWA manifest, favorites, inquiry inbox, country landing pages, SEO metadata
- **Phase 5**: Seller/expert dashboards, reviews, video health uploads, admin analytics

## Manual steps before launch

1. Set real `SUPABASE_SERVICE_ROLE_KEY` (JWT from API settings)
2. Configure custom SMTP for auth emails (Supabase → Authentication → SMTP)
3. Connect custom domain in Vercel + DNS
4. Run `scripts/cleanup-demo.sql` on production database
5. Complete staging checklist in `docs/STAGING_CHECKLIST.md`

## License

Private — LifeOnHorse
