-- Additive: polymorphic entity links on blog_posts for club (P0) and later trainer/event/course/seller/expert.
-- Authz uses clubs.owner_id (+ admin/moderator helpers). Never user_metadata.
-- Apply on live project ebgzqmnewtdippegphou (001 lineage). Do NOT apply 004.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS linked_entity_type TEXT,
  ADD COLUMN IF NOT EXISTS linked_entity_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blog_posts_linked_entity_type_check'
      AND conrelid = 'public.blog_posts'::regclass
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_linked_entity_type_check
      CHECK (
        linked_entity_type IS NULL
        OR linked_entity_type IN ('club', 'trainer', 'event', 'course', 'seller', 'expert')
      );
  END IF;
END $$;

-- Keep type/id paired
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'blog_posts_linked_entity_pair_check'
      AND conrelid = 'public.blog_posts'::regclass
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_linked_entity_pair_check
      CHECK (
        (linked_entity_type IS NULL AND linked_entity_id IS NULL)
        OR (linked_entity_type IS NOT NULL AND linked_entity_id IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS blog_posts_linked_entity_idx
  ON public.blog_posts (linked_entity_type, linked_entity_id)
  WHERE linked_entity_type IS NOT NULL;

CREATE OR REPLACE FUNCTION public.user_owns_club(target_club_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clubs c
    WHERE c.id = target_club_id
      AND c.owner_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.user_owns_club(UUID) IS
  'True when auth.uid() owns the club row. Used by blog_posts RLS for entity-linked club posts.';

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
      ELSE false
    END;
$$;

COMMENT ON FUNCTION public.blog_linked_entity_allowed(TEXT, UUID) IS
  'P0: only club ownership is enforced for linked_entity_*. Other types return false until mirror PRs.';

DROP POLICY IF EXISTS blog_select ON public.blog_posts;
DROP POLICY IF EXISTS blog_mutate ON public.blog_posts;
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
    OR public.is_admin(auth.uid())
  );
