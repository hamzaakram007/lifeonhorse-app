# Supabase State (live inspection)

> **LIVE PROBE SKIPPED — 2026-11-07**  
> User declined Supabase MCP auth. No service-role env was available in this agent VM.  
> This document was refreshed from **repo evidence only** (migrations + forms + prior 2026-06-17 remote probe). Treat table/column presence below as **last-known remote**, not re-verified today. A later worker must re-probe before applying DDL.

Project: `ebgzqmnewtdippegphou`  
URL: https://supabase.com/dashboard/project/ebgzqmnewtdippegphou  
Last live inspect: **2026-06-17** (REST API probe via service role)  
Repo evidence refresh: **2026-11-07**

## Summary

The live database follows the **001_initial_schema** lineage (`seller_profiles`, `services`, `horses`, `products`).  
Migration `004_marketplace_and_health.sql` (alternate `sellers` / `marketplace_services` tables) was **not** applied remotely — app code was aligned to the live schema instead of re-running conflicting DDL.

### `004_marketplace_and_health.sql` — **DO_NOT_APPLY**

| Status | Action |
|--------|--------|
| **DO_NOT_APPLY** | Never run on project `ebgzqmnewtdippegphou`. Conflicts with live 001 lineage (`sellers` vs `seller_profiles`, `marketplace_services` vs `services`, competing `products`/`experts`/`health_requests`). File is retained for historical/alternate-schema reference only. |

## Tables present (last-known remote, 2026-06-17)

| Table | Status | Notes |
|-------|--------|-------|
| profiles | ✅ | Demo admin + seller rows; columns per 001 (`country_code`, `role`, `is_suspended`, …) |
| seller_profiles | ✅ | Used by marketplace seller flows |
| horses | ✅ | Horse marketplace |
| products | ✅ | Product marketplace |
| services | ✅ | Service marketplace |
| clubs | ✅ | |
| trainers | ✅ | 001 columns: `specialty`, `description`, `country_code`, `email`, `phone` — **no** `slug` / `trainer_type` / `bio` / `country` |
| events | ✅ | |
| courses | ✅ | |
| blog_posts | ✅ | |
| community_posts | ✅ | Gallery + community forms map here; **no** `user_stories` table |
| inquiries | ✅ | |
| health_requests | ✅ | Demo row present |
| experts | ✅ | |
| verification_documents | ✅ | |
| audit_log | ✅ | |
| billing_plans | ✅ | |
| orders | ✅ | |
| favorites | ✅ | |
| reviews | ✅ | |
| reports | ✅ | |
| commission_records | ✅ | |
| subscriptions | ✅ | |
| featured_listing_requests | ✅ | |
| newsletter_subscribers | ✅ | |
| rate_limits | ✅ | |
| countries | ✅ | |

## Tables NOT on remote (app / seed still reference some)

| Expected elsewhere | Live / 001 alternative |
|--------------------|------------------------|
| sellers (004) | seller_profiles |
| marketplace_services (004) | services |
| horse_listings (004 era) | horses |
| horse_gallery | community_posts (gallery form) |
| **user_stories** | **Missing** — `app/community/stories/new` + `scripts/seed-demo.sql` still target it; use `community_posts` or add a dedicated migration (next worker) |

## Key column truth (001 lineage — authoritative for forms)

### `profiles`
`id`, `email`, `full_name`, `avatar_url`, `role`, **`country_code`**, `city`, `bio`, `phone`, `is_suspended`, `admin_notes`, timestamps.  
No `country` column.

### `trainers`
`user_id`, `display_name`, **`specialty`**, **`description`**, **`country_code`**, `city`, `experience_years`, `certifications`, **`phone`**, **`email`**, `photos`, flags, `status`.  
**Not present:** `slug`, `trainer_type`, `bio`, `country`, `contact_email`, `contact_phone`, `whatsapp`, `published_at`.

### `horses` / `products` / `services` / `clubs`
All use **`country_code`** (and 001 marketplace shapes). Products/services FK to `seller_profiles`.

### `community_posts`
`author_id`, `title`, `content`, `photos`, `status`, timestamps.  
No `country` / `country_code` column in 001 (gallery form embeds country in `content` text).

## Auth trigger (001 — expected on remote; not re-probed 2026-11-07)

`handle_new_user` in `001_initial_schema.sql`:

- `SECURITY DEFINER SET search_path = ''`
- `INSERT INTO public.profiles (id, email, full_name, avatar_url)`
- Trigger `on_auth_user_created` on `auth.users`

Must remain on `public.profiles` with empty `search_path` (see `docs/KNOWN_FIXES.md`). Live presence of the trigger was **not** re-confirmed today.

## RLS on `profiles` (001 — critical for next worker)

| Policy | Definition | Risk |
|--------|------------|------|
| `profiles_select` | `USING (true)` | Public read OK |
| `profiles_update_own` | `FOR UPDATE USING (auth.uid() = id)` | **No column restriction** — client can set `role` / `is_suspended` |
| `profiles_admin` | `FOR ALL` via `is_admin_or_moderator` | Fine if role cannot be self-escalated |

App already does client-side role writes:

- `app/trainers/apply` → `role: "trainer"`
- `app/clubs/register` → `role: "club_owner"`
- `app/marketplace/new`, `SellerRegisterClient` → `role: "seller"`

Next RLS worker must tighten UPDATE (e.g. forbid self-update of `role` / `is_suspended` / `admin_notes`) and move legitimate role changes to a SECURITY DEFINER RPC or service-role path.

## Storage buckets (last-known)

- `horse-photos`, `club-assets`, `avatars`, `gallery`, `uploads` — all public

## Migration apply matrix

| Migration | Live (2026-06-17) | 2026-11-07 note |
|-----------|-------------------|-----------------|
| 001_initial_schema | Already applied | Source of truth for columns/RLS/trigger |
| 002_trust_safety | Already applied | |
| 002_seed_data | Demo data present | Do not re-seed blindly |
| 003_monetization | Already applied | |
| 003_storage_buckets_policies | Buckets exist | |
| 004_mobile_growth | Applied | |
| **004_marketplace_and_health** | **Skipped** | **DO_NOT_APPLY** — forever on this project |
| 005_enterprise_scale | Already applied | |
| 006_public_grants | Not listed in 2026-06-17 probe notes | Repo has file; **confirm grants on live before smoke** (anon SELECT + authenticated DML) |

**Do not** run blind `supabase db push` — numbering collisions (`002_*`, `003_*`, `004_*`) make CLI order unsafe. Prefer this matrix.

## Form ↔ schema drift (repo evidence, 2026-11-07)

| Surface | Writes | 001 / live expectation | Fix owner |
|---------|--------|------------------------|-----------|
| `/trainers/apply` | `slug`, `trainer_type`, `bio`, `country`, `contact_*`, `whatsapp`, `published_at` | Align to `/trainers/new` shape (`specialty`, `description`, `country_code`, `email`, `phone`); redirect by `id` | Forms worker |
| `/dashboard/profile` | reads/writes `country` | Map to `country_code` | Forms worker |
| `/community/stories/new` | `user_stories` + `country` | Insert into `community_posts` (or new migration — prefer posts for publish safety) | Forms worker |
| Role self-updates (seller/trainer/club) | `profiles.role` via client | Blocked once RLS hardened; need RPC | RLS worker |

## Known fixes (still valid)

- Signup trigger: `handle_new_user` must insert into `public.profiles` with `SET search_path = ''`
- `SUPABASE_SERVICE_ROLE_KEY` must be JWT, not URL
- Google Fonts: offline build fallback in `app/layout.tsx` if needed

## Local migration files

```
supabase/migrations/
  001_initial_schema.sql
  002_seed_data.sql
  002_trust_safety.sql
  003_monetization.sql
  003_storage_buckets_policies.sql
  004_marketplace_and_health.sql   # DO_NOT_APPLY on live DB
  004_mobile_growth.sql
  005_enterprise_scale.sql
  006_public_grants.sql            # confirm on live before public listing smoke
```
