# Supabase State (live inspection)

Project: `ebgzqmnewtdippegphou`  
URL: https://supabase.com/dashboard/project/ebgzqmnewtdippegphou  
Inspected: 2026-06-17 (REST API probe via service role)

## Summary

The live database follows the **001_initial_schema** lineage (`seller_profiles`, `services`, `horses`, `products`).  
Migration `004_marketplace_and_health.sql` (alternate `sellers` / `marketplace_services` tables) was **not** applied remotely — app code was aligned to the live schema instead of re-running conflicting DDL.

## Tables present (verified 200 OK)

| Table | Status | Notes |
|-------|--------|-------|
| profiles | ✅ | Demo admin + seller rows |
| seller_profiles | ✅ | Used by marketplace seller flows |
| horses | ✅ | Horse marketplace |
| products | ✅ | Product marketplace |
| services | ✅ | Service marketplace |
| clubs | ✅ | |
| trainers | ✅ | |
| events | ✅ | |
| courses | ✅ | |
| blog_posts | ✅ | |
| community_posts | ✅ | Gallery uploads map here |
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

## Tables NOT on remote (app uses alternatives)

| Expected by 004 migration | Live alternative |
|---------------------------|------------------|
| sellers | seller_profiles |
| marketplace_services | services |
| horse_listings | horses |
| horse_gallery | community_posts (gallery form) |

## Storage buckets

- `horse-photos`, `club-assets`, `avatars`, `gallery`, `uploads` — all public

## Migration apply strategy (completed)

| Migration | Action |
|-----------|--------|
| 001_initial_schema | Already applied (core tables exist) |
| 002_trust_safety | Already applied (reports, verification_documents, audit_log) |
| 002_seed_data | Demo data present |
| 003_monetization | Already applied (billing_plans, orders, commission_records) |
| 003_storage_buckets_policies | Buckets exist |
| 004_mobile_growth | Applied (newsletter, PWA-related tables) |
| 004_marketplace_and_health | **Skipped** — conflicts with live schema; app aligned instead |
| 005_enterprise_scale | Already applied (analytics_counts, rate_limits, subscriptions) |

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
  004_marketplace_and_health.sql   # alternate schema — do not apply on live DB
  004_mobile_growth.sql
  005_enterprise_scale.sql
```
