# Demo Data — LifeOnHorse

Professional multi-persona staging data for LifeOnHorse. Run against your Supabase project with service role credentials in `.env.local`.

## Quick start

```bash
npm run seed:all
```

This creates 10 demo auth users, then seeds horses, clubs, trainers, products, services, events, blog posts, courses, community posts, and experts — each owned by the appropriate persona.

## Demo accounts

**Password for all accounts:** `DemoLifeOnHorse2026!`

| Email | Role | Persona |
|-------|------|---------|
| admin@demo.lifeonhorse.com | admin | Demo Admin (Lahore, PK) |
| breeder@demo.lifeonhorse.com | seller | Aisha Khan — breeder |
| tack@demo.lifeonhorse.com | seller | Lahore Premier Tack |
| feed@demo.lifeonhorse.com | seller | Equine Nutrition Co (Jaipur) |
| transport@demo.lifeonhorse.com | seller | Global Horse Transport (Dubai) |
| polo@demo.lifeonhorse.com | club_owner | Royal Polo Club (Buenos Aires) |
| tentpegging@demo.lifeonhorse.com | club_owner | Frontier Tent Pegging (Multan) |
| trainer@demo.lifeonhorse.com | trainer | Sarah Mitchell (Newmarket) |
| vet@demo.lifeonhorse.com | member | Dr. James Whitfield |
| community@demo.lifeonhorse.com | member | Emma Rodriguez (Kentucky) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run seed:users` | Create demo auth users + profiles only |
| `npm run seed` | Seed content (requires users to exist) |
| `npm run seed:all` | Users then content |
| `npm run seed:cleanup` | Remove all demo data and users |
| `npm run seed:products` | Upsert marketplace products + remap photos (Management API or SQL) |

## Content seeded

- 15 horses across breeders (PK, UK, US, UAE, AR, DE, etc.)
- 6 clubs (polo, tent pegging, riding school, rescue, sports)
- 6 trainers with specialties and verified badges
- 16 products across tack / feed / grooming / stable / apparel (local `/images/demo/product-*.jpg`), 6 services distributed across sellers
- 6 events (polo cup, tent pegging championship, clinic, auction)
- 8 blog posts with editorial-quality content
- 6 courses (beginner to advanced, free + paid)
- 8 community posts
- 6 experts (vet, farrier, nutritionist, etc.)
- 3 health requests

All content uses fixed UUIDs from `scripts/demo-constants.mjs` for idempotent re-runs.

## Environment

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Cleanup

```bash
npm run seed:cleanup
```

Removes all demo content and auth users defined in `demo-constants.mjs`.
