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

- `scripts/seed-demo.sql` — seed countries and demo content templates
- `scripts/cleanup-demo.sql` — remove demo data before production
- `docs/STAGING_CHECKLIST.md` — pre-launch smoke tests

## Deploy (Vercel)

1. Push repo to GitHub and import in Vercel.
2. Set environment variables from `.env.example`.
3. `vercel.json` includes security headers.
4. Health check: `GET /api/health`

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
