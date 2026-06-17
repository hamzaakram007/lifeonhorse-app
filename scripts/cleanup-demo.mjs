/**
 * Remove LifeOnHorse demo data via Supabase service role.
 * Run: node --env-file=.env.local scripts/cleanup-demo.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { DEMO_IDS, DEMO_USER_IDS } from "./demo-constants.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey || serviceKey.includes("your_") || serviceKey.startsWith("http")) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and valid SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function del(table, column, ids) {
  if (!ids?.length) return;
  const { error } = await supabase.from(table).delete().in(column, ids);
  if (error) console.warn(`  warn ${table}:`, error.message);
  else console.log(`  ✓ ${table}`);
}

async function main() {
  console.log("Cleaning LifeOnHorse demo data...\n");

  await del("favorites", "user_id", DEMO_USER_IDS);
  await del("reviews", "reviewer_id", DEMO_USER_IDS);
  await del("inquiries", "sender_id", DEMO_USER_IDS);
  await del("reports", "reporter_id", DEMO_USER_IDS);
  await del("commission_records", "id", ["df444444-4444-4444-8444-444444444601", "df444444-4444-4444-8444-444444444602"]);
  await del("featured_listing_requests", "id", ["df222222-2222-4222-8222-222222222401", "df222222-2222-4222-8222-222222222402"]);
  await del("orders", "id", ["df111111-1111-4111-8111-111111111301", "df111111-1111-4111-8111-111111111302"]);
  await del("subscriptions", "id", ["df333333-3333-4333-8333-333333333501"]);
  await del("health_requests", "id", DEMO_IDS.healthRequests);
  await del("events", "id", DEMO_IDS.events);
  await del("courses", "id", DEMO_IDS.courses);
  await del("blog_posts", "slug", DEMO_IDS.blogSlugs);
  await del("community_posts", "id", DEMO_IDS.community);
  await del("products", "id", DEMO_IDS.products);
  await del("services", "id", DEMO_IDS.services);
  await del("horses", "id", DEMO_IDS.horses);
  await del("clubs", "id", DEMO_IDS.clubs);
  await del("trainers", "id", DEMO_IDS.trainers);
  await del("experts", "id", DEMO_IDS.experts);
  await del("seller_profiles", "id", DEMO_IDS.sellers);
  await supabase.from("newsletter_subscribers").delete().eq("email", "newsletter@demo.lifeonhorse.com");

  for (const id of DEMO_USER_IDS) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) console.warn(`  warn auth user ${id}:`, error.message);
  }
  console.log("  ✓ auth.users (@demo.lifeonhorse.com)");

  console.log("\nDone. Demo content removed.");
}

main().catch((e) => { console.error(e); process.exit(1); });
