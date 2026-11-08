-- Demo trainer tips + course notes (safe local covers under /images/blog).
-- Requires migrations 008_blog_entity_links.sql and 010_blog_trainer_course_links.sql.
-- Idempotent on slug. Uses existing published trainers/courses + a profile author.

WITH author AS (
  SELECT p.id
  FROM public.profiles p
  ORDER BY CASE WHEN p.role IN ('admin', 'trainer', 'course_creator') THEN 0 ELSE 1 END, p.created_at
  LIMIT 1
),
trainer_rows AS (
  SELECT t.id, t.display_name, t.user_id, row_number() OVER (ORDER BY t.is_featured DESC, t.created_at) AS rn
  FROM public.trainers t
  WHERE t.status = 'published'
  LIMIT 2
),
course_rows AS (
  SELECT c.id, c.title, c.creator_id, row_number() OVER (ORDER BY c.is_featured DESC, c.created_at) AS rn
  FROM public.courses c
  WHERE c.status = 'published'
  LIMIT 2
),
payload AS (
  SELECT * FROM (
    VALUES
      (
        'trainer'::text,
        1,
        'demo-trainer-flatwork-warmup',
        'Flatwork warm-up that sticks',
        'A short warm-up sequence before collected work.',
        'Start with free walk, add two circles each rein, then a few transitions before asking for lengthening. Keep the horse soft in the jaw and forward from the leg.',
        'trainer_tips',
        '/images/blog/blog-dressage-grand-prix.jpg'
      ),
      (
        'trainer',
        2,
        'demo-trainer-pole-spacing',
        'Pole spacing for young horses',
        'Safer ground-pole distances when introducing rhythm.',
        'Use generous distances at first and walk the line yourself. Raise expectations only when the horse stays calm and regular. Film a few strides to check from the side.',
        'trainer_tips',
        '/images/blog/blog-horse-show-prep.jpg'
      ),
      (
        'course',
        1,
        'demo-course-lesson-two-live',
        'Lesson two is live',
        'New lesson outline and practice checklist.',
        'Lesson two covers balance and straightness. Download the checklist, film one short clip of your homework, and bring questions to the next clinic.',
        'course_updates',
        '/images/blog/blog-feeding-hot.jpg'
      ),
      (
        'course',
        2,
        'demo-course-schedule-note',
        'Schedule note for this cohort',
        'Office hours move to Thursday evenings this month.',
        'Office hours shift to Thursday 18:00–19:00 local. Replay links stay in the lesson list. Message the creator if you need an alternate slot.',
        'course_updates',
        '/images/blog/blog-saddle-choice.jpg'
      )
  ) AS v(kind, rn, slug, title, excerpt, content, category, cover_image)
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
  COALESCE(
    CASE
      WHEN p.kind = 'trainer' THEN tr.user_id
      WHEN p.kind = 'course' THEN cr.creator_id
    END,
    a.id
  ),
  p.title,
  p.slug,
  p.excerpt,
  p.content,
  p.category,
  p.cover_image,
  p.kind,
  CASE
    WHEN p.kind = 'trainer' THEN tr.id
    WHEN p.kind = 'course' THEN cr.id
  END,
  'published',
  now()
FROM payload p
CROSS JOIN author a
LEFT JOIN trainer_rows tr ON p.kind = 'trainer' AND tr.rn = p.rn
LEFT JOIN course_rows cr ON p.kind = 'course' AND cr.rn = p.rn
WHERE (p.kind = 'trainer' AND tr.id IS NOT NULL)
   OR (p.kind = 'course' AND cr.id IS NOT NULL)
ON CONFLICT (slug) DO NOTHING;
