-- Phase 2: Trust & Safety
CREATE TABLE public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  document_url TEXT NOT NULL,
  document_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

ALTER TABLE public.health_requests
  ADD COLUMN IF NOT EXISTS emergency_acknowledged BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY verification_select ON public.verification_documents FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY verification_insert ON public.verification_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY verification_admin ON public.verification_documents FOR UPDATE
  USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY audit_admin ON public.audit_log FOR SELECT USING (public.is_admin_or_moderator(auth.uid()));
CREATE POLICY audit_insert ON public.audit_log FOR INSERT WITH CHECK (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY rate_limits_service ON public.rate_limits FOR ALL USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier TEXT, p_action TEXT, p_max INTEGER, p_window_minutes INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits WHERE window_start < now() - (p_window_minutes || ' minutes')::interval;
  SELECT COALESCE(SUM(count), 0) INTO v_count FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action
    AND window_start > now() - (p_window_minutes || ' minutes')::interval;
  IF v_count >= p_max THEN RETURN false; END IF;
  INSERT INTO public.rate_limits (identifier, action, count, window_start)
  VALUES (p_identifier, p_action, 1, date_trunc('minute', now()))
  ON CONFLICT (identifier, action, window_start) DO UPDATE SET count = public.rate_limits.count + 1;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_admin_action(p_action TEXT, p_entity_type TEXT, p_entity_id UUID, p_details JSONB DEFAULT '{}')
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_log (admin_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details);
END;
$$;
