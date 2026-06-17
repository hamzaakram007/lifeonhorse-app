/**
 * Create demo auth users and profiles for LifeOnHorse staging.
 * Usage: npm run seed:users
 */
import { createClient } from "@supabase/supabase-js";
import { USERS, DEMO_PASSWORD } from "./demo-constants.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const COUNTRY_NAMES = {
  PK: "Pakistan", IN: "India", AE: "United Arab Emirates", AR: "Argentina",
  GB: "United Kingdom", US: "United States", TM: "Turkmenistan", DE: "Germany",
  ZA: "South Africa", PT: "Portugal", MA: "Morocco",
};

async function ensureCountries() {
  const codes = [...new Set(Object.values(USERS).map((u) => u.country))];
  for (const code of codes) {
    const { error } = await supabase.from("countries").upsert(
      { code, name: COUNTRY_NAMES[code] ?? code },
      { onConflict: "code" }
    );
    if (error) console.warn(`  countries ${code}:`, error.message);
  }
}

async function seedUser(user) {
  const { data: existing } = await supabase.auth.admin.getUserById(user.id);
  if (existing?.user) {
    console.log(`  skip ${user.email} (exists)`);
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      country_code: user.country,
      city: user.city,
    }, { onConflict: "id" });
    return;
  }

  const { error } = await supabase.auth.admin.createUser({
    id: user.id,
    email: user.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: user.full_name },
  });

  if (error) {
    console.warn(`  ${user.email}:`, error.message);
    return;
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    country_code: user.country,
    city: user.city,
  }, { onConflict: "id" });

  console.log(`  ✓ ${user.email} (${user.role})`);
}

async function main() {
  console.log("Ensuring countries…");
  await ensureCountries();
  console.log("Creating demo users…");
  for (const user of Object.values(USERS)) {
    await seedUser(user);
  }
  console.log("\nDemo users ready. Password:", DEMO_PASSWORD);
}

main().catch((e) => { console.error(e); process.exit(1); });
