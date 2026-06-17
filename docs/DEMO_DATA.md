# LifeOnHorse Demo Data

Professional staging dataset for LifeOnHorse. **Do not use in production without cleanup.**

## Quick start

1. Set `SUPABASE_SERVICE_ROLE_KEY` (JWT from Supabase → Settings → API) in `.env.local`.
2. From `lifeonhorse-app/`:

```bash
npm run seed
```

3. Log in with any demo account (password below) or your real admin account.

## Demo accounts

All demo users use password: **`DemoLifeOnHorse2026!`**

| Email | Role |
|-------|------|
| admin@demo.lifeonhorse.com | Admin |
| breeder@demo.lifeonhorse.com | Seller / breeder |
| tack@demo.lifeonhorse.com | Tack shop |
| polo@demo.lifeonhorse.com | Polo club owner |
| trainer@demo.lifeonhorse.com | Trainer |
| community@demo.lifeonhorse.com | Member |

Full list: `scripts/demo-constants.mjs`

## What gets seeded

| Section | Count |
|---------|-------|
| Countries | 20 global markets |
| Demo users | 13 personas |
| Horses | 8 listings |
| Sellers | 5 profiles |
| Products | 8 |
| Services | 6 |
| Clubs | 6 |
| Trainers | 6 |
| Experts | 6 |
| Health requests | 5 |
| Events | 6 |
| Courses | 4 (with lessons) |
| Blog posts | 8 SEO articles |
| Community | 4 stories + 6 gallery posts |
| Reviews | 3 |
| Billing demo | orders, subscriptions, commissions, featured requests |

## Demo markers (for safe cleanup)

- Emails: `*@demo.lifeonhorse.com`
- Text prefix: `[DEMO]`
- Profile notes: `admin_notes = 'demo'`
- Fixed UUID prefixes: `d1111111`, `d2222222`, `d3333333`, etc.

## Images

Remote Unsplash URLs are used for staging only. **Replace with owned or licensed assets before launch.**

## Cleanup (required before production)

```bash
npm run seed:cleanup
```

Or run `scripts/cleanup-demo.sql` in the Supabase SQL Editor.

Cleanup removes demo users and fixed demo entity IDs only. Real user content is not deleted.

## SQL-only fallback

`scripts/seed-demo.sql` seeds countries. Full content needs auth users — use the JS seed (`npm run seed`).

## Re-seeding

The JS seed is idempotent (fixed UUIDs + upsert). Safe to run multiple times on staging.

## Verification checklist

- [ ] Homepage shows horses, clubs, events with images
- [ ] Marketplace sections non-empty (horses, products, services, sellers)
- [ ] Health, experts, courses, blog, community populated
- [ ] Admin analytics / billing show activity
- [ ] `npm run build` passes
- [ ] `npm run seed:cleanup` removes demo content
