-- Remap remaining Unsplash/Picsum photos → owned local paths.
-- Applied live via Management API (scripts/update-remaining-photos.mjs). Project: ebgzqmnewtdippegphou.
-- Do not run as migration 004.

-- Horses
UPDATE horses SET photos = '["/images/demo/horse-1.jpg","/images/demo/horse-2.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222201';
UPDATE horses SET photos = '["/images/demo/horse-1.jpg","/images/demo/horse-5.jpg"]'::jsonb WHERE id = 'fc327ebb-ffcc-4fc1-8b84-9a9db1949058';
UPDATE horses SET photos = '["/images/demo/horse-2.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222202';
UPDATE horses SET photos = '["/images/demo/horse-2.jpg","/images/demo/horse-3.jpg"]'::jsonb WHERE id = '11375166-7d1c-40d9-a2b8-7049aa469f77';
UPDATE horses SET photos = '["/images/demo/horse-4.jpg","/images/demo/horse-1.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222203';
UPDATE horses SET photos = '["/images/demo/horse-4.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222215';
UPDATE horses SET photos = '["/images/demo/horse-5.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222204';
UPDATE horses SET photos = '["/images/demo/horse-3.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222205';
UPDATE horses SET photos = '["/images/demo/horse-3.jpg","/images/demo/horse-5.jpg"]'::jsonb WHERE id = 'e6990232-45a5-4b26-b033-568dafa85e45';
UPDATE horses SET photos = '["/images/demo/horse-2.jpg","/images/demo/horse-4.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222206';
UPDATE horses SET photos = '["/images/demo/horse-2.jpg","/images/demo/horse-1.jpg"]'::jsonb WHERE id = 'f8dbfdae-03b6-4c37-8fea-84c0873c2c25';
UPDATE horses SET photos = '["/images/demo/horse-5.jpg","/images/demo/horse-2.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222207';
UPDATE horses SET photos = '["/images/demo/horse-3.jpg","/images/demo/horse-4.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222208';
UPDATE horses SET photos = '["/images/demo/horse-3.jpg"]'::jsonb WHERE id = '9041d14d-ffd4-4d33-a7f8-18f89e015f10';
UPDATE horses SET photos = '["/images/demo/horse-4.jpg","/images/demo/horse-5.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222209';
UPDATE horses SET photos = '["/images/demo/horse-1.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222210';
UPDATE horses SET photos = '["/images/demo/horse-5.jpg","/images/demo/horse-3.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222211';
UPDATE horses SET photos = '["/images/demo/horse-2.jpg","/images/demo/horse-5.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222212';
UPDATE horses SET photos = '["/images/demo/horse-1.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222213';
UPDATE horses SET photos = '["/images/demo/horse-3.jpg","/images/demo/horse-1.jpg"]'::jsonb WHERE id = 'd2222222-2222-4222-8222-222222222214';
UPDATE horses SET photos = '["/images/demo/horse-3.jpg","/images/demo/horse-2.jpg"]'::jsonb WHERE id = '337a9cc9-f0f7-47ec-887a-2a90b0b09cec';
UPDATE horses SET photos = '["/images/demo/horse-4.jpg","/images/demo/horse-5.jpg"]'::jsonb WHERE id = 'f65fafc3-e534-4e06-85fe-551386c5dd2d';

-- Services
UPDATE services SET photos = '["/images/demo/service-1.jpg"]'::jsonb WHERE id = 'd5555555-5555-4555-8555-555555555501';
UPDATE services SET photos = '["/images/demo/service-1.jpg","/images/sections/services.jpg"]'::jsonb WHERE id = 'd7777777-7777-4777-8777-777777777701';
UPDATE services SET photos = '["/images/demo/service-1.jpg"]'::jsonb WHERE id = 'd7777777-7777-4777-8777-777777777702';
UPDATE services SET photos = '["/images/demo/service-1.jpg"]'::jsonb WHERE id = '90db432b-c020-43e8-8d26-a400e0db67a6';
UPDATE services SET photos = '["/images/demo/trainer-vet.jpg"]'::jsonb WHERE id IN ('d5555555-5555-4555-8555-555555555502','d7777777-7777-4777-8777-777777777703','ac16fbaa-7542-4e45-b368-7233be9e67ce');
UPDATE services SET photos = '["/images/demo/course-nutrition.jpg"]'::jsonb WHERE id = 'd5555555-5555-4555-8555-555555555503';
UPDATE services SET photos = '["/images/demo/club-breeding.jpg"]'::jsonb WHERE id = 'd5555555-5555-4555-8555-555555555504';
UPDATE services SET photos = '["/images/demo/event-1.jpg"]'::jsonb WHERE id IN ('d5555555-5555-4555-8555-555555555505','d7777777-7777-4777-8777-777777777704','d7c07159-10c2-4166-afc9-1f9a767ba6bf');
UPDATE services SET photos = '["/images/sections/marketplace.jpg"]'::jsonb WHERE id = 'd5555555-5555-4555-8555-555555555506';
UPDATE services SET photos = '["/images/demo/club-1.jpg"]'::jsonb WHERE id IN ('d7777777-7777-4777-8777-777777777705','d03dae80-a7da-47e3-b082-a003c400115b');
UPDATE services SET photos = '["/images/demo/product-saddle.jpg"]'::jsonb WHERE id = 'd7777777-7777-4777-8777-777777777706';

-- Community
UPDATE community_posts SET photos = '["/images/demo/event-trail.jpg"]'::jsonb WHERE id = 'd97fd70c-1f92-4ec0-86a9-b960b0ba2130';
UPDATE community_posts SET photos = '["/images/demo/club-community.jpg"]'::jsonb WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd04';
UPDATE community_posts SET photos = '["/images/demo/event-trail.jpg","/images/demo/horse-2.jpg"]'::jsonb WHERE id = 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
UPDATE community_posts SET photos = '["/images/demo/service-1.jpg"]'::jsonb WHERE id = 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07';
UPDATE community_posts SET photos = '["/images/demo/expert-clinic.jpg","/images/demo/horse-1.jpg"]'::jsonb WHERE id = 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06';
UPDATE community_posts SET photos = '["/images/demo/horse-1.jpg","/images/demo/horse-4.jpg"]'::jsonb WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd08';
UPDATE community_posts SET photos = '["/images/demo/expert-vet.jpg","/images/demo/course-nutrition.jpg"]'::jsonb WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd10';
UPDATE community_posts SET photos = '["/images/demo/horse-2.jpg","/images/demo/event-trail.jpg"]'::jsonb WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd05';
UPDATE community_posts SET photos = '["/images/demo/event-polo.jpg","/images/demo/horse-5.jpg"]'::jsonb WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd06';
UPDATE community_posts SET photos = '["/images/demo/club-1.jpg","/images/demo/event-trail.jpg"]'::jsonb WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd07';
UPDATE community_posts SET photos = '["/images/demo/event-tent.jpg","/images/demo/horse-3.jpg"]'::jsonb WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd09';
UPDATE community_posts SET photos = '["/images/demo/course-dressage.jpg"]'::jsonb WHERE id IN ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05','c8cfa25e-15ee-4baf-bda5-29dc133984c4');
UPDATE community_posts SET photos = '["/images/demo/event-polo.jpg"]'::jsonb WHERE id IN ('daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02','dddddddd-dddd-4ddd-8ddd-dddddddddd01');
UPDATE community_posts SET photos = '["/images/demo/event-tent.jpg","/images/demo/horse-1.jpg"]'::jsonb WHERE id = 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03';
UPDATE community_posts SET photos = '["/images/demo/horse-3.jpg","/images/demo/horse-5.jpg"]'::jsonb WHERE id = 'f34a8aa6-2fd1-41d5-afa1-d1574034ea3a';
UPDATE community_posts SET photos = '["/images/demo/horse-1.jpg","/images/demo/club-breeding.jpg"]'::jsonb WHERE id = 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04';
UPDATE community_posts SET photos = '["/images/demo/course-nutrition.jpg"]'::jsonb WHERE id = 'daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa08';
UPDATE community_posts SET photos = '["/images/demo/horse-1.jpg"]'::jsonb WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd02';
UPDATE community_posts SET photos = '["/images/demo/horse-3.jpg","/images/demo/club-rescue.jpg"]'::jsonb WHERE id = '71ce8643-13b3-4308-8030-4e29f74e342c';
UPDATE community_posts SET photos = '["/images/demo/horse-5.jpg","/images/demo/event-trail.jpg"]'::jsonb WHERE id = '3bdfde07-eab7-4d9c-95b6-ddd9aa58f39d';
UPDATE community_posts SET photos = '["/images/demo/product-bridle.jpg"]'::jsonb WHERE id = 'c1c98888-aabb-4e44-8e26-aaaf96d34d45';
UPDATE community_posts SET photos = '["/images/demo/event-tent.jpg"]'::jsonb WHERE id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd03';

-- Sellers
UPDATE seller_profiles SET logo_url = '/images/demo/product-saddle.jpg', photos = '["/images/demo/product-saddle.jpg","/images/demo/product-bridle.jpg"]'::jsonb WHERE id = 'd3333333-3333-4333-8333-333333333301';
UPDATE seller_profiles SET logo_url = '/images/demo/product-feed.jpg', photos = '["/images/demo/product-feed.jpg","/images/demo/product-supplement.jpg"]'::jsonb WHERE id = 'd3333333-3333-4333-8333-333333333302';
UPDATE seller_profiles SET logo_url = '/images/demo/horse-1.jpg', photos = '["/images/demo/horse-1.jpg","/images/demo/club-breeding.jpg"]'::jsonb WHERE id = 'd3333333-3333-4333-8333-333333333303';
UPDATE seller_profiles SET logo_url = '/images/demo/service-1.jpg', photos = '["/images/demo/service-1.jpg","/images/sections/marketplace.jpg"]'::jsonb WHERE id = 'd3333333-3333-4333-8333-333333333304';
UPDATE seller_profiles SET logo_url = '/images/demo/product-mallet.jpg', photos = '["/images/demo/product-mallet.jpg","/images/demo/product-apparel.jpg"]'::jsonb WHERE id = 'd3333333-3333-4333-8333-333333333305';
UPDATE seller_profiles SET logo_url = '/images/demo/product-feed.jpg', photos = '["/images/demo/product-feed.jpg","/images/demo/product-supplement.jpg"]'::jsonb WHERE id = '5d84b2e8-3fa4-4949-b25d-dd6073265c74';

-- Sweep leftovers
UPDATE horses SET photos = '["/images/demo/horse-1.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%';
UPDATE services SET photos = '["/images/demo/service-1.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%';
UPDATE community_posts SET photos = '["/images/sections/community.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%';
UPDATE seller_profiles SET logo_url = '/images/sections/sellers.jpg', photos = '["/images/sections/sellers.jpg"]'::jsonb
WHERE logo_url ILIKE '%unsplash%' OR logo_url ILIKE '%picsum%' OR photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%';
UPDATE health_requests SET photos = '["/images/demo/expert-clinic.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%';
