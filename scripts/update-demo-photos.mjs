/**
 * One-shot: update live demo listing photos to owned /images/demo/... paths.
 * Prefers Management API when SUPABASE_ACCESS_TOKEN is set; otherwise uses
 * service role via PostgREST (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/update-demo-photos.mjs
 *   node --env-file=.env.local scripts/update-demo-photos.mjs
 */
const PROJECT_REF = "ebgzqmnewtdippegphou";
const MGMT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const CLUB_IMGS = {
  "d4444444-4444-4444-8444-444444444401": "/images/demo/club-polo.jpg",
  "d6666666-6666-4666-8666-666666666601": "/images/demo/event-polo.jpg",
  "d4444444-4444-4444-8444-444444444402": "/images/demo/club-tent.jpg",
  "d6666666-6666-4666-8666-666666666602": "/images/demo/event-tent.jpg",
  "d4444444-4444-4444-8444-444444444403": "/images/demo/club-riding.jpg",
  "d6666666-6666-4666-8666-666666666603": "/images/demo/course-dressage.jpg",
  "d4444444-4444-4444-8444-444444444404": "/images/demo/club-sports.jpg",
  "544cb6be-4210-4c81-8427-c6887f13ebbe": "/images/demo/club-1.jpg",
  "d4444444-4444-4444-8444-444444444405": "/images/demo/club-community.jpg",
  "de6c35f5-ce68-4f27-abd5-c61338ddcc61": "/images/sections/countries.jpg",
  "d4444444-4444-4444-8444-444444444406": "/images/demo/club-rescue.jpg",
  "d6666666-6666-4666-8666-666666666605": "/images/demo/horse-3.jpg",
  "7be1fb42-2b01-4316-84e2-7511f84d4eeb": "/images/sections/clubs.jpg",
  "633c9b47-ccae-4053-b16d-503923513e20": "/images/home/feature-horses.jpg",
  "d6666666-6666-4666-8666-666666666604": "/images/sections/events.jpg",
  "d6666666-6666-4666-8666-666666666606": "/images/demo/horse-1.jpg",
};

const TRAINER_IMGS = {
  "d5555555-5555-4555-8555-555555555501": { img: "/images/demo/trainer-dressage.jpg", name: "Sarah Mitchell" },
  "d5555555-5555-4555-8555-555555555502": { img: "/images/demo/trainer-polo.jpg", name: "Carlos Mendez" },
  "d5555555-5555-4555-8555-555555555503": { img: "/images/demo/trainer-tent.jpg", name: "Hassan Raza" },
  "d5555555-5555-4555-8555-555555555504": { img: "/images/demo/trainer-vet.jpg", name: "Dr. James Whitfield" },
  "d5555555-5555-4555-8555-555555555505": { img: "/images/demo/trainer-arabian.jpg", name: "Aisha Khan" },
  "d5555555-5555-4555-8555-555555555506": { img: "/images/demo/trainer-eventing.jpg", name: "Emma Rodriguez" },
  "7c293aff-6fc8-494a-8e8a-aac02abfdbc8": { img: "/images/demo/trainer-1.jpg", name: "James Ndlovu" },
  "d7777777-7777-4777-8777-777777777706": { img: "/images/home/feature-trainers.jpg" },
};

const EVENT_IMGS = {
  "d8888888-8888-4888-8888-888888888801": "/images/demo/event-polo.jpg",
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01": "/images/demo/club-polo.jpg",
  "ac9e4f52-7193-40e2-861f-5e4df5fda18d": "/images/sections/marketplace.jpg",
  "d8888888-8888-4888-8888-888888888802": "/images/demo/event-tent.jpg",
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02": "/images/demo/club-tent.jpg",
  "d8888888-8888-4888-8888-888888888803": "/images/demo/event-clinic.jpg",
  "d8888888-8888-4888-8888-888888888804": "/images/demo/event-auction.jpg",
  "d8888888-8888-4888-8888-888888888805": "/images/demo/event-trail.jpg",
  "0896d6d0-078f-49b6-bfc8-1e0666cbe0f6": "/images/sections/community.jpg",
  "d8888888-8888-4888-8888-888888888806": "/images/demo/event-health.jpg",
  "d50e226e-5c61-49c5-b5ff-76f6f9b51bce": "/images/demo/event-1.jpg",
  "6919859f-b738-43e7-b83a-fad6c5a9cc07": "/images/sections/courses.jpg",
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03": "/images/demo/course-1.jpg",
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04": "/images/home/about.jpg",
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05": "/images/sections/sellers.jpg",
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06": "/images/demo/club-rescue.jpg",
};

const COURSE_IMGS = {
  "d9999999-9999-4999-8999-999999999901": "/images/demo/course-dressage.jpg",
  "d9999999-9999-4999-8999-999999999902": "/images/demo/course-arabian.jpg",
  "d9999999-9999-4999-8999-999999999903": "/images/demo/course-firstaid.jpg",
  "8f19fda5-6103-40d8-8758-1edecbd74fc9": "/images/sections/health.jpg",
  "d9999999-9999-4999-8999-999999999904": "/images/demo/course-polo.jpg",
  "3cf9c8c6-9951-47e7-96e5-c58133e6f2c2": "/images/demo/event-polo.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb03": "/images/demo/trainer-polo.jpg",
  "d9999999-9999-4999-8999-999999999905": "/images/demo/course-nutrition.jpg",
  "d9999999-9999-4999-8999-999999999906": "/images/demo/course-tent.jpg",
  "24be22f1-da21-4d0f-8741-53ca57e730c0": "/images/demo/course-1.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01": "/images/demo/expert-1.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02": "/images/blog/buyers.jpg",
  "dbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb04": "/images/demo/club-1.jpg",
  "e8b9ae2b-2ee0-407c-8b89-7229323501fe": "/images/sections/products.jpg",
};

function sqlLit(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function buildStatements() {
  const stmts = [];
  for (const [id, img] of Object.entries(CLUB_IMGS)) {
    const arr = JSON.stringify([img]);
    stmts.push(
      `UPDATE clubs SET logo_url = ${sqlLit(img)}, photos = ${sqlLit(arr)}::jsonb WHERE id = ${sqlLit(id)}`,
    );
  }
  for (const [id, meta] of Object.entries(TRAINER_IMGS)) {
    const arr = JSON.stringify([meta.img]);
    const name = meta.name ? `, display_name = ${sqlLit(meta.name)}` : "";
    stmts.push(`UPDATE trainers SET photos = ${sqlLit(arr)}::jsonb${name} WHERE id = ${sqlLit(id)}`);
  }
  for (const [id, img] of Object.entries(EVENT_IMGS)) {
    const arr = JSON.stringify([img]);
    stmts.push(`UPDATE events SET photos = ${sqlLit(arr)}::jsonb WHERE id = ${sqlLit(id)}`);
  }
  for (const [id, img] of Object.entries(COURSE_IMGS)) {
    stmts.push(`UPDATE courses SET cover_image = ${sqlLit(img)} WHERE id = ${sqlLit(id)}`);
  }
  // Sweep remaining bad CDNs
  stmts.push(`UPDATE clubs SET logo_url = '/images/fallback-empty.jpg', photos = '["/images/fallback-empty.jpg"]'::jsonb WHERE logo_url ILIKE '%unsplash%' OR logo_url ILIKE '%picsum%' OR photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%'`);
  stmts.push(`UPDATE trainers SET photos = '["/images/fallback-empty.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%'`);
  stmts.push(`UPDATE events SET photos = '["/images/fallback-empty.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%'`);
  stmts.push(`UPDATE courses SET cover_image = '/images/fallback-empty.jpg' WHERE cover_image ILIKE '%unsplash%' OR cover_image ILIKE '%picsum%'`);
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

async function viaServiceRole(stmts) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Need SUPABASE_ACCESS_TOKEN or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  for (const [id, img] of Object.entries(CLUB_IMGS)) {
    const { error } = await supabase.from("clubs").update({ logo_url: img, photos: [img] }).eq("id", id);
    if (error) console.warn("clubs", id, error.message);
  }
  for (const [id, meta] of Object.entries(TRAINER_IMGS)) {
    const patch = { photos: [meta.img] };
    if (meta.name) patch.display_name = meta.name;
    const { error } = await supabase.from("trainers").update(patch).eq("id", id);
    if (error) console.warn("trainers", id, error.message);
  }
  for (const [id, img] of Object.entries(EVENT_IMGS)) {
    const { error } = await supabase.from("events").update({ photos: [img] }).eq("id", id);
    if (error) console.warn("events", id, error.message);
  }
  for (const [id, img] of Object.entries(COURSE_IMGS)) {
    const { error } = await supabase.from("courses").update({ cover_image: img }).eq("id", id);
    if (error) console.warn("courses", id, error.message);
  }
  return stmts.length;
}

async function main() {
  const stmts = buildStatements();
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const count = token ? await viaManagement(token, stmts) : await viaServiceRole(stmts);
  console.log(`Updated listing imagery (${count} statements).`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
