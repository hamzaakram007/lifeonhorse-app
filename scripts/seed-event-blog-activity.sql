-- Demo event Journal updates (safe local covers under /images/blog).
-- Requires migrations 008_blog_entity_links.sql and 011_blog_event_entity_rls.sql.
-- Idempotent on slug. Uses existing published events + a profile author.

WITH author AS (
  SELECT p.id
  FROM public.profiles p
  ORDER BY CASE WHEN p.role IN ('admin', 'club_owner') THEN 0 ELSE 1 END, p.created_at
  LIMIT 1
),
event_rows AS (
  SELECT e.id, e.title, e.host_id, row_number() OVER (ORDER BY e.is_featured DESC, e.start_date NULLS LAST, e.created_at) AS rn
  FROM public.events e
  WHERE e.status = 'published'
  LIMIT 2
),
payload AS (
  SELECT * FROM (
    VALUES
      (
        1,
        'demo-event-entries-open-v1',
        'Entries are open',
        'Schedule, stabling notes, and how to reserve a slot.',
        'Online entries are open through next Friday. Confirm your division, stabling nights, and emergency contact in the host form. Day-sheet drafts post 48 hours before the first class.',
        'event_updates',
        '/images/blog/blog-horse-show-prep.jpg'
      ),
      (
        2,
        'demo-event-travel-day-v1',
        'Travel-day checklist',
        'What to pack and when gates open for competitors.',
        'Gates open at 06:30. Bring passport/ID for the horse, water buckets, and a spare girth. Farrier support is on site from 07:00. Message the host desk if you need a late arrival window.',
        'event_updates',
        '/images/blog/blog-kentucky-horse-country.jpg'
      )
  ) AS v(rn, slug, title, excerpt, content, category, cover_image)
)
INSERT INTO public.blog_posts (
  author_id,
  title,
  slug,
  excerpt,
  content,
  category,
  cover_image,
  linked_entity_type,
  linked_entity_id,
  status,
  published_at
)
SELECT
  COALESCE(e.host_id, a.id),
  p.title,
  p.slug,
  p.excerpt,
  p.content,
  p.category,
  p.cover_image,
  'event',
  e.id,
  'published',
  now() - (p.rn || ' hours')::interval
FROM payload p
JOIN event_rows e ON e.rn = p.rn
CROSS JOIN author a
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  cover_image = EXCLUDED.cover_image,
  linked_entity_type = EXCLUDED.linked_entity_type,
  linked_entity_id = EXCLUDED.linked_entity_id,
  status = 'published',
  published_at = COALESCE(public.blog_posts.published_at, EXCLUDED.published_at);
