-- Remove demo-tagged content before production launch
-- Adjust patterns to match your demo data conventions

DELETE FROM public.inquiries WHERE message LIKE '%[DEMO]%';
DELETE FROM public.community_posts WHERE title LIKE 'Demo %';
DELETE FROM public.blog_posts WHERE slug LIKE 'demo-%';
DELETE FROM public.health_requests WHERE issue_description LIKE '%[DEMO]%';

-- One-off / reseed [DEMO] product uploads (fixed UUID batch d0e00001-…)
DELETE FROM public.products WHERE title LIKE '[DEMO]%';
DELETE FROM public.products WHERE id::text LIKE 'd0e00001-%';

-- Deduplicate accidental duplicate titles (keep oldest row)
DELETE FROM public.products p
USING public.products keep
WHERE p.title = keep.title
  AND p.ctid > keep.ctid
  AND p.title LIKE '[DEMO]%';

-- Remove demo users (profiles cascade from auth.users)
-- DELETE FROM auth.users WHERE email LIKE '%@demo.lifeonhorse.com';

-- Reset featured flags on test content
UPDATE public.horses SET is_featured = false WHERE title LIKE 'Demo %';
UPDATE public.clubs SET is_featured = false WHERE name LIKE 'Demo %';
