/**
 * One-shot: point live blog_posts covers at owned /images/blog/... paths
 * and normalize category slugs. Prefers Management API when
 * SUPABASE_ACCESS_TOKEN is set; otherwise PostgREST service role.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/update-blog-photos.mjs
 *   npm run seed:blog-photos
 */
const PROJECT_REF = "ebgzqmnewtdippegphou";
const MGMT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

/** Live production blog rows (id → cover + normalized category). */
const BLOG_IMGS = {
  "0fd3fba2-0c9a-4573-a1ba-487e35c5f2f3": { img: "/images/blog/blog-tent-pegging-guide.jpg", category: "guides" },
  "2d7a0b50-76f9-45ff-a7c9-7b9bb1caa22b": { img: "/images/blog/blog-buying-arabian.jpg", category: "guides" },
  "f878d8ef-ba5b-426c-b18b-5b6e4d9cd842": { img: "/images/blog/blog-polo-training.jpg", category: "training" },
  "a67da3d8-f209-461f-ac18-53f83a912e9f": { img: "/images/blog/blog-first-time-buyers.jpg", category: "guides" },
  "e37e5f58-05d5-4664-9161-3097b1ab9a13": { img: "/images/blog/blog-argentine-polo.jpg", category: "culture" },
  "4038392f-6120-4815-b2e9-292aded05f97": { img: "/images/blog/blog-kentucky-horse-country.jpg", category: "culture" },
  "dcc11111-1111-4111-8111-111111111201": { img: "/images/blog/blog-buy-safely-2026.jpg", category: "buying_guide" },
  "dcc88888-8888-4888-8888-888888888208": { img: "/images/blog/blog-horse-show-prep.jpg", category: "events" },
  "8c040ab9-7c31-4a3e-a6c8-12348d32cca1": { img: "/images/blog/blog-buy-south-asia.jpg", category: "guides" },
  "4f0c3f45-77d7-4422-9355-ce9415283d7e": { img: "/images/blog/blog-young-riders.jpg", category: "training" },
  "31169265-05e9-48ce-b7ba-f0b957d0361a": { img: "/images/blog/blog-hoof-problems.jpg", category: "health" },
  "23105d72-2218-464f-acca-5c631f6beadf": { img: "/images/blog/blog-azerbaijan-culture.jpg", category: "culture" },
  "306204e0-0884-4f63-aff0-448f4a170a16": { img: "/images/blog/blog-dressage-grand-prix.jpg", category: "training" },
  "c9ae7063-5504-4227-bfc1-bc33763287b3": { img: "/images/blog/blog-nutrition-hot.jpg", category: "health" },
  "6e600243-5969-4258-91f8-751d5ad9c9d9": { img: "/images/blog/blog-horse-transport.jpg", category: "guides" },
  "d95a1542-beeb-4bfe-9bb2-251786bf3355": { img: "/images/blog/blog-lameness.jpg", category: "health" },
  "dcc22222-2222-4222-8222-222222222202": { img: "/images/blog/blog-polo-care.jpg", category: "polo" },
  "dcc33333-3333-4333-8333-333333333203": { img: "/images/blog/blog-tent-pegging-basics.jpg", category: "tent_pegging" },
  "dcc44444-4444-4444-8444-444444444204": { img: "/images/blog/blog-health-warning-signs.jpg", category: "health" },
  "dcc55555-5555-4555-8555-555555555205": { img: "/images/blog/blog-saddle-choice.jpg", category: "tack" },
  "dcc66666-6666-4666-8666-666666666206": { img: "/images/blog/blog-feeding-hot.jpg", category: "nutrition" },
  "dcc77777-7777-4777-8777-777777777207": { img: "/images/blog/blog-building-trust.jpg", category: "training" },
};

/** Title-based fallback when IDs differ across environments. */
const BY_TITLE = {
  "Tent Pegging: A Complete Guide": { img: "/images/blog/blog-tent-pegging-guide.jpg", category: "guides" },
  "Buying Arabian Horses: Expert Advice": { img: "/images/blog/blog-buying-arabian.jpg", category: "guides" },
  "Polo Training Basics for New Riders": { img: "/images/blog/blog-polo-training.jpg", category: "training" },
  "Essential Tips for First-Time Horse Buyers": { img: "/images/blog/blog-first-time-buyers.jpg", category: "guides" },
  "The Heritage of Argentine Polo": { img: "/images/blog/blog-argentine-polo.jpg", category: "culture" },
  "Kentucky: Heart of American Horse Country": { img: "/images/blog/blog-kentucky-horse-country.jpg", category: "culture" },
  "How to Buy a Horse Safely in 2026": { img: "/images/blog/blog-buy-safely-2026.jpg", category: "buying_guide" },
  "Preparing for a Horse Show": { img: "/images/blog/blog-horse-show-prep.jpg", category: "events" },
  "Buying Horses Safely in South Asia": { img: "/images/blog/blog-buy-south-asia.jpg", category: "guides" },
  "Training Techniques for Young Riders": { img: "/images/blog/blog-young-riders.jpg", category: "training" },
  "A Guide to Common Hoof Problems": { img: "/images/blog/blog-hoof-problems.jpg", category: "health" },
  "Horse Culture in Azerbaijan": { img: "/images/blog/blog-azerbaijan-culture.jpg", category: "culture" },
  "Dressage Training at Grand Prix Level": { img: "/images/blog/blog-dressage-grand-prix.jpg", category: "training" },
  "Equine Nutrition in Hot Climates": { img: "/images/blog/blog-nutrition-hot.jpg", category: "health" },
  "International Horse Transport: Safety First": { img: "/images/blog/blog-horse-transport.jpg", category: "guides" },
  "Understanding Equine Lameness": { img: "/images/blog/blog-lameness.jpg", category: "health" },
  "Polo Horse Care Guide": { img: "/images/blog/blog-polo-care.jpg", category: "polo" },
  "Tent Pegging Basics for New Enthusiasts": { img: "/images/blog/blog-tent-pegging-basics.jpg", category: "tent_pegging" },
  "Common Horse Health Warning Signs": { img: "/images/blog/blog-health-warning-signs.jpg", category: "health" },
  "Choosing the Right Saddle for Your Discipline": { img: "/images/blog/blog-saddle-choice.jpg", category: "tack" },
  "Feeding Horses in Hot Climates": { img: "/images/blog/blog-feeding-hot.jpg", category: "nutrition" },
  "Building Trust With a New Horse": { img: "/images/blog/blog-building-trust.jpg", category: "training" },
};

function sqlLit(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function buildStatements() {
  const stmts = [];
  for (const [id, meta] of Object.entries(BLOG_IMGS)) {
    stmts.push(
      `UPDATE blog_posts SET cover_image = ${sqlLit(meta.img)}, category = ${sqlLit(meta.category)} WHERE id = ${sqlLit(id)}`,
    );
  }
  for (const [title, meta] of Object.entries(BY_TITLE)) {
    stmts.push(
      `UPDATE blog_posts SET cover_image = ${sqlLit(meta.img)}, category = ${sqlLit(meta.category)} WHERE title = ${sqlLit(title)}`,
    );
  }
  stmts.push(`UPDATE blog_posts SET category = 'buying_guide' WHERE lower(category) IN ('buying guide', 'buying_guide')`);
  stmts.push(`UPDATE blog_posts SET category = 'events' WHERE lower(category) = 'events'`);
  stmts.push(`UPDATE blog_posts SET category = 'polo' WHERE lower(category) = 'polo'`);
  stmts.push(`UPDATE blog_posts SET category = 'tent_pegging' WHERE lower(category) IN ('tent pegging', 'tent_pegging')`);
  stmts.push(`UPDATE blog_posts SET category = 'health' WHERE lower(category) = 'health'`);
  stmts.push(`UPDATE blog_posts SET category = 'tack' WHERE lower(category) = 'tack'`);
  stmts.push(`UPDATE blog_posts SET category = 'nutrition' WHERE lower(category) = 'nutrition'`);
  stmts.push(`UPDATE blog_posts SET category = 'training' WHERE lower(category) = 'training'`);
  stmts.push(`UPDATE blog_posts SET category = 'culture' WHERE lower(category) = 'culture'`);
  stmts.push(`UPDATE blog_posts SET category = 'guides' WHERE lower(category) = 'guides'`);
  stmts.push(
    `UPDATE blog_posts SET cover_image = '/images/fallback-empty.jpg' WHERE cover_image ILIKE '%unsplash%' OR cover_image ILIKE '%picsum%'`,
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
    throw new Error("Need SUPABASE_ACCESS_TOKEN or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  let updated = 0;
  for (const [id, meta] of Object.entries(BLOG_IMGS)) {
    const { error } = await supabase
      .from("blog_posts")
      .update({ cover_image: meta.img, category: meta.category })
      .eq("id", id);
    if (error) console.warn("blog id", id, error.message);
    else updated += 1;
  }
  for (const [title, meta] of Object.entries(BY_TITLE)) {
    const { error } = await supabase
      .from("blog_posts")
      .update({ cover_image: meta.img, category: meta.category })
      .eq("title", title);
    if (error) console.warn("blog title", title, error.message);
    else updated += 1;
  }
  const { error: sweepErr } = await supabase
    .from("blog_posts")
    .update({ cover_image: "/images/fallback-empty.jpg" })
    .or("cover_image.ilike.%unsplash%,cover_image.ilike.%picsum%");
  if (sweepErr) console.warn("sweep", sweepErr.message);
  return updated;
}

async function main() {
  const stmts = buildStatements();
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (token) {
    const count = await viaManagement(token, stmts);
    console.log(`Updated blog imagery via Management API (${count} statements).`);
    return;
  }
  const count = await viaServiceRole();
  console.log(`Updated blog imagery via service role (${count} row updates).`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
