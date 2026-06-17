# Feature Inventory

## Routes restored (20)

- `/blog/:id`
- `/blog/new`
- `/clubs/:id`
- `/community/:id`
- `/community/new`
- `/countries`
- `/courses/:id`
- `/courses/new`
- `/events/:id`
- `/events/new`
- `/health/experts/:id`
- `/health/experts/new`
- `/legal/terms`
- `/marketplace/products/:id`
- `/marketplace/sellers/:id`
- `/marketplace/services/:id`
- `/payments`
- `/support`
- `/trainers/:id`
- `/trainers/new`

## Database tables (30)

- `audit_log`
- `billing_plans`
- `blog_posts`
- `clubs`
- `commission_records`
- `community_posts`
- `countries`
- `courses`
- `events`
- `experts`
- `favorites`
- `featured_listing_requests`
- `health_requests`
- `horses`
- `inquiries`
- `inquiry_notifications`
- `marketplace_services`
- `newsletter_subscribers`
- `orders`
- `products`
- `profiles`
- `rate_limits`
- `reports`
- `reviews`
- `seller_profiles`
- `sellers`
- `services`
- `subscriptions`
- `trainers`
- `verification_documents`

## Components (4)

- `components/Footer.tsx`
- `components/Header.tsx`
- `components/ReviewsSection.tsx`
- `components/ui.tsx`

## Migration files

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_seed_data.sql`
- `supabase/migrations/003_storage_buckets_policies.sql`
- `supabase/migrations/002_trust_safety.sql`
- `supabase/migrations/003_monetization.sql`
- `supabase/migrations/004_mobile_growth.sql`
- `supabase/migrations/005_enterprise_scale.sql`
- `supabase/migrations/004_marketplace_and_health.sql`

## Scripts

- `scripts/demo-constants.mjs`
- `scripts/seed-demo.mjs`
- `scripts/cleanup-demo.sql`
- `scripts/cleanup-demo.mjs`
- `scripts/seed-demo.sql`
- `scripts/scaffold.js`
- `scripts/scaffold-auth.js`
- `scripts/scaffold-modules.js`
- `scripts/scaffold-detail.js`
- `scripts/scaffold-admin.js`
- `scripts/scaffold-forms.js`
