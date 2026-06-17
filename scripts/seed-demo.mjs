/**
 * LifeOnHorse professional demo seed — multi-persona content with fixed UUIDs.
 * Usage: npm run seed (after npm run seed:users)
 */
import { createClient } from "@supabase/supabase-js";
import {
  USERS,
  SELLERS,
  HORSES,
  CLUBS,
  TRAINERS,
  PRODUCTS,
  SERVICES,
  EVENTS,
  BLOG_POSTS,
  COURSES,
  COMMUNITY_POSTS,
  EXPERTS,
  DEMO_IDS,
} from "./demo-constants.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const uid = (key) => USERS[key]?.id;

const COUNTRY_NAMES = {
  PK: "Pakistan", IN: "India", AE: "United Arab Emirates", AR: "Argentina",
  GB: "United Kingdom", US: "United States", TM: "Turkmenistan", DE: "Germany",
  ZA: "South Africa", PT: "Portugal", MA: "Morocco",
};

async function ensureCountries() {
  const codes = new Set();
  for (const list of [HORSES, CLUBS, TRAINERS, PRODUCTS, SERVICES, EVENTS, COURSES, COMMUNITY_POSTS, EXPERTS]) {
    for (const item of list) {
      if (item.country) codes.add(item.country);
    }
  }
  for (const code of codes) {
    await supabase.from("countries").upsert(
      { code, name: COUNTRY_NAMES[code] ?? code },
      { onConflict: "code" }
    );
  }
}

async function upsertRow(table, row, onConflict = "id") {
  const { error } = await supabase.from(table).upsert(row, { onConflict });
  if (error) console.warn(`  ${table}:`, error.message);
  return !error;
}

async function seed() {
  console.log("Ensuring countries…");
  await ensureCountries();

  console.log("Seeding horses…");
  for (const h of HORSES) {
    await upsertRow("horses", {
      id: h.id,
      owner_id: uid(h.owner),
      title: h.title,
      description: `${h.breed} — ${h.discipline}. Exceptional bloodline, fully vetted and competition-ready.`,
      breed: h.breed,
      age: h.age,
      gender: h.gender,
      listing_type: h.listing_type ?? "sale",
      price: h.price,
      currency: h.currency,
      country_code: h.country,
      city: h.city,
      photos: h.photos,
      is_featured: h.featured ?? false,
      status: "published",
    });
  }

  console.log("Seeding clubs…");
  for (const c of CLUBS) {
    await upsertRow("clubs", {
      id: c.id,
      owner_id: uid(c.owner),
      name: c.name,
      description: c.description,
      club_type: c.club_type,
      country_code: c.country,
      city: c.city,
      logo_url: c.logo_url,
      photos: c.photos,
      member_count: c.member_count,
      is_featured: c.featured ?? false,
      is_verified: c.verified ?? false,
      status: "published",
    });
  }

  console.log("Seeding trainers…");
  for (const t of TRAINERS) {
    await supabase.from("trainers").upsert({
      id: t.id,
      user_id: uid(t.user),
      display_name: t.display_name,
      specialty: t.specialty,
      description: t.description,
      country_code: t.country,
      city: t.city,
      experience_years: t.experience_years,
      photos: t.photos,
      is_featured: t.featured ?? false,
      is_verified: t.verified ?? false,
      status: "published",
    }, { onConflict: "user_id" });
  }

  console.log("Seeding seller profiles…");
  for (const s of Object.values(SELLERS)) {
    await upsertRow("seller_profiles", {
      id: s.id,
      user_id: uid(s.user),
      business_name: s.name,
      description: `Verified seller — ${s.name}`,
      country_code: USERS[s.user]?.country,
      city: USERS[s.user]?.city,
      is_verified: s.verified ?? false,
      status: "published",
    });
  }

  console.log("Seeding products & services…");
  for (const p of PRODUCTS) {
    await upsertRow("products", {
      id: p.id,
      seller_id: SELLERS[p.seller].id,
      title: p.title,
      description: p.description,
      price: p.price,
      currency: p.currency,
      category: p.category,
      country_code: p.country,
      photos: p.photos,
      is_featured: p.featured ?? false,
      status: "published",
    });
  }
  for (const s of SERVICES) {
    await upsertRow("services", {
      id: s.id,
      seller_id: SELLERS[s.seller].id,
      title: s.title,
      description: s.description,
      price: s.price,
      currency: s.currency,
      category: s.category,
      country_code: s.country,
      photos: s.photos,
      is_featured: s.featured ?? false,
      status: "published",
    });
  }

  console.log("Seeding events…");
  for (const e of EVENTS) {
    await upsertRow("events", {
      id: e.id,
      host_id: uid(e.host),
      title: e.title,
      description: e.description,
      event_type: e.event_type,
      country_code: e.country,
      city: e.city,
      start_date: new Date(Date.now() + e.daysFromNow * 86400000).toISOString(),
      photos: e.photos,
      is_featured: e.featured ?? false,
      status: "published",
    });
  }

  console.log("Seeding blog posts…");
  for (const b of BLOG_POSTS) {
    await upsertRow("blog_posts", {
      author_id: uid(b.author),
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      category: b.category,
      cover_image: b.cover,
      is_featured: b.featured ?? false,
      status: "published",
      published_at: new Date().toISOString(),
    }, "slug");
  }

  console.log("Seeding courses…");
  for (const c of COURSES) {
    await upsertRow("courses", {
      id: c.id,
      creator_id: uid(c.creator),
      title: c.title,
      description: c.description,
      category: c.category,
      cover_image: c.cover,
      is_free: c.free ?? false,
      price: c.price,
      currency: c.currency,
      is_featured: c.featured ?? false,
      status: "published",
    });
  }

  console.log("Seeding community posts…");
  for (const p of COMMUNITY_POSTS) {
    await upsertRow("community_posts", {
      id: p.id,
      author_id: uid(p.author),
      title: p.title,
      content: p.content,
      photos: p.photos,
      status: "published",
    });
  }

  console.log("Seeding experts…");
  for (const e of EXPERTS) {
    await supabase.from("experts").upsert({
      id: e.id,
      user_id: uid(e.user),
      display_name: e.display_name,
      specialty: e.specialty,
      description: e.description,
      country_code: e.country,
      city: e.city,
      photos: e.photos,
      is_featured: e.featured ?? false,
      is_verified: e.verified ?? false,
      status: "published",
    }, { onConflict: "user_id" });
  }

  console.log("Seeding health requests…");
  for (const [i, req] of DEMO_IDS.healthRequests.entries()) {
    await upsertRow("health_requests", {
      id: req,
      user_id: uid(["vet", "community", "breeder"][i]),
      horse_name: ["Star", "Thunder", "Buddy"][i],
      issue_description: [
        "Intermittent lameness in near fore, worse on hard ground.",
        "Weight loss despite normal appetite; coat dull.",
        "Colic signs — rolling, pawing, no manure since morning.",
      ][i],
      urgency: ["normal", "low", "emergency"][i],
      country_code: ["GB", "US", "PK"][i],
      status: "open",
      disclaimer_accepted: true,
    });
  }

  const tables = ["horses", "clubs", "trainers", "seller_profiles", "products", "services", "events", "blog_posts", "courses", "community_posts", "experts", "health_requests"];
  const counts = {};
  for (const t of tables) {
    const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
    counts[t] = count ?? 0;
  }

  console.log("\nProfessional demo seed complete. Row counts:");
  console.table(counts);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
