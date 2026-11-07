-- One-shot: point blog_posts covers at owned local equestrian assets and normalize categories.
-- Run in Supabase SQL editor, or: npm run seed:blog-photos
-- Safe to re-run. Does not invent remote Unsplash URLs.

UPDATE blog_posts SET cover_image = '/images/blog/blog-tent-pegging-guide.jpg', category = 'guides' WHERE id = '0fd3fba2-0c9a-4573-a1ba-487e35c5f2f3';
UPDATE blog_posts SET cover_image = '/images/blog/blog-tent-pegging-guide.jpg', category = 'guides' WHERE title = 'Tent Pegging: A Complete Guide';

UPDATE blog_posts SET cover_image = '/images/blog/blog-buying-arabian.jpg', category = 'guides' WHERE id = '2d7a0b50-76f9-45ff-a7c9-7b9bb1caa22b';
UPDATE blog_posts SET cover_image = '/images/blog/blog-buying-arabian.jpg', category = 'guides' WHERE title = 'Buying Arabian Horses: Expert Advice';

UPDATE blog_posts SET cover_image = '/images/blog/blog-polo-training.jpg', category = 'training' WHERE id = 'f878d8ef-ba5b-426c-b18b-5b6e4d9cd842';
UPDATE blog_posts SET cover_image = '/images/blog/blog-polo-training.jpg', category = 'training' WHERE title = 'Polo Training Basics for New Riders';

UPDATE blog_posts SET cover_image = '/images/blog/blog-first-time-buyers.jpg', category = 'guides' WHERE id = 'a67da3d8-f209-461f-ac18-53f83a912e9f';
UPDATE blog_posts SET cover_image = '/images/blog/blog-first-time-buyers.jpg', category = 'guides' WHERE title = 'Essential Tips for First-Time Horse Buyers';

UPDATE blog_posts SET cover_image = '/images/blog/blog-argentine-polo.jpg', category = 'culture' WHERE id = 'e37e5f58-05d5-4664-9161-3097b1ab9a13';
UPDATE blog_posts SET cover_image = '/images/blog/blog-argentine-polo.jpg', category = 'culture' WHERE title = 'The Heritage of Argentine Polo';

UPDATE blog_posts SET cover_image = '/images/blog/blog-kentucky-horse-country.jpg', category = 'culture' WHERE id = '4038392f-6120-4815-b2e9-292aded05f97';
UPDATE blog_posts SET cover_image = '/images/blog/blog-kentucky-horse-country.jpg', category = 'culture' WHERE title = 'Kentucky: Heart of American Horse Country';

UPDATE blog_posts SET cover_image = '/images/blog/blog-buy-safely-2026.jpg', category = 'buying_guide' WHERE id = 'dcc11111-1111-4111-8111-111111111201';
UPDATE blog_posts SET cover_image = '/images/blog/blog-buy-safely-2026.jpg', category = 'buying_guide' WHERE title = 'How to Buy a Horse Safely in 2026';

UPDATE blog_posts SET cover_image = '/images/blog/blog-horse-show-prep.jpg', category = 'events' WHERE id = 'dcc88888-8888-4888-8888-888888888208';
UPDATE blog_posts SET cover_image = '/images/blog/blog-horse-show-prep.jpg', category = 'events' WHERE title = 'Preparing for a Horse Show';

UPDATE blog_posts SET cover_image = '/images/blog/blog-buy-south-asia.jpg', category = 'guides' WHERE id = '8c040ab9-7c31-4a3e-a6c8-12348d32cca1';
UPDATE blog_posts SET cover_image = '/images/blog/blog-buy-south-asia.jpg', category = 'guides' WHERE title = 'Buying Horses Safely in South Asia';

UPDATE blog_posts SET cover_image = '/images/blog/blog-young-riders.jpg', category = 'training' WHERE id = '4f0c3f45-77d7-4422-9355-ce9415283d7e';
UPDATE blog_posts SET cover_image = '/images/blog/blog-young-riders.jpg', category = 'training' WHERE title = 'Training Techniques for Young Riders';

UPDATE blog_posts SET cover_image = '/images/blog/blog-hoof-problems.jpg', category = 'health' WHERE id = '31169265-05e9-48ce-b7ba-f0b957d0361a';
UPDATE blog_posts SET cover_image = '/images/blog/blog-hoof-problems.jpg', category = 'health' WHERE title = 'A Guide to Common Hoof Problems';

UPDATE blog_posts SET cover_image = '/images/blog/blog-azerbaijan-culture.jpg', category = 'culture' WHERE id = '23105d72-2218-464f-acca-5c631f6beadf';
UPDATE blog_posts SET cover_image = '/images/blog/blog-azerbaijan-culture.jpg', category = 'culture' WHERE title = 'Horse Culture in Azerbaijan';

UPDATE blog_posts SET cover_image = '/images/blog/blog-dressage-grand-prix.jpg', category = 'training' WHERE id = '306204e0-0884-4f63-aff0-448f4a170a16';
UPDATE blog_posts SET cover_image = '/images/blog/blog-dressage-grand-prix.jpg', category = 'training' WHERE title = 'Dressage Training at Grand Prix Level';

UPDATE blog_posts SET cover_image = '/images/blog/blog-nutrition-hot.jpg', category = 'health' WHERE id = 'c9ae7063-5504-4227-bfc1-bc33763287b3';
UPDATE blog_posts SET cover_image = '/images/blog/blog-nutrition-hot.jpg', category = 'health' WHERE title = 'Equine Nutrition in Hot Climates';

UPDATE blog_posts SET cover_image = '/images/blog/blog-horse-transport.jpg', category = 'guides' WHERE id = '6e600243-5969-4258-91f8-751d5ad9c9d9';
UPDATE blog_posts SET cover_image = '/images/blog/blog-horse-transport.jpg', category = 'guides' WHERE title = 'International Horse Transport: Safety First';

UPDATE blog_posts SET cover_image = '/images/blog/blog-lameness.jpg', category = 'health' WHERE id = 'd95a1542-beeb-4bfe-9bb2-251786bf3355';
UPDATE blog_posts SET cover_image = '/images/blog/blog-lameness.jpg', category = 'health' WHERE title = 'Understanding Equine Lameness';

UPDATE blog_posts SET cover_image = '/images/blog/blog-polo-care.jpg', category = 'polo' WHERE id = 'dcc22222-2222-4222-8222-222222222202';
UPDATE blog_posts SET cover_image = '/images/blog/blog-polo-care.jpg', category = 'polo' WHERE title = 'Polo Horse Care Guide';

UPDATE blog_posts SET cover_image = '/images/blog/blog-tent-pegging-basics.jpg', category = 'tent_pegging' WHERE id = 'dcc33333-3333-4333-8333-333333333203';
UPDATE blog_posts SET cover_image = '/images/blog/blog-tent-pegging-basics.jpg', category = 'tent_pegging' WHERE title = 'Tent Pegging Basics for New Enthusiasts';

UPDATE blog_posts SET cover_image = '/images/blog/blog-health-warning-signs.jpg', category = 'health' WHERE id = 'dcc44444-4444-4444-8444-444444444204';
UPDATE blog_posts SET cover_image = '/images/blog/blog-health-warning-signs.jpg', category = 'health' WHERE title = 'Common Horse Health Warning Signs';

UPDATE blog_posts SET cover_image = '/images/blog/blog-saddle-choice.jpg', category = 'tack' WHERE id = 'dcc55555-5555-4555-8555-555555555205';
UPDATE blog_posts SET cover_image = '/images/blog/blog-saddle-choice.jpg', category = 'tack' WHERE title = 'Choosing the Right Saddle for Your Discipline';

UPDATE blog_posts SET cover_image = '/images/blog/blog-feeding-hot.jpg', category = 'nutrition' WHERE id = 'dcc66666-6666-4666-8666-666666666206';
UPDATE blog_posts SET cover_image = '/images/blog/blog-feeding-hot.jpg', category = 'nutrition' WHERE title = 'Feeding Horses in Hot Climates';

UPDATE blog_posts SET cover_image = '/images/blog/blog-building-trust.jpg', category = 'training' WHERE id = 'dcc77777-7777-4777-8777-777777777207';
UPDATE blog_posts SET cover_image = '/images/blog/blog-building-trust.jpg', category = 'training' WHERE title = 'Building Trust With a New Horse';

UPDATE blog_posts SET category = 'buying_guide' WHERE lower(category) IN ('buying guide', 'buying_guide');
UPDATE blog_posts SET category = 'events' WHERE lower(category) = 'events';
UPDATE blog_posts SET category = 'polo' WHERE lower(category) = 'polo';
UPDATE blog_posts SET category = 'tent_pegging' WHERE lower(category) IN ('tent pegging', 'tent_pegging');
UPDATE blog_posts SET category = 'health' WHERE lower(category) = 'health';
UPDATE blog_posts SET category = 'tack' WHERE lower(category) = 'tack';
UPDATE blog_posts SET category = 'nutrition' WHERE lower(category) = 'nutrition';
UPDATE blog_posts SET category = 'training' WHERE lower(category) = 'training';
UPDATE blog_posts SET category = 'culture' WHERE lower(category) = 'culture';
UPDATE blog_posts SET category = 'guides' WHERE lower(category) = 'guides';

UPDATE blog_posts SET cover_image = '/images/fallback-empty.jpg'
WHERE cover_image ILIKE '%unsplash%' OR cover_image ILIKE '%picsum%';
