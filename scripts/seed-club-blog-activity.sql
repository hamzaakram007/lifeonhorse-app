-- Demo club Journal updates (safe local covers under /images/blog).
-- Requires migration 008_blog_entity_links.sql applied.
-- Idempotent on slug. Uses existing published clubs + a profile author.

WITH author AS (
  SELECT p.id
  FROM public.profiles p
  ORDER BY CASE WHEN p.role IN ('admin', 'club_owner') THEN 0 ELSE 1 END, p.created_at
  LIMIT 1
),
club_rows AS (
  SELECT c.id, c.name, c.owner_id, row_number() OVER (ORDER BY c.is_featured DESC, c.created_at) AS rn
  FROM public.clubs c
  WHERE c.status = 'published'
  LIMIT 3
),
payload AS (
  SELECT * FROM (
    VALUES
      (
        1,
        'demo-club-spring-arena-open',
        'Spring arena open days',
        'Members weekends reopen with schooling slots and guest tickets.',
        'We are opening weekday and weekend schooling slots through the end of the month. Guest riders welcome with advance booking. Bring your own groom or request yard support at the office.',
        '/images/blog/blog-horse-show-prep.jpg'
      ),
      (
        2,
        'demo-club-polo-clinic-recap',
        'Polo clinic recap',
        'Stick-and-ball notes from last Saturday’s intro clinic.',
        'Thank you to everyone who joined the intro clinic. Next session focuses on mallet safety and short chukkas. Photos and booking links are at the club desk.',
        '/images/blog/blog-polo-training.jpg'
      ),
      (
        3,
        'demo-club-yard-care-update',
        'Yard care update',
        'Farrier rotation and summer hydration reminders for boarders.',
        'Farrier days move to Tuesdays this season. Please update shoeing notes with the yard manager. Hydration kits are available at the tack room for hot afternoons.',
        '/images/blog/blog-polo-care.jpg'
      )
  ) AS v(rn, slug, title, excerpt, content, cover_image)
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
  is_featured,
  published_at
)
SELECT
  COALESCE(c.owner_id, a.id),
  p.title,
  p.slug,
  p.excerpt,
  p.content,
  'club_activity',
  p.cover_image,
  'club',
  c.id,
  'published',
  false,
  now()
FROM payload p
JOIN club_rows c ON c.rn = p.rn
CROSS JOIN author a
WHERE NOT EXISTS (
  SELECT 1 FROM public.blog_posts bp WHERE bp.slug = p.slug
);
