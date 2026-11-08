-- Optional demo tips after 008 + 009 are applied on ebgzqmnewtdippegphou.
-- Links published Journal posts to an existing expert (first published expert by name).
-- Do NOT apply 004. Safe to re-run: uses fixed demo slugs.

DO $$
DECLARE
  v_expert_id UUID;
  v_author_id UUID;
BEGIN
  SELECT e.id, e.user_id
  INTO v_expert_id, v_author_id
  FROM public.experts e
  WHERE e.status = 'published'
  ORDER BY e.display_name
  LIMIT 1;

  IF v_expert_id IS NULL OR v_author_id IS NULL THEN
    RAISE NOTICE 'No published expert found — skip seed.';
    RETURN;
  END IF;

  INSERT INTO public.blog_posts (
    author_id,
    title,
    slug,
    excerpt,
    content,
    category,
    status,
    published_at,
    linked_entity_type,
    linked_entity_id
  )
  VALUES
    (
      v_author_id,
      'When to call the vet for a fever',
      'demo-expert-tip-fever-v1',
      'A short checklist for owners noticing elevated temperature.',
      E'Educational tip only — not a diagnosis.\n\n1. Take temperature calmly.\n2. Note appetite, manure, and attitude.\n3. Contact a licensed veterinarian if fever persists or the horse looks painful.\n\nAlways follow your local vet’s advice for emergencies.',
      'health',
      'published',
      now(),
      'expert',
      v_expert_id
    ),
    (
      v_author_id,
      'Hoof care between farrier visits',
      'demo-expert-tip-hoof-v1',
      'Simple daily habits that support sound feet.',
      E'Educational tip only — not a diagnosis.\n\nPick out feet daily, watch for heat or odor, and keep footing dry when you can. Schedule regular farrier work rather than waiting for cracks or lameness.',
      'health',
      'published',
      now() - interval '1 day',
      'expert',
      v_expert_id
    )
  ON CONFLICT (slug) DO UPDATE
    SET
      title = EXCLUDED.title,
      excerpt = EXCLUDED.excerpt,
      content = EXCLUDED.content,
      category = EXCLUDED.category,
      status = EXCLUDED.status,
      linked_entity_type = EXCLUDED.linked_entity_type,
      linked_entity_id = EXCLUDED.linked_entity_id,
      published_at = EXCLUDED.published_at;

  RAISE NOTICE 'Seeded expert tips for expert %', v_expert_id;
END $$;
