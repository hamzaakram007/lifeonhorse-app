-- Additive: allow event hosts (and host-club owners) to link blog_posts to events.
-- Extends 008 + 009_blog_expert_links.sql + 010_blog_trainer_course_links.sql.
-- Preserves club + expert + trainer + course ownership; adds event.
-- Do NOT apply 004.

CREATE OR REPLACE FUNCTION public.user_can_post_for_event(target_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = target_event_id
      AND (
        e.host_id = auth.uid()
        OR (
          e.club_id IS NOT NULL
          AND public.user_owns_club(e.club_id)
        )
      )
  );
$$;

COMMENT ON FUNCTION public.user_can_post_for_event(UUID) IS
  'True when auth.uid() is the event host or owns the event host club. Used by blog_posts RLS.';

CREATE OR REPLACE FUNCTION public.blog_linked_entity_allowed(
  entity_type TEXT,
  entity_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    CASE
      WHEN entity_type IS NULL AND entity_id IS NULL THEN true
      WHEN entity_type = 'club' AND entity_id IS NOT NULL THEN public.user_owns_club(entity_id)
      WHEN entity_type = 'trainer' AND entity_id IS NOT NULL THEN public.user_owns_trainer(entity_id)
      WHEN entity_type = 'course' AND entity_id IS NOT NULL THEN public.user_owns_course(entity_id)
      WHEN entity_type = 'expert' AND entity_id IS NOT NULL THEN public.user_owns_expert(entity_id)
      WHEN entity_type = 'event' AND entity_id IS NOT NULL THEN public.user_can_post_for_event(entity_id)
      ELSE false
    END;
$$;

COMMENT ON FUNCTION public.blog_linked_entity_allowed(TEXT, UUID) IS
  'Ownership gate for linked_entity_*: club, trainer, course, expert, event. Other types false until mirror PRs.';

CREATE OR REPLACE FUNCTION public.blog_user_owns_linked_entity(
  entity_type TEXT,
  entity_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    CASE
      WHEN entity_type = 'club' AND entity_id IS NOT NULL THEN public.user_owns_club(entity_id)
      WHEN entity_type = 'trainer' AND entity_id IS NOT NULL THEN public.user_owns_trainer(entity_id)
      WHEN entity_type = 'course' AND entity_id IS NOT NULL THEN public.user_owns_course(entity_id)
      WHEN entity_type = 'expert' AND entity_id IS NOT NULL THEN public.user_owns_expert(entity_id)
      WHEN entity_type = 'event' AND entity_id IS NOT NULL THEN public.user_can_post_for_event(entity_id)
      ELSE false
    END;
$$;

COMMENT ON FUNCTION public.blog_user_owns_linked_entity(TEXT, UUID) IS
  'True when auth.uid() owns the linked club/trainer/course/expert/event row (select/update/delete paths).';

-- Policies already call blog_user_owns_linked_entity / blog_linked_entity_allowed
-- (010). Recreate them so definitions stay explicit after this extension.
DROP POLICY IF EXISTS blog_select ON public.blog_posts;
DROP POLICY IF EXISTS blog_insert ON public.blog_posts;
DROP POLICY IF EXISTS blog_update ON public.blog_posts;
DROP POLICY IF EXISTS blog_delete ON public.blog_posts;

CREATE POLICY blog_select ON public.blog_posts
  FOR SELECT
  USING (
    status = 'published'
    OR author_id = auth.uid()
    OR public.blog_user_owns_linked_entity(linked_entity_type, linked_entity_id)
    OR public.is_admin_or_moderator(auth.uid())
  );

CREATE POLICY blog_insert ON public.blog_posts
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (
      public.is_admin_or_moderator(auth.uid())
      OR public.blog_linked_entity_allowed(linked_entity_type, linked_entity_id)
    )
  );

CREATE POLICY blog_update ON public.blog_posts
  FOR UPDATE
  USING (
    auth.uid() = author_id
    OR public.blog_user_owns_linked_entity(linked_entity_type, linked_entity_id)
    OR public.is_admin_or_moderator(auth.uid())
  )
  WITH CHECK (
    public.is_admin_or_moderator(auth.uid())
    OR (
      auth.uid() = author_id
      AND public.blog_linked_entity_allowed(linked_entity_type, linked_entity_id)
    )
  );

CREATE POLICY blog_delete ON public.blog_posts
  FOR DELETE
  USING (
    auth.uid() = author_id
    OR public.blog_user_owns_linked_entity(linked_entity_type, linked_entity_id)
    OR public.is_admin(auth.uid())
  );
