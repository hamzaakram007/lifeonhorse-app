-- Demo seller journal stories (safe local covers under /images/blog).
-- Requires migrations 008_blog_entity_links.sql and 013_blog_seller_entity_rls.sql.
-- Idempotent on slug. Uses existing published seller_profiles + a profile author.

WITH author AS (
  SELECT p.id
  FROM public.profiles p
  ORDER BY CASE WHEN p.role IN ('admin', 'seller') THEN 0 ELSE 1 END, p.created_at
  LIMIT 1
),
seller_rows AS (
  SELECT s.id, s.business_name, s.user_id, row_number() OVER (ORDER BY s.is_verified DESC, s.created_at) AS rn
  FROM public.seller_profiles s
  WHERE s.status = 'published'
  LIMIT 2
),
payload AS (
  SELECT * FROM (
    VALUES
      (
        1,
        'demo-seller-new-arrivals-v1',
        'New arrivals this week',
        'Fresh tack and barn essentials just stocked.',
        'We unpacked bridles, grooming kits, and a few show-ready pads. Stop by the shop journal for photos and sizing notes before they sell through.',
        'seller_stories',
        '/images/blog/blog-saddle-choice.jpg'
      ),
      (
        2,
        'demo-seller-care-guide-v1',
        'Leather care between seasons',
        'A short guide for keeping tack soft and safe.',
        'Wipe sweat after each ride, condition lightly once a month, and store out of direct sun. Replace stitching before it frays — small habits keep equipment lasting longer.',
        'seller_stories',
        '/images/blog/blog-feeding-hot.jpg'
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
  COALESCE(s.user_id, a.id),
  p.title,
  p.slug,
  p.excerpt,
  p.content,
  p.category,
  p.cover_image,
  'seller',
  s.id,
  'published',
  now() - (p.rn || ' hours')::interval
FROM payload p
JOIN seller_rows s ON s.rn = p.rn
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
