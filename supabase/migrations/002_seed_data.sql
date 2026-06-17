-- Demo seed data (run after creating an admin user in Supabase Auth)
-- Replace ADMIN_USER_ID with your admin user's UUID after signup

-- Blog categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Breeds & Care', 'breeds-care', 'Horse breeds, health, and daily care'),
  ('Training', 'training', 'Riding, polo, and discipline training'),
  ('Marketplace Safety', 'marketplace-safety', 'Buying and selling horses safely'),
  ('Club Guides', 'club-guides', 'Starting and running horse clubs'),
  ('Country Culture', 'country-culture', 'Horse culture across launch regions')
ON CONFLICT DO NOTHING;

-- Badges
INSERT INTO badges (name, slug, description, icon) VALUES
  ('Early Contributor', 'early-contributor', 'Joined during launch period', 'star'),
  ('Verified Seller', 'verified-seller', 'Verified marketplace seller', 'shield'),
  ('Club Founder', 'club-founder', 'Registered a horse club', 'users'),
  ('Community Storyteller', 'storyteller', 'Shared a user story', 'book')
ON CONFLICT DO NOTHING;

-- Note: Horse/club/trainer/event/blog seed rows require real profile UUIDs.
-- Use scripts/seed-demo.ts after admin signup, or insert via Supabase SQL editor
-- with your user IDs. Sample slugs for reference:

-- Example horse slugs: majestic-arabian-lahore, thoroughbred-cape-town
-- Example club slugs: lahore-polo-club, istanbul-riding-academy
-- Example trainer slugs: ahmed-polo-coach, priya-riding-instructor
