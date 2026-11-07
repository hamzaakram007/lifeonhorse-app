-- LifeOnHorse demo seed (run via Supabase SQL editor or MCP execute_sql)
-- Replace :owner_id with your profile UUID if different

DO $$
DECLARE
  owner_id UUID := 'ccce43e8-abd7-4f31-807c-7b91f995c88f';
  cat_safety UUID;
  cat_training UUID;
  cat_culture UUID;
  seller_id UUID;
  course_id UUID;
  horse_id UUID;
  badge_early UUID;
  badge_seller UUID;
BEGIN
  UPDATE profiles SET role = 'admin', is_verified = true, country = 'PK', city = 'Lahore' WHERE id = owner_id;

  SELECT id INTO cat_safety FROM blog_categories WHERE slug = 'marketplace-safety' LIMIT 1;
  SELECT id INTO cat_training FROM blog_categories WHERE slug = 'training' LIMIT 1;
  SELECT id INTO cat_culture FROM blog_categories WHERE slug = 'country-culture' LIMIT 1;

  INSERT INTO horses (owner_id, title, slug, description, listing_type, breed, age, gender, price, currency, country, city, photos, status, is_featured, is_verified)
  VALUES
    (owner_id, 'Majestic Arabian — Lahore', 'majestic-arabian-lahore', 'Registered Arabian mare, excellent temperament.', 'sale', 'Arabian', 6, 'Mare', 850000, 'PKR', 'PK', 'Lahore', '["/images/demo/horse-1.jpg"]', 'published', true, true),
    (owner_id, 'Thoroughbred Gelding — Cape Town', 'thoroughbred-cape-town', 'Sound gelding for polo and leisure riding.', 'sale', 'Thoroughbred', 8, 'Gelding', 120000, 'ZAR', 'ZA', 'Cape Town', '["/images/demo/horse-2.jpg"]', 'published', true, false),
    (owner_id, 'Rescue Pony — Adoption', 'rescue-pony-adoption', 'Gentle pony seeking a caring home.', 'adoption', 'Pony', 4, NULL, NULL, NULL, 'IN', 'Delhi', '["/images/demo/horse-3.jpg"]', 'published', false, false),
    (owner_id, 'Akhal-Teke Stallion — Ashgabat', 'akhal-teke-stallion', 'Premium stud service.', 'stud', 'Akhal-Teke', 9, 'Stallion', 45000, 'USD', 'TM', 'Ashgabat', '["/images/demo/horse-4.jpg"]', 'published', true, true),
    (owner_id, 'Warmblood Mare — Istanbul', 'warmblood-istanbul', 'Monthly lease for show jumping.', 'lease', 'Warmblood', 7, 'Mare', 15000, 'TRY', 'TR', 'Istanbul', '["/images/demo/horse-5.jpg"]', 'published', false, false)
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, photos = EXCLUDED.photos, status = 'published';

  INSERT INTO clubs (owner_id, name, slug, description, club_type, country, city, logo_url, photos, member_count, horse_count, status, is_featured, is_verified, training_available, membership_available)
  VALUES
    (owner_id, 'Lahore Polo & Equestrian Club', 'lahore-polo-club', 'Demo club profile.', 'polo', 'PK', 'Lahore', '/images/demo/club-1.jpg', '["/images/demo/club-1.jpg"]', 120, 45, 'published', true, true, true, false),
    (owner_id, 'Istanbul Riding Academy', 'istanbul-riding-academy', 'Demo riding school.', 'riding_school', 'TR', 'Istanbul', '/images/sections/clubs.jpg', '["/images/sections/clubs.jpg"]', 85, 20, 'published', true, false, true, true),
    (owner_id, 'Baku Cultural Horse Society', 'baku-cultural-horse', 'Cultural heritage and riding.', 'cultural', 'AZ', 'Baku', NULL, '["/images/demo/club-1.jpg"]', 40, 10, 'published', false, false, false, false),
    (owner_id, 'Mumbai Equestrian Centre', 'mumbai-equestrian-centre', 'Sports and training centre.', 'equestrian_sports', 'IN', 'Mumbai', NULL, '["/images/sections/clubs.jpg"]', 60, 30, 'published', false, false, true, false)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = 'published';

  INSERT INTO trainers (user_id, display_name, slug, trainer_type, country, city, experience_years, bio, photos, status, is_verified, is_featured)
  VALUES
    (owner_id, 'Ahmed Khan — Polo Coach', 'ahmed-polo-coach', 'polo', 'PK', 'Lahore', 15, 'Polo coach with national team experience.', '["/images/demo/trainer-1.jpg"]', 'published', true, true),
    (owner_id, 'Priya Sharma — Riding Instructor', 'priya-riding-instructor', 'riding', 'IN', 'Mumbai', 10, 'Beginner to advanced riding lessons.', '["/images/home/feature-trainers.jpg"]', 'published', false, false),
    (owner_id, 'Mehmet Demir — Farrier', 'mehmet-demir-farrier', 'farrier', 'TR', 'Ankara', 12, 'Mobile farrier across central Turkey.', '["/images/sections/services.jpg"]', 'published', true, false)
  ON CONFLICT (slug) DO UPDATE SET display_name = EXCLUDED.display_name, status = 'published';

  INSERT INTO events (host_id, title, slug, description, event_type, country, city, start_date, photos, status, is_featured)
  VALUES
    (owner_id, 'Spring Polo Tournament — Lahore', 'spring-polo-lahore', 'Annual spring polo event.', 'polo_match', 'PK', 'Lahore', now() + interval '30 days', '["/images/demo/event-1.jpg"]', 'published', true),
    (owner_id, 'Istanbul Horse Show 2026', 'istanbul-horse-show-2026', 'International show jumping.', 'horse_show', 'TR', 'Istanbul', now() + interval '60 days', '["/images/sections/events.jpg"]', 'published', false),
    (owner_id, 'Delhi Riding Camp — Beginners', 'delhi-riding-camp', 'Weekend camp for new riders.', 'riding_camp', 'IN', 'Delhi', now() + interval '14 days', '[]', 'published', false)
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, status = 'published';

  INSERT INTO blog_posts (author_id, category_id, title, slug, excerpt, content, cover_image, status, is_featured)
  VALUES
    (owner_id, cat_safety, 'Buying Horses Safely in South Asia', 'buying-horses-safely-south-asia', 'Essential tips for first-time buyers.', 'Always verify health records and meet in person.', '/images/blog/buyers.jpg', 'published', true),
    (owner_id, cat_training, 'Polo Training Basics for New Riders', 'polo-training-basics', 'Stick work, rules, and fitness.', 'Demo training article content.', '/images/blog/training.jpg', 'published', false),
    (owner_id, cat_culture, 'Horse Culture in Azerbaijan', 'horse-culture-azerbaijan', 'Traditions and modern clubs.', 'Demo culture article.', '/images/blog/hoof.jpg', 'published', false)
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, status = 'published';

  INSERT INTO courses (creator_id, title, slug, description, category, thumbnail_url, is_free, price, currency, status, is_featured)
  VALUES
    (owner_id, 'Horse Care Basics', 'horse-care-basics', 'Feeding, grooming, and stable management.', 'Horse Care', '/images/demo/course-1.jpg', true, NULL, NULL, 'published', true),
    (owner_id, 'Introduction to Polo', 'introduction-to-polo', 'Rules, equipment, and beginner drills.', 'Training', NULL, false, 2500, 'PKR', 'published', false)
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, status = 'published';

  SELECT id INTO course_id FROM courses WHERE slug = 'horse-care-basics';
  DELETE FROM lessons WHERE course_id = course_id;
  INSERT INTO lessons (course_id, title, content, order_index) VALUES
    (course_id, 'Daily feeding routine', 'Hay, grains, and fresh water.', 0),
    (course_id, 'Grooming essentials', 'Brush, hoof pick, coat care.', 1),
    (course_id, 'Stable safety checklist', 'Fire safety and turnout.', 2);

  INSERT INTO sellers (user_id, slug, seller_type, business_name, country, city, logo_url, description, status, is_verified, is_featured)
  VALUES (owner_id, 'lahore-premier-tack', 'tack_shop', 'Lahore Premier Tack', 'PK', 'Lahore', '/images/sections/sellers.jpg', 'Quality tack since 1998.', 'published', true, true)
  ON CONFLICT (slug) DO UPDATE SET business_name = EXCLUDED.business_name, status = 'published'
  RETURNING id INTO seller_id;

  IF seller_id IS NULL THEN
    SELECT id INTO seller_id FROM sellers WHERE slug = 'lahore-premier-tack';
  END IF;

  INSERT INTO products (seller_id, title, slug, category, price, currency, country, photos, description, stock_status, status, is_featured)
  VALUES
    (seller_id, 'English All-Purpose Saddle', 'english-ap-saddle', 'saddles', 45000, 'PKR', 'PK', '["/images/demo/product-1.jpg"]', 'Demo saddle listing.', 'in_stock', 'published', true),
    (seller_id, 'Leather Bridle Set', 'leather-bridle-set', 'bridles', 12000, 'PKR', 'PK', '["/images/sections/products.jpg"]', 'Full bridle with reins.', 'in_stock', 'published', false),
    (seller_id, 'Riding Helmet — ASTM', 'riding-helmet-astm', 'helmets', 8500, 'PKR', 'PK', '["/images/sections/products.jpg"]', 'Safety certified helmet.', 'in_stock', 'published', false),
    (seller_id, 'Equine Mineral Salt Block', 'mineral-salt-block', 'salt_blocks', 350, 'ZAR', 'ZA', '["/images/sections/products.jpg"]', '25kg mineral block.', 'in_stock', 'published', true)
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, status = 'published';

  INSERT INTO marketplace_services (seller_id, title, slug, category, country, city, photos, description, pricing_model, pricing_details, status, is_featured)
  VALUES
    (seller_id, 'Horse Transport — Punjab', 'horse-transport-punjab', 'transport', 'PK', 'Lahore', '["/images/demo/service-1.jpg"]', 'Safe horse transport.', 'quote', 'From PKR 8,000', 'published', true),
    (seller_id, 'Mobile Farrier — Lahore', 'mobile-farrier-lahore', 'farrier', 'PK', 'Lahore', '["/images/sections/services.jpg"]', 'On-site shoeing.', 'per_visit', 'PKR 4,500 per horse', 'published', false),
    (seller_id, 'Stable Management Consultation', 'stable-management-consult', 'stable_management', 'PK', 'Lahore', '["/images/demo/club-1.jpg"]', 'Operational advice for yards.', 'hourly', 'PKR 5,000/hour', 'published', false)
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, status = 'published';

  INSERT INTO experts (user_id, slug, name, category, country, city, clinic_name, avatar_url, specialization, online_consultation, emergency_available, bio, status, is_verified, is_featured)
  VALUES
    (owner_id, 'dr-sana-equine-vet-lahore', 'Dr. Sana Malik', 'vet', 'PK', 'Lahore', 'Equine Care Lahore', '/images/demo/expert-1.jpg', 'Lameness, vaccinations', true, false, '15 years sport horse medicine.', 'published', true, true),
    (owner_id, 'dr-ayse-yilmaz-vet', 'Dr. Ayşe Yılmaz', 'vet', 'TR', 'Istanbul', 'Bosphorus Equine Clinic', '/images/sections/health.jpg', 'Emergency medicine', false, true, '24/7 emergency coverage.', 'published', true, false),
    (owner_id, 'james-ndlovu-farrier', 'James Ndlovu', 'farrier', 'ZA', 'Johannesburg', NULL, '/images/sections/services.jpg', 'Hot shoeing', false, false, 'Polo and racing yards.', 'published', false, true)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = 'published';

  IF NOT EXISTS (SELECT 1 FROM health_requests WHERE contact_email = 'demo-health@lifeonhorse.internal') THEN
    INSERT INTO health_requests (user_id, horse_breed, horse_age, horse_gender, country, city, problem_type, symptoms, urgency, contact_email, contact_name, status)
    VALUES
      (owner_id, 'Arabian', 6, 'Mare', 'PK', 'Lahore', 'hoof_problem', 'Intermittent lameness near fore.', 'normal', 'demo-health@lifeonhorse.internal', 'Demo Owner', 'new'),
      (NULL, 'Thoroughbred', 10, NULL, 'ZA', 'Cape Town', 'feeding_nutrition', 'Weight loss despite appetite.', 'low', 'nutrition-demo@lifeonhorse.internal', 'Anonymous', 'reviewing'),
      (NULL, 'Pony', NULL, NULL, 'PK', NULL, 'emergency', 'Colic signs — rolling, pawing.', 'emergency', 'emergency-demo@lifeonhorse.internal', NULL, 'new');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM user_stories WHERE title = 'My First Polo Season in Lahore') THEN
    INSERT INTO user_stories (author_id, title, content, photos, country, status, is_featured)
    VALUES
      (owner_id, 'My First Polo Season in Lahore', 'Joining Lahore Polo Club changed how I see teamwork on horseback.', '["/images/home/feature-community.jpg"]', 'PK', 'published', true),
      (owner_id, 'Rescuing a Pony in Delhi', 'We worked with a local NGO to rehome a market pony.', '["/images/demo/horse-3.jpg"]', 'IN', 'published', false);
  END IF;

  IF (SELECT count(*) FROM horse_gallery WHERE uploader_id = owner_id) < 4 THEN
    INSERT INTO horse_gallery (uploader_id, horse_name, breed, country, caption, image_url, status)
    SELECT owner_id, 'Demo Horse ' || n, CASE WHEN n % 2 = 0 THEN 'Arabian' ELSE 'Thoroughbred' END,
      (ARRAY['PK','IN','TR','ZA'])[n], 'Gallery demo ' || n, '/images/demo/horse-' || ((n - 1) % 5 + 1) || '.jpg', 'published'
    FROM generate_series(1,4) n;
  END IF;

  SELECT id INTO badge_early FROM badges WHERE slug = 'early-contributor';
  SELECT id INTO badge_seller FROM badges WHERE slug = 'verified-seller';
  INSERT INTO user_badges (user_id, badge_id) VALUES (owner_id, badge_early), (owner_id, badge_seller) ON CONFLICT DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM certificates WHERE user_id = owner_id AND title = 'Horse Care Fundamentals') THEN
    INSERT INTO certificates (user_id, title, description, issued_by) VALUES (owner_id, 'Horse Care Fundamentals', 'Completed demo course.', 'LifeOnHorse Academy');
  END IF;

  SELECT id INTO horse_id FROM horses WHERE slug = 'majestic-arabian-lahore';
  IF NOT EXISTS (SELECT 1 FROM inquiries WHERE sender_email = 'inquiry-demo@lifeonhorse.internal') THEN
    INSERT INTO inquiries (entity_type, entity_id, sender_name, sender_email, message, status)
    VALUES ('horse', horse_id, 'Ali Raza', 'inquiry-demo@lifeonhorse.internal', 'Is this mare still available?', 'new');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM reports WHERE reason = 'Suspicious pricing' AND entity_id = horse_id) THEN
    INSERT INTO reports (reporter_id, entity_type, entity_id, reason, details, status)
    VALUES (owner_id, 'horse', horse_id, 'Suspicious pricing', 'Demo moderation report.', 'pending');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM commission_records WHERE notes LIKE '%Demo commission%') THEN
    INSERT INTO commission_records (recorded_by, entity_type, entity_id, buyer_name, seller_name, amount, currency, commission_rate, commission_amount, notes)
    VALUES (owner_id, 'horse', horse_id, 'Demo Buyer', 'Demo Seller', 850000, 'PKR', 2.5, 21250, 'Demo commission record for admin dashboard.');
  END IF;
END $$;
