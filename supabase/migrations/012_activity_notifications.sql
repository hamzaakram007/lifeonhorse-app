-- Additive: in-app activity notifications when favorited entities publish Journal posts.
-- Depends on favorites (004_mobile_growth) + blog linked_entity_* (008+).
-- Apply on live project ebgzqmnewtdippegphou (001 lineage). Do NOT apply 004.
-- No email/push — inbox only.

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  href TEXT,
  entity_type TEXT,
  entity_id UUID,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id)
  WHERE is_read = false;

-- One alert per user per post (idempotent across republish / title edits).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notifications_user_post_unique'
      AND conrelid = 'public.notifications'::regclass
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_user_post_unique
      UNIQUE (user_id, blog_post_id);
  END IF;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Inserts only via SECURITY DEFINER trigger (no client INSERT policy).
DROP POLICY IF EXISTS notifications_delete_own ON public.notifications;
CREATE POLICY notifications_delete_own ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;

CREATE OR REPLACE FUNCTION public.notify_favoriters_on_entity_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  should_notify BOOLEAN := false;
  entity_label TEXT;
  notif_title TEXT;
  notif_body TEXT;
  notif_href TEXT;
BEGIN
  IF NEW.linked_entity_type IS NULL OR NEW.linked_entity_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM 'published' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    should_notify := true;
  ELSIF TG_OP = 'UPDATE' THEN
    -- First publish, or publish while entity link newly attached.
    should_notify :=
      (OLD.status IS DISTINCT FROM 'published')
      OR (
        OLD.linked_entity_type IS DISTINCT FROM NEW.linked_entity_type
        OR OLD.linked_entity_id IS DISTINCT FROM NEW.linked_entity_id
      );
  END IF;

  IF NOT should_notify THEN
    RETURN NEW;
  END IF;

  entity_label := initcap(replace(NEW.linked_entity_type, '_', ' '));
  notif_title := 'New ' || entity_label || ' update';
  notif_body := LEFT(COALESCE(NULLIF(trim(NEW.title), ''), 'A favorited listing published an update'), 200);
  notif_href := '/blog/' || NEW.id::text;

  INSERT INTO public.notifications (
    user_id,
    kind,
    title,
    body,
    href,
    entity_type,
    entity_id,
    blog_post_id
  )
  SELECT
    f.user_id,
    'entity_post',
    notif_title,
    notif_body,
    notif_href,
    NEW.linked_entity_type,
    NEW.linked_entity_id,
    NEW.id
  FROM public.favorites f
  WHERE f.entity_type = NEW.linked_entity_type
    AND f.entity_id = NEW.linked_entity_id
    AND f.user_id IS DISTINCT FROM NEW.author_id
  ON CONFLICT ON CONSTRAINT notifications_user_post_unique
  DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.notify_favoriters_on_entity_post() IS
  'On published entity-linked blog_posts, notify users who favorited that entity (in-app only).';

DROP TRIGGER IF EXISTS on_blog_post_notify_favoriters ON public.blog_posts;
CREATE TRIGGER on_blog_post_notify_favoriters
  AFTER INSERT OR UPDATE OF status, linked_entity_type, linked_entity_id, title
  ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_favoriters_on_entity_post();
