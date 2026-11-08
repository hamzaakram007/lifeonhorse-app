-- Remap expert photos to owned local /images/demo/expert-* assets.
-- Safe to re-run. Prefer scripts/update-expert-photos.mjs when credentials are available.

UPDATE experts SET photos = '["/images/demo/expert-vet.jpg"]'::jsonb
WHERE id = 'dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01' OR display_name = 'Dr. James Whitfield';

UPDATE experts SET photos = '["/images/demo/expert-dressage.jpg"]'::jsonb
WHERE id = 'dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02' OR display_name = 'Sarah Mitchell';

UPDATE experts SET photos = '["/images/demo/expert-nutrition.jpg"]'::jsonb
WHERE id = 'dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb03' OR display_name = 'Dr. Priya Sharma';

UPDATE experts SET photos = '["/images/demo/expert-farrier.jpg"]'::jsonb
WHERE id = 'dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb04' OR display_name = 'Ahmed Farooq';

UPDATE experts SET photos = '["/images/demo/expert-dental.jpg"]'::jsonb
WHERE id = 'dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb05' OR display_name = 'Dr. Maria Santos';

UPDATE experts SET photos = '["/images/demo/expert-reproduction.jpg"]'::jsonb
WHERE id = 'dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb06' OR display_name = 'Dr. Khalid Al-Rashid';

UPDATE experts SET photos = '["/images/demo/expert-clinic.jpg"]'::jsonb
WHERE display_name = 'Dr. Sana Malik';

UPDATE experts SET photos = '["/images/demo/expert-rehab.jpg"]'::jsonb
WHERE display_name = 'Dr. Mark Hughes';

UPDATE experts SET photos = '["/images/demo/expert-lameness.jpg"]'::jsonb
WHERE display_name = 'Dr. Elena Rossi';

UPDATE experts SET photos = '["/images/demo/expert-behavior.jpg"]'::jsonb
WHERE display_name = 'Dr. Sofia Ahmed';

UPDATE experts
SET photos = '["/images/fallback-empty.jpg"]'::jsonb
WHERE photos::text ILIKE '%unsplash%'
   OR photos::text ILIKE '%picsum%';
