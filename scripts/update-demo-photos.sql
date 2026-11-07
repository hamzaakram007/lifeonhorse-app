-- One-shot: point demo listing imagery at owned local equestrian assets.
-- Run in Supabase SQL editor, or: npm run seed:photos
-- Safe to re-run. Does not invent remote Unsplash URLs.

-- Clubs (logo + photos)
UPDATE clubs SET
  logo_url = '/images/demo/club-polo.jpg',
  photos = '["/images/demo/club-polo.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444401';

UPDATE clubs SET
  logo_url = '/images/demo/club-tent.jpg',
  photos = '["/images/demo/club-tent.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444402';

UPDATE clubs SET
  logo_url = '/images/demo/club-riding.jpg',
  photos = '["/images/demo/club-riding.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444403';

UPDATE clubs SET
  logo_url = '/images/demo/club-sports.jpg',
  photos = '["/images/demo/club-sports.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444404';

UPDATE clubs SET
  logo_url = '/images/demo/club-community.jpg',
  photos = '["/images/demo/club-community.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444405';

UPDATE clubs SET
  logo_url = '/images/demo/club-cape.jpg',
  photos = '["/images/demo/club-cape.jpg"]'::jsonb
WHERE id = 'de6c35f5-ce68-4f27-abd5-c61338ddcc61';

UPDATE clubs SET
  logo_url = '/images/demo/club-rescue.jpg',
  photos = '["/images/demo/club-rescue.jpg"]'::jsonb
WHERE id = 'd4444444-4444-4444-8444-444444444406';

-- Trainers (unique covers + strip specialty from display names)
UPDATE trainers SET photos = '["/images/demo/trainer-dressage.jpg"]'::jsonb, display_name = 'Sarah Mitchell'
WHERE id = 'd5555555-5555-4555-8555-555555555501';
UPDATE trainers SET photos = '["/images/demo/trainer-polo.jpg"]'::jsonb, display_name = 'Carlos Mendez'
WHERE id = 'd5555555-5555-4555-8555-555555555502';
UPDATE trainers SET photos = '["/images/demo/trainer-tent.jpg"]'::jsonb, display_name = 'Hassan Raza'
WHERE id = 'd5555555-5555-4555-8555-555555555503';
UPDATE trainers SET photos = '["/images/demo/trainer-vet.jpg"]'::jsonb, display_name = 'Dr. James Whitfield'
WHERE id = 'd5555555-5555-4555-8555-555555555504';
UPDATE trainers SET photos = '["/images/demo/trainer-arabian.jpg"]'::jsonb, display_name = 'Aisha Khan'
WHERE id = 'd5555555-5555-4555-8555-555555555505';
UPDATE trainers SET photos = '["/images/demo/trainer-eventing.jpg"]'::jsonb, display_name = 'Emma Rodriguez'
WHERE id = 'd5555555-5555-4555-8555-555555555506';

-- Events
UPDATE events SET photos = '["/images/demo/event-polo.jpg"]'::jsonb WHERE id = 'd8888888-8888-4888-8888-888888888801';
UPDATE events SET photos = '["/images/demo/event-tent.jpg"]'::jsonb WHERE id = 'd8888888-8888-4888-8888-888888888802';
UPDATE events SET photos = '["/images/demo/event-clinic.jpg"]'::jsonb WHERE id = 'd8888888-8888-4888-8888-888888888803';
UPDATE events SET photos = '["/images/demo/event-auction.jpg"]'::jsonb WHERE id = 'd8888888-8888-4888-8888-888888888804';
UPDATE events SET photos = '["/images/demo/event-trail.jpg"]'::jsonb WHERE id = 'd8888888-8888-4888-8888-888888888805';
UPDATE events SET photos = '["/images/demo/event-health.jpg"]'::jsonb WHERE id = 'd8888888-8888-4888-8888-888888888806';

-- Courses
UPDATE courses SET cover_image = '/images/demo/course-dressage.jpg' WHERE id = 'd9999999-9999-4999-8999-999999999901';
UPDATE courses SET cover_image = '/images/demo/course-arabian.jpg' WHERE id = 'd9999999-9999-4999-8999-999999999902';
UPDATE courses SET cover_image = '/images/demo/course-firstaid.jpg' WHERE id = 'd9999999-9999-4999-8999-999999999903';
UPDATE courses SET cover_image = '/images/demo/course-polo.jpg' WHERE id = 'd9999999-9999-4999-8999-999999999904';
UPDATE courses SET cover_image = '/images/demo/course-nutrition.jpg' WHERE id = 'd9999999-9999-4999-8999-999999999905';
UPDATE courses SET cover_image = '/images/demo/course-tent.jpg' WHERE id = 'd9999999-9999-4999-8999-999999999906';

-- Broad cleanup: replace known bad Unsplash / picsum leftovers with local fallbacks
UPDATE clubs
SET logo_url = '/images/fallback-empty.jpg',
    photos = '["/images/fallback-empty.jpg"]'::jsonb
WHERE logo_url ILIKE '%unsplash%'
   OR logo_url ILIKE '%picsum%'
   OR photos::text ILIKE '%unsplash%'
   OR photos::text ILIKE '%picsum%';

UPDATE trainers
SET photos = '["/images/fallback-empty.jpg"]'::jsonb
WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%';

UPDATE events
SET photos = '["/images/fallback-empty.jpg"]'::jsonb
WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%';

UPDATE courses
SET cover_image = '/images/fallback-empty.jpg'
WHERE cover_image ILIKE '%unsplash%' OR cover_image ILIKE '%picsum%';
