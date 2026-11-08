-- Additive: allow experts to author linked Journal posts (slice H).
-- Extends 008_blog_entity_links.sql blog_linked_entity_allowed + RLS.
-- Ownership: experts.user_id = auth.uid(). Never user_metadata.
-- Apply on live project ebgzqmnewtdippegphou (001 lineage). Do NOT apply 004.

CREATE OR REPLACE FUNCTION public.user_owns_expert(target_expert_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.experts e
    WHERE e.id = target_expert_id
      AND e.user_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.user_owns_expert(UUID) IS
  'True when auth.uid() owns the expert row. Used by blog_posts RLS for entity-linked expert tips.';

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
      WHEN entity_type = 'expert' AND entity_id IS NOT NULL THEN public.user_owns_expert(entity_id)
      ELSE false
    END;
$$;

COMMENT ON FUNCTION public.blog_linked_entity_allowed(TEXT, UUID) IS
  'Club (P0) + expert (P1 H) ownership for linked_entity_*. Other types return false until their mirror PRs.';

DROP POLICY IF EXISTS blog_select ON public.blog_posts;
DROP POLICY IF EXISTS blog_insert ON public.blog_posts;
DROP POLICY IF EXISTS blog_update ON public.blog_posts;
DROP POLICY IF EXISTS blog_delete ON public.blog_posts;

CREATE POLICY blog_select ON public.blog_posts
  FOR SELECT
  USING (
    status = 'published'
    OR author_id = auth.uid()
    OR (
      linked_entity_type = 'club'
      AND linked_entity_id IS NOT NULL
      AND public.user_owns_club(linked_entity_id)
    )
    OR (
      linked_entity_type = 'expert'
      AND linked_entity_id IS NOT NULL
      AND public.user_owns_expert(linked_entity_id)
    )
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
    OR (
      linked_entity_type = 'club'
      AND linked_entity_id IS NOT NULL
      AND public.user_owns_club(linked_entity_id)
    )
    OR (
      linked_entity_type = 'expert'
      AND linked_entity_id IS NOT NULL
      AND public.user_owns_expert(linked_entity_id)
    )
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
    OR (
      linked_entity_type = 'club'
      AND linked_entity_id IS NOT NULL
      AND public.user_owns_club(linked_entity_id)
    )
    OR (
      linked_entity_type = 'expert'
      AND linked_entity_id IS NOT NULL
      AND public.user_owns_expert(linked_entity_id)
    )
    OR public.is_admin(auth.uid())
  );
