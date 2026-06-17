# Staging Smoke Test Checklist

Use this checklist before promoting to production.

## Environment
- [ ] `.env.local` has valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is the real JWT (not a URL)
- [ ] `/api/health` returns `{ "status": "ok" }`

## Auth
- [ ] Sign up creates profile via `handle_new_user` trigger
- [ ] Login / logout works
- [ ] Suspended users cannot access dashboard

## Public modules
- [ ] Homepage loads featured content
- [ ] Marketplace tabs: horses, products, services, sellers
- [ ] Clubs, trainers, events, courses, blog, community list pages
- [ ] Horse Health page shows emergency disclaimer
- [ ] Country page `/countries/PK` loads
- [ ] Legal pages accessible from footer

## User flows
- [ ] Create horse listing with multi-photo upload
- [ ] Submit inquiry → appears in `/dashboard/inquiries`
- [ ] Save favorite → appears in `/dashboard/favorites`
- [ ] Health request with disclaimer + optional video upload
- [ ] Verification document upload on seller/expert dashboard

## Admin
- [ ] Promote user to admin via SQL
- [ ] Admin dashboard analytics cards load
- [ ] Reports queue resolve/dismiss
- [ ] Suspend/unsuspend user
- [ ] Health request admin notes save
- [ ] Billing orders and commissions visible

## Trust & safety
- [ ] Rate limit blocks excessive health submissions
- [ ] Verified badges display on profiles

## Deploy
- [ ] `npm run build` succeeds
- [ ] Vercel preview deploy works
- [ ] PWA manifest loads (`/manifest.json`)
