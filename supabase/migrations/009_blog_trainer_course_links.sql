-- Additive: extend blog_posts linked-entity RLS for trainer + course owners.
-- Keeps polymorphic linked_entity_type / linked_entity_id (no new entity columns).
-- Depends on 008_blog_entity_links.sql. Do NOT apply 004.
-- Authz uses trainers.user_id and courses.creator_id (+ admin/moderator helpers). Never user_metadata.

CREATE OR REPLACE FUNCTION public.user_owns_trainer(target_trainer_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trainers t
    WHERE t.id = target_trainer_id
      AND t.user_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.user_owns_trainer(UUID) IS
  'True when auth.uid() owns the trainer profile. Used by blog_posts RLS for entity-linked trainer posts.';

CREATE OR REPLACE FUNCTION public.user_owns_course(target_course_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = target_course_id
      AND c.creator_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.user_owns_course(UUID) IS
  'True when auth.uid() created the course. Used by blog_posts RLS for entity-linked course posts.';

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
      ELSE false
    END;
$$;

COMMENT ON FUNCTION public.blog_linked_entity_allowed(TEXT, UUID) IS
  'Ownership gate for linked_entity_*: club (owner_id), trainer (user_id), course (creator_id). Other types false until mirror PRs.';

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
      ELSE false
    END;
$$;

COMMENT ON FUNCTION public.blog_user_owns_linked_entity(TEXT, UUID) IS
  'True when auth.uid() owns the linked club/trainer/course row (select/update/delete paths).';

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
