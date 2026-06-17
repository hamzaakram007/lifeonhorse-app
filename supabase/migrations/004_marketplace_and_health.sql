-- Marketplace expansion + Horse Health & Expert Help

-- Extend entity_kind for inquiries, reports, favorites
ALTER TYPE entity_kind ADD VALUE IF NOT EXISTS 'seller';
ALTER TYPE entity_kind ADD VALUE IF NOT EXISTS 'product';
ALTER TYPE entity_kind ADD VALUE IF NOT EXISTS 'service';
ALTER TYPE entity_kind ADD VALUE IF NOT EXISTS 'expert';
ALTER TYPE entity_kind ADD VALUE IF NOT EXISTS 'health_request';

-- New enums
CREATE TYPE seller_type AS ENUM (
  'individual', 'breeder', 'tack_shop', 'feed_supplier', 'stable_equipment_supplier',
  'service_provider', 'club_shop', 'trainer_shop', 'verified_business', 'other'
);

CREATE TYPE product_category AS ENUM (
  'saddles', 'bridles', 'reins', 'bits', 'stirrups', 'grooming_kits', 'blankets',
  'boots', 'helmets', 'riding_clothes', 'feed', 'supplements', 'medicines',
  'salt_blocks', 'stable_equipment', 'trailers', 'digital_products', 'other'
);

CREATE TYPE service_category AS ENUM (
  'transport', 'farrier', 'vet', 'breeding', 'training', 'photography',
  'event_services', 'stable_management', 'import_export', 'emergency_transport', 'other'
);

CREATE TYPE stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'made_to_order');
CREATE TYPE delivery_option AS ENUM ('delivery', 'pickup', 'both');
CREATE TYPE pricing_model AS ENUM ('fixed', 'hourly', 'per_visit', 'quote', 'free_consultation', 'other');

CREATE TYPE expert_category AS ENUM (
  'vet', 'farrier', 'equine_dentist', 'nutrition_expert', 'breeding_expert',
  'behavior_specialist', 'rehabilitation_expert', 'emergency_transport',
  'stable_management_expert', 'other'
);

CREATE TYPE health_problem_type AS ENUM (
  'disease_illness', 'injury', 'hoof_problem', 'feeding_nutrition', 'behavior_issue',
  'pregnancy_breeding', 'skin_problem', 'emergency', 'other'
);

CREATE TYPE urgency_level AS ENUM ('low', 'normal', 'high', 'emergency');
CREATE TYPE health_request_status AS ENUM ('new', 'reviewing', 'resolved', 'closed');

-- Seller profiles
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  seller_type seller_type NOT NULL DEFAULT 'individual',
  business_name TEXT NOT NULL,
  contact_person TEXT,
  country TEXT,
  city TEXT,
  whatsapp TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  logo_url TEXT,
  business_docs JSONB DEFAULT '[]',
  product_categories TEXT[] DEFAULT '{}',
  delivery_areas TEXT[] DEFAULT '{}',
  payment_methods TEXT[] DEFAULT '{}',
  description TEXT,
  status content_status NOT NULL DEFAULT 'published',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sellers_country_idx ON sellers(country);
CREATE INDEX sellers_type_idx ON sellers(seller_type);
CREATE INDEX sellers_user_idx ON sellers(user_id);

-- Product marketplace
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category product_category NOT NULL DEFAULT 'other',
  price NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  country TEXT,
  city TEXT,
  photos JSONB DEFAULT '[]',
  description TEXT,
  stock_status stock_status NOT NULL DEFAULT 'in_stock',
  delivery_option delivery_option NOT NULL DEFAULT 'both',
  contact_email TEXT,
  contact_phone TEXT,
  status content_status NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX products_seller_idx ON products(seller_id);
CREATE INDEX products_category_idx ON products(category);
CREATE INDEX products_country_idx ON products(country);

-- Service marketplace
CREATE TABLE marketplace_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category service_category NOT NULL DEFAULT 'other',
  country TEXT,
  city TEXT,
  photos JSONB DEFAULT '[]',
  description TEXT,
  pricing_model pricing_model NOT NULL DEFAULT 'quote',
  pricing_details TEXT,
  availability TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  whatsapp TEXT,
  status content_status NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX marketplace_services_seller_idx ON marketplace_services(seller_id);
CREATE INDEX marketplace_services_category_idx ON marketplace_services(category);
CREATE INDEX marketplace_services_country_idx ON marketplace_services(country);

-- Health experts
CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category expert_category NOT NULL DEFAULT 'other',
  license_certification TEXT,
  country TEXT,
  city TEXT,
  clinic_name TEXT,
  specialization TEXT,
  contact_phone TEXT,
  whatsapp TEXT,
  online_consultation BOOLEAN NOT NULL DEFAULT false,
  emergency_available BOOLEAN NOT NULL DEFAULT false,
  service_area TEXT,
  avatar_url TEXT,
  photos JSONB DEFAULT '[]',
  bio TEXT,
  status content_status NOT NULL DEFAULT 'published',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX experts_category_idx ON experts(category);
CREATE INDEX experts_country_idx ON experts(country);
CREATE INDEX experts_user_idx ON experts(user_id);

-- Horse health problem / help requests
CREATE TABLE health_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  horse_age INTEGER,
  horse_breed TEXT,
  horse_gender TEXT,
  country TEXT,
  city TEXT,
  problem_type health_problem_type NOT NULL DEFAULT 'other',
  symptoms TEXT NOT NULL,
  photos JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',
  issue_duration TEXT,
  urgency urgency_level NOT NULL DEFAULT 'normal',
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status health_request_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX health_requests_status_idx ON health_requests(status);
CREATE INDEX health_requests_urgency_idx ON health_requests(urgency);

-- Updated_at triggers
CREATE TRIGGER sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER marketplace_services_updated_at BEFORE UPDATE ON marketplace_services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER experts_updated_at BEFORE UPDATE ON experts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER health_requests_updated_at BEFORE UPDATE ON health_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_requests ENABLE ROW LEVEL SECURITY;

-- Sellers policies
CREATE POLICY "Published sellers public" ON sellers FOR SELECT USING (
  status = 'published' OR user_id = auth.uid() OR is_admin_or_moderator(auth.uid())
);
CREATE POLICY "Users insert seller profile" ON sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update seller profile" ON sellers FOR UPDATE USING (
  user_id = auth.uid() OR is_admin_or_moderator(auth.uid())
);

-- Products policies
CREATE POLICY "Published products public" ON products FOR SELECT USING (
  status = 'published' OR EXISTS (
    SELECT 1 FROM sellers s WHERE s.id = seller_id AND s.user_id = auth.uid()
  ) OR is_admin_or_moderator(auth.uid())
);
CREATE POLICY "Sellers insert products" ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM sellers s WHERE s.id = seller_id AND s.user_id = auth.uid())
);
CREATE POLICY "Sellers update products" ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM sellers s WHERE s.id = seller_id AND s.user_id = auth.uid())
  OR is_admin_or_moderator(auth.uid())
);

-- Services policies
CREATE POLICY "Published services public" ON marketplace_services FOR SELECT USING (
  status = 'published' OR EXISTS (
    SELECT 1 FROM sellers s WHERE s.id = seller_id AND s.user_id = auth.uid()
  ) OR is_admin_or_moderator(auth.uid())
);
CREATE POLICY "Sellers insert services" ON marketplace_services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM sellers s WHERE s.id = seller_id AND s.user_id = auth.uid())
);
CREATE POLICY "Sellers update services" ON marketplace_services FOR UPDATE USING (
  EXISTS (SELECT 1 FROM sellers s WHERE s.id = seller_id AND s.user_id = auth.uid())
  OR is_admin_or_moderator(auth.uid())
);

-- Experts policies
CREATE POLICY "Published experts public" ON experts FOR SELECT USING (
  status = 'published' OR user_id = auth.uid() OR is_admin_or_moderator(auth.uid())
);
CREATE POLICY "Users insert expert profile" ON experts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update expert profile" ON experts FOR UPDATE USING (
  user_id = auth.uid() OR is_admin_or_moderator(auth.uid())
);

-- Health requests policies
CREATE POLICY "Anyone can submit health request" ON health_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users see own health requests" ON health_requests FOR SELECT USING (
  user_id = auth.uid() OR is_admin_or_moderator(auth.uid())
);
CREATE POLICY "Admins update health requests" ON health_requests FOR UPDATE USING (is_admin_or_moderator(auth.uid()));
