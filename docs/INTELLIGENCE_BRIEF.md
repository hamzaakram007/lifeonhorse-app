# LifeOnHorse Intelligence Brief

Master rebuild spec — generated from 20 transcripts.

## Stack
- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Supabase (`@supabase/ssr`), Zod
- Project: `ebgzqmnewtdippegphou`

## Restore status
- **Files restored from transcripts:** 150
- **Routes:** 20
- **Tables in migrations:** 30

## Modules (full parity required)
1. Auth + profiles + roles
2. Marketplace: horses, products, services, sellers
3. Clubs (publish immediately)
4. Trainers & experts
5. Events, courses, blog, community
6. Horse Health & Expert Help
7. Admin dashboard
8. Seller/expert dashboards, favorites, inquiries
9. Legal pages, PWA, payments guidance
10. Demo seed + cleanup scripts

## 5 roadmap phases (all implemented pre-deletion)
1. Foundation — env, legal, deploy prep
2. Trust & Safety — verification, audit log, rate limits
3. Monetization — billing, orders, featured requests
4. Mobile & Growth — PWA, favorites, inquiry notifications
5. Enterprise Scale — reviews, analytics, dashboards

## Next steps after restore
1. `npm install`
2. Fill `.env.local` with Supabase keys
3. Apply missing remote migrations (diff SUPABASE_STATE.md)
4. `npm run build` then `npm run dev`
5. Promote admin user in SQL Editor

See also: USER_DECISIONS.md, FEATURE_INVENTORY.md, KNOWN_FIXES.md, TRANSCRIPT_INDEX.md
