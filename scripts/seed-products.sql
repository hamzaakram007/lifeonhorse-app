-- LifeOnHorse demo products seed (001 lineage: seller_profiles + products.photos jsonb)
-- Project: ebgzqmnewtdippegphou
-- Safe to re-run. Requires seller_profiles rows from the professional demo seed.
-- Apply via Supabase SQL editor or:
--   SUPABASE_ACCESS_TOKEN=… npm run seed:products

-- Drop one-off [DEMO]-prefixed uploads so reseed never stacks duplicates
-- (professional catalog below uses fixed d6666666-… UUIDs + ON CONFLICT)
DELETE FROM public.products WHERE title LIKE '[DEMO]%';
DELETE FROM public.products WHERE id::text LIKE 'd0e00001-%';

-- Remap existing live product photos to owned local assets
UPDATE public.products SET photos = '["/images/demo/product-saddle.jpg"]'::jsonb
WHERE id IN (
  'd6666666-6666-4666-8666-666666666601',
  'd4444444-4444-4444-8444-444444444401',
  '1b3a56cd-2c05-4263-b289-2e8885181efb',
  'd6666666-6666-4666-8666-666666666614'
);

UPDATE public.products SET photos = '["/images/demo/product-mallet.jpg"]'::jsonb
WHERE id IN (
  'd6666666-6666-4666-8666-666666666602',
  'd4444444-4444-4444-8444-444444444402'
);

UPDATE public.products SET photos = '["/images/demo/product-feed.jpg"]'::jsonb
WHERE id IN (
  'd6666666-6666-4666-8666-666666666603',
  'd6666666-6666-4666-8666-666666666607',
  '07cdf22c-2979-461c-a60b-316d3e5678e0',
  '6057c5f1-c1ab-43b7-aa11-c6279d3d1490',
  'd6666666-6666-4666-8666-666666666616'
);

UPDATE public.products SET photos = '["/images/demo/product-supplement.jpg"]'::jsonb
WHERE id IN (
  'd6666666-6666-4666-8666-666666666604',
  'd4444444-4444-4444-8444-444444444405'
);

UPDATE public.products SET photos = '["/images/demo/product-apparel.jpg"]'::jsonb
WHERE id = 'd6666666-6666-4666-8666-666666666605';

UPDATE public.products SET photos = '["/images/demo/product-helmet.jpg"]'::jsonb
WHERE id IN (
  'd6666666-6666-4666-8666-666666666606',
  'd4444444-4444-4444-8444-444444444404',
  '6a30c8da-4461-4fcf-8ab8-9384339d3434',
  'd6666666-6666-4666-8666-666666666615'
);

UPDATE public.products SET photos = '["/images/demo/product-boots.jpg"]'::jsonb
WHERE id = 'd6666666-6666-4666-8666-666666666608';

UPDATE public.products SET photos = '["/images/demo/product-bridle.jpg"]'::jsonb
WHERE id IN (
  'f054f4ec-c4ff-40bd-af9f-cd484d026869',
  'd6666666-6666-4666-8666-666666666609'
);

UPDATE public.products SET photos = '["/images/demo/product-grooming.jpg"]'::jsonb
WHERE id IN (
  'd4444444-4444-4444-8444-444444444403',
  'c120f3c2-b0bc-4a3f-a0bb-8dcf77bd4f37',
  'd6666666-6666-4666-8666-666666666611'
);

UPDATE public.products SET photos = '["/images/demo/product-hoof.jpg"]'::jsonb
WHERE id IN (
  'd4444444-4444-4444-8444-444444444406',
  'd6666666-6666-4666-8666-666666666613'
);

UPDATE public.products SET photos = '["/images/demo/product-blanket.jpg"]'::jsonb
WHERE id IN (
  'd4444444-4444-4444-8444-444444444407',
  'd6666666-6666-4666-8666-666666666610'
);

UPDATE public.products SET photos = '["/images/demo/product-stable-mat.jpg"]'::jsonb
WHERE id IN (
  'd4444444-4444-4444-8444-444444444408',
  'd6666666-6666-4666-8666-666666666612'
);

-- Sweep any remaining Unsplash / Picsum product photos
UPDATE public.products
SET photos = '["/images/demo/product-1.jpg"]'::jsonb
WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%';

-- Upsert expanded demo catalog (fixed UUIDs from scripts/demo-constants.mjs)
INSERT INTO public.products (
  id, seller_id, title, description, price, currency, category, country_code, photos, is_featured, status
) VALUES
  ('d6666666-6666-4666-8666-666666666601', 'd3333333-3333-4333-8333-333333333301',
   'Hand-Stitched Dressage Saddle',
   'Premium German leather dressage saddle, 17.5" seat. Excellent condition — lightly used at shows only.',
   4500, 'USD', 'tack', 'PK', '["/images/demo/product-saddle.jpg","/images/demo/product-1.jpg"]'::jsonb, true, 'published'),
  ('d6666666-6666-4666-8666-666666666602', 'd3333333-3333-4333-8333-333333333301',
   'Polo Mallet Set — Pro Grade',
   'Set of 4 professional polo mallets with carbon shafts. Match-ready grip wrap.',
   890, 'USD', 'tack', 'PK', '["/images/demo/product-mallet.jpg"]'::jsonb, true, 'published'),
  ('d6666666-6666-4666-8666-666666666603', 'd3333333-3333-4333-8333-333333333302',
   'Premium Alfalfa Cubes — 25kg',
   'High-protein alfalfa cubes for sport horses. New sealed bag.',
   45, 'USD', 'feed', 'IN', '["/images/demo/product-feed.jpg"]'::jsonb, false, 'published'),
  ('d6666666-6666-4666-8666-666666666604', 'd3333333-3333-4333-8333-333333333302',
   'Electrolyte Supplement — 5kg',
   'Competition-grade electrolyte for hot climates. Tub with scoop included.',
   120, 'USD', 'feed', 'IN', '["/images/demo/product-supplement.jpg"]'::jsonb, false, 'published'),
  ('d6666666-6666-4666-8666-666666666605', 'd3333333-3333-4333-8333-333333333305',
   'Royal Polo Club Blazer',
   'Official club blazer with embroidered crest. Size 42R, like-new.',
   350, 'USD', 'apparel', 'AR', '["/images/demo/product-apparel.jpg"]'::jsonb, true, 'published'),
  ('d6666666-6666-4666-8666-666666666606', 'd3333333-3333-4333-8333-333333333301',
   'Safety Riding Helmet — ASTM',
   'Certified helmet with ventilation and adjustable fit. New in box.',
   280, 'USD', 'tack', 'PK', '["/images/demo/product-helmet.jpg"]'::jsonb, false, 'published'),
  ('d6666666-6666-4666-8666-666666666607', 'd3333333-3333-4333-8333-333333333302',
   'Mineral Salt Block — 20kg',
   'Essential minerals for pasture horses. Weather-resistant block.',
   35, 'USD', 'feed', 'IN', '["/images/demo/product-feed.jpg"]'::jsonb, false, 'published'),
  ('d6666666-6666-4666-8666-666666666608', 'd3333333-3333-4333-8333-333333333305',
   'Leather Polo Boots — Pair',
   'Hand-crafted polo boots with reinforced protection. Size 42, good used condition.',
   520, 'USD', 'tack', 'AR', '["/images/demo/product-boots.jpg"]'::jsonb, true, 'published'),
  ('d6666666-6666-4666-8666-666666666609', 'd3333333-3333-4333-8333-333333333301',
   'Swedish Leather Bridle with Reins',
   'Anatomic flash bridle, soft leather, includes laced reins. Nearly new.',
   185, 'USD', 'tack', 'PK', '["/images/demo/product-bridle.jpg"]'::jsonb, true, 'published'),
  ('d6666666-6666-4666-8666-666666666610', 'd3333333-3333-4333-8333-333333333301',
   'Turnout Blanket — Waterproof',
   '200g fill turnout rug with shoulder gussets. Size 6''3", lightly used.',
   160, 'USD', 'apparel', 'PK', '["/images/demo/product-blanket.jpg"]'::jsonb, false, 'published'),
  ('d6666666-6666-4666-8666-666666666611', 'd3333333-3333-4333-8333-333333333303',
   'Deluxe Grooming Tote',
   'Eight-piece grooming set — body brush, curry, hoof pick, mane comb, and tote.',
   75, 'USD', 'grooming', 'PK', '["/images/demo/product-grooming.jpg"]'::jsonb, false, 'published'),
  ('d6666666-6666-4666-8666-666666666612', 'd3333333-3333-4333-8333-333333333305',
   'Interlocking Stall Mats — 4 Pack',
   'Heavy-duty rubber stall mats, 4× interlocking tiles for a standard box.',
   320, 'USD', 'stable', 'AR', '["/images/demo/product-stable-mat.jpg"]'::jsonb, true, 'published'),
  ('d6666666-6666-4666-8666-666666666613', 'd3333333-3333-4333-8333-333333333302',
   'Farrier Hoof Care Bundle',
   'Hoof oil, pick, and brush kit for weekly maintenance. New sealed.',
   48, 'USD', 'grooming', 'IN', '["/images/demo/product-hoof.jpg"]'::jsonb, false, 'published'),
  ('d6666666-6666-4666-8666-666666666614', 'd3333333-3333-4333-8333-333333333303',
   'Western Trail Saddle — Used',
   'Comfortable trail saddle, 16" seat. Honest wear on fenders; tree sound.',
   695, 'USD', 'tack', 'PK', '["/images/demo/product-saddle.jpg"]'::jsonb, false, 'published'),
  ('d6666666-6666-4666-8666-666666666615', 'd3333333-3333-4333-8333-333333333301',
   'Vented Jumping Helmet',
   'Lightweight ventilated helmet for arena and XC schooling. ASTM/SEI.',
   210, 'USD', 'tack', 'PK', '["/images/demo/product-helmet.jpg"]'::jsonb, false, 'published'),
  ('d6666666-6666-4666-8666-666666666616', 'd3333333-3333-4333-8333-333333333302',
   'Timothy Hay Nets — Pair',
   'Slow-feed hay nets, large mesh. Pair for two stalls. New.',
   28, 'USD', 'feed', 'IN', '["/images/demo/product-feed.jpg"]'::jsonb, false, 'published')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  category = EXCLUDED.category,
  country_code = EXCLUDED.country_code,
  photos = EXCLUDED.photos,
  is_featured = EXCLUDED.is_featured,
  status = 'published',
  updated_at = now();

-- Normalize legacy category slugs toward PRODUCT_CATEGORIES
UPDATE public.products SET category = 'tack'
WHERE category IN ('saddles', 'bridles', 'helmets', 'equipment', 'polo', 'safety') AND status = 'published';
UPDATE public.products SET category = 'apparel'
WHERE category IN ('blankets') AND status = 'published';
UPDATE public.products SET category = 'grooming'
WHERE category IN ('health') AND status = 'published';
UPDATE public.products SET category = 'feed'
WHERE category IN ('supplements', 'salt_blocks') AND status = 'published';

-- Safety: collapse any remaining exact-title duplicates among seed UUID prefixes
DELETE FROM public.products p
USING public.products keep
WHERE p.title = keep.title
  AND p.id > keep.id
  AND (
    p.id::text LIKE 'd6666666-%'
    OR p.id::text LIKE 'd4444444-%'
    OR p.id::text LIKE 'd0e00001-%'
    OR keep.id::text LIKE 'd6666666-%'
    OR keep.id::text LIKE 'd4444444-%'
    OR keep.id::text LIKE 'd0e00001-%'
  );
