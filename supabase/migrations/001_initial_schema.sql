-- LifeOnHorse Phase 1: Core schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.user_role AS ENUM (
  'member', 'seller', 'trainer', 'club_owner', 'course_creator', 'moderator', 'admin'
);

CREATE TYPE public.listing_status AS ENUM ('draft', 'published', 'hidden', 'removed');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role public.user_role NOT NULL DEFAULT 'member',
  country_code TEXT,
  city TEXT,
  bio TEXT,
  phone TEXT,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE public.horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  breed TEXT,
  age INTEGER,
  gender TEXT,
  price NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  country_code TEXT REFERENCES public.countries(code),
  city TEXT,
  discipline TEXT,
  purpose TEXT,
  height_cm NUMERIC(5,1),
  color TEXT,
  listing_type TEXT DEFAULT 'sale',
  photos JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  country_code TEXT REFERENCES public.countries(code),
  city TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  category TEXT,
  country_code TEXT REFERENCES public.countries(code),
  photos JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  category TEXT,
  country_code TEXT REFERENCES public.countries(code),
  photos JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  club_type TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  country_code TEXT REFERENCES public.countries(code),
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  member_count INTEGER,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  specialty TEXT,
  description TEXT,
  country_code TEXT REFERENCES public.countries(code),
  city TEXT,
  experience_years INTEGER,
  certifications TEXT,
  phone TEXT,
  email TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  country_code TEXT REFERENCES public.countries(code),
  city TEXT,
  venue TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT,
  is_free BOOLEAN NOT NULL DEFAULT true,
  price NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  cover_image TEXT,
  lessons JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  cover_image TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  status public.listing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  description TEXT,
  country_code TEXT REFERENCES public.countries(code),
  city TEXT,
  credentials TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status public.listing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.health_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES public.experts(id) ON DELETE SET NULL,
  horse_name TEXT,
  issue_description TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal',
  country_code TEXT REFERENCES public.countries(code),
  photos JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  disclaimer_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.commission_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.seller_profiles(id) ON DELETE SET NULL,
  deal_description TEXT NOT NULL,
  deal_value NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  commission_percent NUMERIC(5,2) DEFAULT 5,
  commission_amount NUMERIC(12,2),
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND role = 'admin' AND is_suspended = false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFiner SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND role IN ('admin', 'moderator') AND is_suspended = false
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER horses_updated BEFORE UPDATE ON public.horses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER health_requests_updated BEFORE UPDATE ON public.health_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_admin ON public.profiles FOR ALL USING (public.is_admin_or_moderator(auth.uid()));

-- Countries public read
CREATE POLICY countries_select ON public.countries FOR SELECT USING (true);
CREATE POLICY countries_admin ON public.countries FOR ALL USING (public.is_admin(auth.uid()));

-- Published content readable by all
CREATE POLICY horses_select ON public.horses FOR SELECT USING (status = 'published' OR owner_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY horses_insert ON public.horses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY horses_update ON public.horses FOR UPDATE USING (auth.uid() = owner_id OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY horses_delete ON public.horses FOR DELETE USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));

CREATE POLICY sellers_select ON public.seller_profiles FOR SELECT USING (status = 'published' OR user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY sellers_insert ON public.seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY sellers_update ON public.seller_profiles FOR UPDATE USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY products_select ON public.products FOR SELECT USING (status = 'published' OR public.is_admin_or_moderator(auth.uid()) OR EXISTS (SELECT 1 FROM public.seller_profiles s WHERE s.id = seller_id AND s.user_id = auth.uid()));
CREATE POLICY products_mutate ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.seller_profiles s WHERE s.id = seller_id AND s.user_id = auth.uid()) OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY services_select ON public.services FOR SELECT USING (status = 'published' OR public.is_admin_or_moderator(auth.uid()) OR EXISTS (SELECT 1 FROM public.seller_profiles s WHERE s.id = seller_id AND s.user_id = auth.uid()));
CREATE POLICY services_mutate ON public.services FOR ALL USING (EXISTS (SELECT 1 FROM public.seller_profiles s WHERE s.id = seller_id AND s.user_id = auth.uid()) OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY clubs_select ON public.clubs FOR SELECT USING (status = 'published' OR owner_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY clubs_mutate ON public.clubs FOR ALL USING (auth.uid() = owner_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY trainers_select ON public.trainers FOR SELECT USING (status = 'published' OR user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY trainers_mutate ON public.trainers FOR ALL USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY events_select ON public.events FOR SELECT USING (status = 'published' OR host_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY events_mutate ON public.events FOR ALL USING (auth.uid() = host_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY courses_select ON public.courses FOR SELECT USING (status = 'published' OR creator_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY courses_mutate ON public.courses FOR ALL USING (auth.uid() = creator_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY blog_select ON public.blog_posts FOR SELECT USING (status = 'published' OR author_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY blog_mutate ON public.blog_posts FOR ALL USING (auth.uid() = author_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY community_select ON public.community_posts FOR SELECT USING (status = 'published' OR author_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY community_mutate ON public.community_posts FOR ALL USING (auth.uid() = author_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY experts_select ON public.experts FOR SELECT USING (status = 'published' OR user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY experts_mutate ON public.experts FOR ALL USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY health_select ON public.health_requests FOR SELECT USING (user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()) OR EXISTS (SELECT 1 FROM public.experts e WHERE e.id = expert_id AND e.user_id = auth.uid()));
CREATE POLICY health_insert ON public.health_requests FOR INSERT WITH CHECK (auth.uid() = user_id AND disclaimer_accepted = true);
CREATE POLICY health_update ON public.health_requests FOR UPDATE USING (user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY inquiries_select ON public.inquiries FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY inquiries_insert ON public.inquiries FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY reports_select ON public.reports FOR SELECT USING (reporter_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));
CREATE POLICY reports_insert ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY reports_admin ON public.reports FOR UPDATE USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY commission_select ON public.commission_records FOR SELECT USING (public.is_admin_or_moderator(auth.uid()) OR EXISTS (SELECT 1 FROM public.seller_profiles s WHERE s.id = seller_id AND s.user_id = auth.uid()));
CREATE POLICY commission_admin ON public.commission_records FOR ALL USING (public.is_admin(auth.uid()));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT DO NOTHING;

CREATE POLICY uploads_read ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY uploads_insert ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
CREATE POLICY uploads_update ON storage.objects FOR UPDATE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY uploads_delete ON storage.objects FOR DELETE USING (bucket_id = 'uploads' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())));
