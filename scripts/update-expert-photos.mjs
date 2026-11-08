/**
 * One-shot: point live experts.photos at owned /images/demo/expert-*.jpg paths.
 * Prefers Management API when SUPABASE_ACCESS_TOKEN is set; otherwise PostgREST
 * service role (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/update-expert-photos.mjs
 *   npm run seed:expert-photos
 */
const PROJECT_REF = "ebgzqmnewtdippegphou";
const MGMT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

/** Demo seed expert IDs. */
const EXPERT_IMGS = {
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01": "/images/demo/expert-vet.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02": "/images/demo/expert-dressage.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb03": "/images/demo/expert-nutrition.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb04": "/images/demo/expert-farrier.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb05": "/images/demo/expert-dental.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb06": "/images/demo/expert-reproduction.jpg",
};

/** Title/name fallback when IDs differ across environments (live extras). */
const BY_NAME = {
  "Dr. James Whitfield": "/images/demo/expert-vet.jpg",
  "Sarah Mitchell": "/images/demo/expert-dressage.jpg",
  "Dr. Priya Sharma": "/images/demo/expert-nutrition.jpg",
  "Ahmed Farooq": "/images/demo/expert-farrier.jpg",
  "Dr. Maria Santos": "/images/demo/expert-dental.jpg",
  "Dr. Khalid Al-Rashid": "/images/demo/expert-reproduction.jpg",
  "Dr. Sana Malik": "/images/demo/expert-clinic.jpg",
  "Dr. Mark Hughes": "/images/demo/expert-rehab.jpg",
  "Dr. Elena Rossi": "/images/demo/expert-lameness.jpg",
  "Dr. Sofia Ahmed": "/images/demo/expert-behavior.jpg",
};

function sqlLit(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function buildStatements() {
  const stmts = [];
  for (const [id, img] of Object.entries(EXPERT_IMGS)) {
    const arr = JSON.stringify([img]);
    stmts.push(
      `UPDATE experts SET photos = ${sqlLit(arr)}::jsonb WHERE id = ${sqlLit(id)}`,
    );
  }
  for (const [name, img] of Object.entries(BY_NAME)) {
    const arr = JSON.stringify([img]);
    stmts.push(
      `UPDATE experts SET photos = ${sqlLit(arr)}::jsonb WHERE display_name = ${sqlLit(name)}`,
    );
  }
  stmts.push(
    `UPDATE experts SET photos = '["/images/fallback-empty.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%'`,
  );
  return stmts;
}

async function viaManagement(token, stmts) {
  let ok = 0;
  for (const query of stmts) {
    const res = await fetch(MGMT, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Management API ${res.status}: ${body.slice(0, 200)}`);
    }
    ok += 1;
  }
  return ok;
}

async function viaServiceRole() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Need SUPABASE_ACCESS_TOKEN or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  let ok = 0;
  for (const [id, img] of Object.entries(EXPERT_IMGS)) {
    const { error } = await supabase.from("experts").update({ photos: [img] }).eq("id", id);
    if (error) console.warn("experts id", id, error.message);
    else ok += 1;
  }
  for (const [name, img] of Object.entries(BY_NAME)) {
    const { error } = await supabase
      .from("experts")
      .update({ photos: [img] })
      .eq("display_name", name);
    if (error) console.warn("experts name", name, error.message);
    else ok += 1;
  }
  return ok;
}

async function main() {
  const stmts = buildStatements();
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const count = token ? await viaManagement(token, stmts) : await viaServiceRole();
  console.log(`Updated expert imagery (${count} statements).`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
