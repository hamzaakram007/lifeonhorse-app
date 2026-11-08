-- Optional demo rows for activity alerts inbox (after 012 is applied).
-- Safe to re-run: deletes prior seed rows for the demo recipient, then inserts.
-- Do NOT apply 004. Prefer a real favoriter + published entity-linked post when possible.

DO $$
DECLARE
  recipient UUID;
  sample_post UUID;
  sample_entity_type TEXT;
  sample_entity_id UUID;
BEGIN
  SELECT id INTO recipient
  FROM public.profiles
  WHERE email ILIKE '%@%'
  ORDER BY created_at ASC
  LIMIT 1;

  IF recipient IS NULL THEN
    RAISE NOTICE 'No profile found — skip seed';
    RETURN;
  END IF;

  SELECT bp.id, bp.linked_entity_type, bp.linked_entity_id
  INTO sample_post, sample_entity_type, sample_entity_id
  FROM public.blog_posts bp
  WHERE bp.status = 'published'
    AND bp.linked_entity_type IS NOT NULL
    AND bp.linked_entity_id IS NOT NULL
  ORDER BY bp.published_at DESC NULLS LAST
  LIMIT 1;

  DELETE FROM public.notifications
  WHERE user_id = recipient
    AND kind = 'entity_post'
    AND title LIKE 'New % update'
    AND body LIKE 'Seed:%';

  INSERT INTO public.notifications (
    user_id,
    kind,
    title,
    body,
    href,
    entity_type,
    entity_id,
    blog_post_id,
    is_read
  ) VALUES (
    recipient,
    'entity_post',
    'New Club update',
    'Seed: sample activity alert for inbox UI',
    CASE WHEN sample_post IS NOT NULL THEN '/blog/' || sample_post::text ELSE '/blog' END,
    COALESCE(sample_entity_type, 'club'),
    sample_entity_id,
    sample_post,
    false
  )
  ON CONFLICT ON CONSTRAINT notifications_user_post_unique DO NOTHING;

  -- Always ensure at least one unread row even if unique conflict on blog_post_id
  IF NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = recipient AND n.is_read = false
  ) THEN
    INSERT INTO public.notifications (
      user_id, kind, title, body, href, entity_type, entity_id, blog_post_id, is_read
    ) VALUES (
      recipient,
      'entity_post',
      'New Trainer update',
      'Seed: unread activity alert (no linked post)',
      '/blog',
      'trainer',
      NULL,
      NULL,
      false
    );
  END IF;

  RAISE NOTICE 'Seeded activity notifications for %', recipient;
END $$;
