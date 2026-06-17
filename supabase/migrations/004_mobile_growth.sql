-- Phase 4: Mobile & Growth
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE TABLE public.inquiry_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  country_code TEXT REFERENCES public.countries(code),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY favorites_own ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY notifications_own ON public.inquiry_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_update ON public.inquiry_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY newsletter_insert ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY newsletter_admin ON public.newsletter_subscribers FOR ALL USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.notify_inquiry_recipient()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.inquiry_notifications (user_id, inquiry_id, title, body)
  VALUES (NEW.recipient_id, NEW.id, 'New inquiry received', LEFT(NEW.message, 200));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_inquiry_created ON public.inquiries;
CREATE TRIGGER on_inquiry_created
  AFTER INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.notify_inquiry_recipient();
