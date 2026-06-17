-- Phase 5: Enterprise Scale
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, entity_type, entity_id)
);

CREATE OR REPLACE VIEW public.analytics_counts AS
SELECT
  (SELECT count(*) FROM public.profiles) AS total_users,
  (SELECT count(*) FROM public.horses WHERE status = 'published') AS horse_listings,
  (SELECT count(*) FROM public.products WHERE status = 'published') AS products,
  (SELECT count(*) FROM public.services WHERE status = 'published') AS services,
  (SELECT count(*) FROM public.clubs WHERE status = 'published') AS clubs,
  (SELECT count(*) FROM public.trainers WHERE status = 'published') AS trainers,
  (SELECT count(*) FROM public.experts WHERE status = 'published') AS experts,
  (SELECT count(*) FROM public.events WHERE status = 'published') AS events,
  (SELECT count(*) FROM public.courses WHERE status = 'published') AS courses,
  (SELECT count(*) FROM public.health_requests) AS health_requests,
  (SELECT count(*) FROM public.inquiries) AS inquiries,
  (SELECT count(*) FROM public.orders WHERE status = 'confirmed') AS confirmed_orders;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY reviews_select ON public.reviews FOR SELECT USING (status = 'published' OR reviewer_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY reviews_insert ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY reviews_admin ON public.reviews FOR UPDATE USING (public.is_admin_or_moderator(auth.uid()));

GRANT SELECT ON public.analytics_counts TO authenticated;
