-- Phase 3: Monetization
CREATE TABLE public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  interval TEXT DEFAULT 'month',
  plan_type TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.billing_plans(id),
  order_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_proof_url TEXT,
  notes TEXT,
  confirmed_by UUID REFERENCES public.profiles(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.billing_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.featured_listing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  order_id UUID REFERENCES public.orders(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_records
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id),
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_listing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY plans_select ON public.billing_plans FOR SELECT USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY plans_admin ON public.billing_plans FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY orders_select ON public.orders FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY orders_insert ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY orders_admin ON public.orders FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY subscriptions_select ON public.subscriptions FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY subscriptions_admin ON public.subscriptions FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY featured_select ON public.featured_listing_requests FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY featured_insert ON public.featured_listing_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY featured_admin ON public.featured_listing_requests FOR UPDATE USING (public.is_admin(auth.uid()));

INSERT INTO public.billing_plans (slug, name, description, price, plan_type, features) VALUES
  ('free', 'Free', 'Basic listing', 0, 'seller', '["1 listing","Basic profile"]'),
  ('featured-horse', 'Featured Horse Listing', '30-day featured placement', 29, 'featured', '["Homepage feature","Priority search"]'),
  ('premium-seller', 'Premium Seller', 'Monthly seller subscription', 19, 'subscription', '["Unlimited listings","Verified badge priority"]'),
  ('club-premium', 'Club Premium', 'Club featured profile', 39, 'subscription', '["Featured club","Event promotion"]'),
  ('expert-premium', 'Expert Premium', 'Health expert featured profile', 49, 'subscription', '["Featured expert","Priority inquiries"]')
ON CONFLICT (slug) DO NOTHING;
