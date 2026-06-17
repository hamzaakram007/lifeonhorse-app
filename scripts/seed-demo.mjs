/**
 * LifeOnHorse demo seed — idempotent upserts via service role.
 * Usage (from lifeonhorse-app):
 *   node --env-file=.env.local scripts/seed-demo.mjs
 * Or: ADMIN_USER_ID=<uuid> node scripts/seed-demo.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
let ownerId = process.env.ADMIN_USER_ID;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

/** Stable placeholder images (no local files required) */
const img = {
  horse: (n) => `https://images.unsplash.com/photo-1553284965-83fd3e82fa5${n}?w=800&h=600&fit=crop`,
  club: (n) => `https://images.unsplash.com/photo-150978323021${n}?w=800&h=600&fit=crop`,
  trainer: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&h=600&fit=crop",
  event: "https://images.unsplash.com/photo-1516734212184-a967f81ad0d8?w=800&h=600&fit=crop",
  product: (n) => `https://images.unsplash.com/photo-1568572938562-${n}?w=800&h=600&fit=crop`,
  service: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  expert: "https://images.unsplash.com/photo-1629909613654-28e377b37d2b?w=800&h=600&fit=crop",
  gallery: (n) => `https://picsum.photos/seed/loh-gallery-${n}/600/600`,
  blog: "https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=1200&h=630&fit=crop",
  story: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
};

const DEMO_USERS = [
  { email: "demo-seller-tack@lifeonhorse.internal", password: "DemoSeed2026!", meta: { full_name: "Karachi Tack House" } },
  { email: "demo-seller-feed@lifeonhorse.internal", password: "DemoSeed2026!", meta: { full_name: "Cape Feed & Supplements" } },
  { email: "demo-expert-vet@lifeonhorse.internal", password: "DemoSeed2026!", meta: { full_name: "Dr. Ayşe Yılmaz" } },
  { email: "demo-expert-farrier@lifeonhorse.internal", password: "DemoSeed2026!", meta: { full_name: "James Ndlovu" } },
];

async function resolveOwnerId() {
  if (ownerId) return ownerId;
  const { data: profiles } = await supabase.from("profiles").select("id").order("created_at").limit(1);
  if (profiles?.[0]?.id) {
    ownerId = profiles[0].id;
    console.log("Using first profile as owner:", ownerId);
    return ownerId;
  }
  console.error("No profiles found. Sign up once or set ADMIN_USER_ID.");
  process.exit(1);
}

async function ensureDemoUsers() {
  const ids = [];
  for (const u of DEMO_USERS) {
    const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const found = existing?.users?.find((x) => x.email === u.email);
    if (found) {
      ids.push(found.id);
      continue;
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: u.meta,
    });
    if (error) {
      console.warn("createUser", u.email, error.message);
      continue;
    }
    ids.push(data.user.id);
  }
  return ids;
}

async function upsert(table, rows, onConflict = "slug") {
  for (const row of rows) {
    const { error } = await supabase.from(table).upsert(row, { onConflict });
    if (error) console.warn(`${table}:`, row.slug ?? row.title ?? row.name, error.message);
  }
}

async function seed() {
  const owner = await resolveOwnerId();
  const extraUserIds = await ensureDemoUsers();
  const [sellerUser2, sellerUser3, expertUser1, expertUser2] = extraUserIds;

  await supabase.from("profiles").update({ role: "admin", is_verified: true, country: "PK", city: "Lahore" }).eq("id", owner);

  const horses = [
    { title: "Majestic Arabian — Lahore", slug: "majestic-arabian-lahore", breed: "Arabian", age: 6, gender: "Mare", listing_type: "sale", price: 850000, currency: "PKR", country: "PK", city: "Lahore", photos: [img.horse(1), img.horse(2)], is_featured: true, is_verified: true, description: "Registered Arabian mare, excellent temperament, competition-ready." },
    { title: "Thoroughbred Gelding — Cape Town", slug: "thoroughbred-cape-town", breed: "Thoroughbred", age: 8, gender: "Gelding", listing_type: "sale", price: 120000, currency: "ZAR", country: "ZA", city: "Cape Town", photos: [img.horse(3)], is_featured: true, description: "Sound gelding for polo and leisure riding." },
    { title: "Rescue Pony — Adoption", slug: "rescue-pony-adoption", breed: "Pony", age: 4, listing_type: "adoption", country: "IN", city: "Delhi", photos: [img.horse(4)], description: "Gentle pony seeking a caring home. Health checked by local vet." },
    { title: "Akhal-Teke Stallion — Ashgabat", slug: "akhal-teke-stallion", breed: "Akhal-Teke", age: 9, gender: "Stallion", listing_type: "stud", price: 45000, currency: "USD", country: "TM", city: "Ashgabat", photos: [img.horse(5)], is_featured: true, is_verified: true },
    { title: "Warmblood Mare — Istanbul", slug: "warmblood-istanbul", breed: "Warmblood", age: 7, gender: "Mare", listing_type: "lease", price: 15000, currency: "TRY", country: "TR", city: "Istanbul", photos: [img.horse(6)], description: "Monthly lease for show jumping training." },
  ].map((h) => ({ ...h, owner_id: owner, status: "published" }));

  const clubs = [
    { name: "Lahore Polo & Equestrian Club", slug: "lahore-polo-club", club_type: "polo", country: "PK", city: "Lahore", logo_url: img.club(1), photos: [img.club(1), img.club(2)], member_count: 120, horse_count: 45, is_featured: true, is_verified: true, training_available: true },
    { name: "Istanbul Riding Academy", slug: "istanbul-riding-academy", club_type: "riding_school", country: "TR", city: "Istanbul", logo_url: img.club(3), photos: [img.club(3)], member_count: 85, is_featured: true, membership_available: true },
    { name: "Baku Cultural Horse Society", slug: "baku-cultural-horse", club_type: "cultural", country: "AZ", city: "Baku", photos: [img.club(4)], member_count: 40 },
    { name: "Mumbai Equestrian Centre", slug: "mumbai-equestrian-centre", club_type: "equestrian_sports", country: "IN", city: "Mumbai", photos: [img.club(5)], horse_count: 30, training_available: true },
  ].map((c) => ({ ...c, owner_id: owner, status: "published", description: "Demo club profile for LifeOnHorse launch regions." }));

  const trainers = [
    { display_name: "Ahmed Khan — Polo Coach", slug: "ahmed-polo-coach", trainer_type: "polo", country: "PK", city: "Lahore", experience_years: 15, photos: [img.trainer], is_verified: true, specialties: ["polo", "stick_and_ball"] },
    { display_name: "Priya Sharma — Riding Instructor", slug: "priya-riding-instructor", trainer_type: "riding", country: "IN", city: "Mumbai", experience_years: 10, photos: [img.trainer] },
    { display_name: "Mehmet Demir — Farrier", slug: "mehmet-demir-farrier", trainer_type: "farrier", country: "TR", city: "Ankara", experience_years: 12, is_verified: true },
  ].map((t) => ({ ...t, user_id: owner, status: "published", bio: "Experienced professional available for clinics and private sessions." }));

  const events = [
    { title: "Spring Polo Tournament — Lahore", slug: "spring-polo-lahore", event_type: "polo_match", country: "PK", city: "Lahore", start_date: new Date(Date.now() + 30 * 86400000).toISOString(), photos: [img.event], is_featured: true },
    { title: "Istanbul Horse Show 2026", slug: "istanbul-horse-show-2026", event_type: "horse_show", country: "TR", city: "Istanbul", start_date: new Date(Date.now() + 60 * 86400000).toISOString(), photos: [img.event] },
    { title: "Delhi Riding Camp — Beginners", slug: "delhi-riding-camp", event_type: "riding_camp", country: "IN", city: "Delhi", start_date: new Date(Date.now() + 14 * 86400000).toISOString() },
  ].map((e) => ({ ...e, host_id: owner, status: "published", description: "Demo event — register via contact details on listing." }));

  await upsert("horses", horses);
  await upsert("clubs", clubs);
  await upsert("trainers", trainers);
  await upsert("events", events);

  const { data: cats } = await supabase.from("blog_categories").select("id, slug");
  const catBySlug = Object.fromEntries((cats ?? []).map((c) => [c.slug, c.id]));

  const blogPosts = [
    { title: "Buying Horses Safely in South Asia", slug: "buying-horses-safely-south-asia", excerpt: "Essential tips for first-time buyers.", category_id: catBySlug["marketplace-safety"], cover_image: img.blog, is_featured: true },
    { title: "Polo Training Basics for New Riders", slug: "polo-training-basics", excerpt: "Stick work, rules, and fitness.", category_id: catBySlug["training"], cover_image: img.blog },
    { title: "Horse Culture in Azerbaijan", slug: "horse-culture-azerbaijan", excerpt: "Traditions and modern clubs.", category_id: catBySlug["country-culture"], cover_image: img.blog },
  ].map((p) => ({
    ...p,
    author_id: owner,
    content: `${p.excerpt}\n\nThis is demo content for the LifeOnHorse launch. Always verify health records and meet sellers in person.`,
    status: "published",
  }));
  await upsert("blog_posts", blogPosts);

  await upsert("courses", [{
    creator_id: owner,
    title: "Horse Care Basics",
    slug: "horse-care-basics",
    category: "Horse Care",
    description: "Feeding, grooming, and stable management fundamentals.",
    thumbnail_url: img.horse(1),
    is_free: true,
    status: "published",
    is_featured: true,
  }, {
    creator_id: owner,
    title: "Introduction to Polo",
    slug: "introduction-to-polo",
    category: "Training",
    description: "Rules, equipment, and beginner drills.",
    is_free: false,
    price: 2500,
    currency: "PKR",
    status: "published",
  }]);

  const { data: course } = await supabase.from("courses").select("id").eq("slug", "horse-care-basics").single();
  if (course) {
    await supabase.from("lessons").delete().eq("course_id", course.id);
    await supabase.from("lessons").insert([
      { course_id: course.id, title: "Daily feeding routine", order_index: 0, content: "Hay, grains, and fresh water schedules for temperate climates." },
      { course_id: course.id, title: "Grooming essentials", order_index: 1, content: "Brush, hoof pick, and coat care before and after riding." },
      { course_id: course.id, title: "Stable safety checklist", order_index: 2, content: "Fire safety, fencing, and turnout protocols." },
    ]);
  }

  const sellers = [
    { user_id: owner, slug: "lahore-premier-tack", seller_type: "tack_shop", business_name: "Lahore Premier Tack", country: "PK", city: "Lahore", logo_url: img.product(1), product_categories: ["saddles", "bridles", "helmets"], is_verified: true, is_featured: true, description: "Quality tack and riding apparel since 1998." },
  ];
  if (sellerUser2) sellers.push({ user_id: sellerUser2, slug: "karachi-tack-house", seller_type: "tack_shop", business_name: "Karachi Tack House", country: "PK", city: "Karachi", logo_url: img.product(2), is_verified: true, description: "Imported and local tack specialists." });
  if (sellerUser3) sellers.push({ user_id: sellerUser3, slug: "cape-feed-supplements", seller_type: "feed_supplier", business_name: "Cape Feed & Supplements", country: "ZA", city: "Cape Town", logo_url: img.product(3), is_featured: true, description: "Feed, salt blocks, and equine supplements." });
  await upsert("sellers", sellers.map((s) => ({ ...s, status: "published" })));

  const { data: sellerRows } = await supabase.from("sellers").select("id, slug");
  const sellerBySlug = Object.fromEntries((sellerRows ?? []).map((s) => [s.slug, s.id]));

  const products = [
    { seller_id: sellerBySlug["lahore-premier-tack"], title: "English All-Purpose Saddle", slug: "english-ap-saddle", category: "saddles", price: 45000, currency: "PKR", country: "PK", photos: [img.product(10)], stock_status: "in_stock", is_featured: true },
    { seller_id: sellerBySlug["lahore-premier-tack"], title: "Leather Bridle Set", slug: "leather-bridle-set", category: "bridles", price: 12000, currency: "PKR", country: "PK", photos: [img.product(11)], stock_status: "in_stock" },
    { seller_id: sellerBySlug["karachi-tack-house"], title: "Riding Helmet — ASTM", slug: "riding-helmet-astm", category: "helmets", price: 8500, currency: "PKR", country: "PK", photos: [img.product(12)], is_verified: true },
    { seller_id: sellerBySlug["cape-feed-supplements"], title: "Equine Mineral Salt Block", slug: "mineral-salt-block", category: "salt_blocks", price: 350, currency: "ZAR", country: "ZA", photos: [img.product(13)], stock_status: "in_stock", is_featured: true },
    { seller_id: sellerBySlug["cape-feed-supplements"], title: "Premium Alfalfa Hay Bale", slug: "alfalfa-hay-bale", category: "feed", price: 280, currency: "ZAR", country: "ZA", photos: [img.product(14)] },
  ].filter((p) => p.seller_id).map((p) => ({ ...p, status: "published", description: "Demo product listing with remote placeholder image." }));
  await upsert("products", products);

  const services = [
    { seller_id: sellerBySlug["lahore-premier-tack"], title: "Horse Transport — Punjab", slug: "horse-transport-punjab", category: "transport", country: "PK", city: "Lahore", photos: [img.service], pricing_model: "quote", pricing_details: "From PKR 8,000 depending on distance", is_featured: true },
    { seller_id: sellerBySlug["karachi-tack-house"], title: "Mobile Farrier — Karachi", slug: "mobile-farrier-karachi", category: "farrier", country: "PK", city: "Karachi", photos: [img.service], pricing_model: "per_visit", pricing_details: "PKR 4,500 per horse" },
    { seller_id: sellerBySlug["cape-feed-supplements"], title: "Stable Management Consultation", slug: "stable-management-consult", category: "stable_management", country: "ZA", city: "Cape Town", photos: [img.service], pricing_model: "hourly", pricing_details: "ZAR 800/hour" },
  ].filter((s) => s.seller_id).map((s) => ({ ...s, status: "published", description: "Professional demo service listing." }));
  await upsert("marketplace_services", services);

  const experts = [
    { user_id: owner, slug: "dr-sana-equine-vet-lahore", name: "Dr. Sana Malik", category: "vet", country: "PK", city: "Lahore", clinic_name: "Equine Care Lahore", avatar_url: img.expert, specialization: "Lameness, vaccinations", online_consultation: true, is_verified: true, is_featured: true, bio: "15 years treating sport horses across Punjab." },
  ];
  if (expertUser1) experts.push({ user_id: expertUser1, slug: "dr-ayse-yilmaz-vet", name: "Dr. Ayşe Yılmaz", category: "vet", country: "TR", city: "Istanbul", clinic_name: "Bosphorus Equine Clinic", avatar_url: img.expert, emergency_available: true, is_verified: true, bio: "Emergency and routine equine medicine." });
  if (expertUser2) experts.push({ user_id: expertUser2, slug: "james-ndlovu-farrier", name: "James Ndlovu", category: "farrier", country: "ZA", city: "Johannesburg", avatar_url: img.expert, specialization: "Hot shoeing, corrective work", service_area: "Gauteng & Western Cape", is_featured: true, bio: "Certified farrier serving polo and racing yards." });
  await upsert("experts", experts.map((e) => ({ ...e, status: "published" })));

  await supabase.from("health_requests").upsert([
    { user_id: owner, horse_breed: "Arabian", horse_age: 6, horse_gender: "Mare", country: "PK", city: "Lahore", problem_type: "hoof_problem", symptoms: "Intermittent lameness in near fore, worse on hard ground.", urgency: "normal", contact_email: "demo-health@lifeonhorse.internal", contact_name: "Demo Owner", status: "new" },
    { horse_breed: "Thoroughbred", horse_age: 10, country: "ZA", city: "Cape Town", problem_type: "feeding_nutrition", symptoms: "Weight loss despite normal appetite; coat dull.", urgency: "low", contact_email: "nutrition-demo@lifeonhorse.internal", contact_name: "Anonymous", status: "reviewing" },
    { horse_breed: "Pony", problem_type: "emergency", symptoms: "Colic signs — rolling, pawing, no manure since morning.", urgency: "emergency", contact_email: "emergency-demo@lifeonhorse.internal", contact_phone: "+92000000000", country: "PK", status: "new" },
  ], { onConflict: "id", ignoreDuplicates: true });

  const stories = [
    { author_id: owner, title: "My First Polo Season in Lahore", content: "Joining Lahore Polo Club changed how I see teamwork on horseback...", photos: [img.story], country: "PK", is_featured: true },
    { author_id: owner, title: "Rescuing a Pony in Delhi", content: "We found this pony at a market and worked with a local NGO to rehome him.", photos: [img.story], country: "IN" },
  ].map((s) => ({ ...s, status: "published" }));
  for (const s of stories) {
    const { error } = await supabase.from("user_stories").insert(s);
    if (error && !error.message.includes("duplicate")) console.warn("user_stories:", error.message);
  }

  const gallery = [1, 2, 3, 4].map((n) => ({
    uploader_id: owner,
    horse_name: `Demo Horse ${n}`,
    breed: n % 2 ? "Arabian" : "Thoroughbred",
    country: ["PK", "IN", "TR", "ZA"][n - 1],
    caption: `Gallery demo photo ${n}`,
    image_url: img.gallery(n),
    status: "published",
  }));
  for (const g of gallery) {
    const { error } = await supabase.from("horse_gallery").insert(g);
    if (error && !error.message.includes("duplicate")) console.warn("horse_gallery:", error.message);
  }

  const { data: badges } = await supabase.from("badges").select("id, slug");
  const badgeMap = Object.fromEntries((badges ?? []).map((b) => [b.slug, b.id]));
  if (badgeMap["early-contributor"]) {
    await supabase.from("user_badges").upsert({ user_id: owner, badge_id: badgeMap["early-contributor"] }, { onConflict: "user_id,badge_id" });
  }
  if (badgeMap["verified-seller"]) {
    await supabase.from("user_badges").upsert({ user_id: owner, badge_id: badgeMap["verified-seller"] }, { onConflict: "user_id,badge_id" });
  }

  await supabase.from("certificates").upsert({
    user_id: owner,
    title: "Horse Care Fundamentals",
    description: "Completed LifeOnHorse demo course module.",
    issued_by: "LifeOnHorse Academy",
  }, { onConflict: "id", ignoreDuplicates: true });

  const { data: horseRow } = await supabase.from("horses").select("id").eq("slug", "majestic-arabian-lahore").single();
  if (horseRow) {
    await supabase.from("inquiries").insert([
      { entity_type: "horse", entity_id: horseRow.id, sender_name: "Ali Raza", sender_email: "inquiry-demo@lifeonhorse.internal", message: "Is this mare still available? Can I schedule a viewing in Lahore?", status: "new" },
      { entity_type: "horse", entity_id: horseRow.id, sender_name: "Sara Khan", sender_email: "sara-demo@lifeonhorse.internal", sender_phone: "+923001234567", message: "Interested in vet report and price negotiation.", status: "read" },
    ]);
    await supabase.from("reports").insert([
      { reporter_id: owner, entity_type: "horse", entity_id: horseRow.id, reason: "Suspicious pricing", details: "Demo report for admin moderation queue.", status: "pending" },
    ]);
    await supabase.from("commission_records").insert({
      recorded_by: owner,
      entity_type: "horse",
      entity_id: horseRow.id,
      buyer_name: "Demo Buyer",
      seller_name: "Demo Seller",
      amount: 850000,
      currency: "PKR",
      commission_rate: 2.5,
      commission_amount: 21250,
      notes: "Demo commission record for admin dashboard.",
    });
  }

  const counts = {};
  for (const table of ["horses", "clubs", "trainers", "events", "courses", "blog_posts", "sellers", "products", "marketplace_services", "experts", "health_requests", "user_stories", "horse_gallery", "inquiries", "reports", "commission_records", "lessons"]) {
    const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
    counts[table] = count ?? 0;
  }

  console.log("\nDemo seed complete. Row counts:");
  console.table(counts);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
