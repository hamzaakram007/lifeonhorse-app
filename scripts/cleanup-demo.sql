-- Remove demo-tagged content before production launch
-- Adjust patterns to match your demo data conventions

DELETE FROM public.inquiries WHERE message LIKE '%[DEMO]%';
DELETE FROM public.community_posts WHERE title LIKE 'Demo %';
DELETE FROM public.blog_posts WHERE slug LIKE 'demo-%';
DELETE FROM public.health_requests WHERE issue_description LIKE '%[DEMO]%';

-- Remove demo users (profiles cascade from auth.users)
-- DELETE FROM auth.users WHERE email LIKE '%@demo.lifeonhorse.com';

-- Reset featured flags on test content
UPDATE public.horses SET is_featured = false WHERE title LIKE 'Demo %';
UPDATE public.clubs SET is_featured = false WHERE name LIKE 'Demo %';
