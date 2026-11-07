-- One-shot: fix club covers, types, and hide near-duplicate orphan rows.
-- Project: ebgzqmnewtdippegphou
-- Run in Supabase SQL editor, or via scripts/update-demo-photos.mjs (npm run seed:photos)
-- Safe to re-run. Does not invent remote Unsplash URLs.

-- Canonical demo clubs
UPDATE clubs SET logo_url = '/images/demo/club-polo.jpg', photos = '["/images/demo/club-polo.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444401';

UPDATE clubs SET logo_url = '/images/demo/club-tent.jpg', photos = '["/images/demo/club-tent.jpg"]'::jsonb, club_type = 'tent_pegging'
WHERE id = 'd4444444-4444-4444-8444-444444444402';

UPDATE clubs SET logo_url = '/images/demo/club-riding.jpg', photos = '["/images/demo/club-riding.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444403';

UPDATE clubs SET logo_url = '/images/demo/club-sports.jpg', photos = '["/images/demo/club-sports.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444404';

UPDATE clubs SET logo_url = '/images/demo/club-community.jpg', photos = '["/images/demo/club-community.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444405';

UPDATE clubs SET logo_url = '/images/demo/club-rescue.jpg', photos = '["/images/demo/club-rescue.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444406';

-- Extra live clubs with unique identities
UPDATE clubs SET logo_url = '/images/demo/club-1.jpg', photos = '["/images/demo/club-1.jpg"]'::jsonb
WHERE id = '544cb6be-4210-4c81-8427-c6887f13ebbe';

UPDATE clubs SET logo_url = '/images/demo/club-cape.jpg', photos = '["/images/demo/club-cape.jpg"]'::jsonb
WHERE id = 'de6c35f5-ce68-4f27-abd5-c61338ddcc61';

UPDATE clubs SET logo_url = '/images/sections/clubs.jpg', photos = '["/images/sections/clubs.jpg"]'::jsonb
WHERE id = '7be1fb42-2b01-4316-84e2-7511f84d4eeb';

UPDATE clubs SET logo_url = '/images/demo/club-mumbai.jpg', photos = '["/images/demo/club-mumbai.jpg"]'::jsonb
WHERE id = '633c9b47-ccae-4053-b16d-503923513e20';

UPDATE clubs SET logo_url = '/images/demo/club-hanover.jpg', photos = '["/images/demo/club-hanover.jpg"]'::jsonb
WHERE id = 'd6666666-6666-4666-8666-666666666604';

UPDATE clubs SET logo_url = '/images/demo/club-breeding.jpg', photos = '["/images/demo/club-breeding.jpg"]'::jsonb
WHERE id = 'd6666666-6666-4666-8666-666666666606';

-- Hide near-duplicate orphan rows (product UUID collisions)
UPDATE clubs SET status = 'hidden'
WHERE id IN (
  'd6666666-6666-4666-8666-666666666601',
  'd6666666-6666-4666-8666-666666666602',
  'd6666666-6666-4666-8666-666666666603',
  'd6666666-6666-4666-8666-666666666605'
);

-- Sweep Unsplash / Picsum leftovers on clubs
UPDATE clubs
SET logo_url = '/images/fallback-empty.jpg',
    photos = '["/images/fallback-empty.jpg"]'::jsonb
WHERE logo_url ILIKE '%unsplash%'
   OR logo_url ILIKE '%picsum%'
   OR photos::text ILIKE '%unsplash%'
   OR photos::text ILIKE '%picsum%';
