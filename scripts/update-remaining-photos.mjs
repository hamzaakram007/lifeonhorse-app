/**
 * Remap remaining Unsplash/Picsum photos on horses, services, community_posts,
 * seller_profiles, and health_requests to owned /images/demo|sections paths.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/update-remaining-photos.mjs
 *   npm run seed:remaining-photos
 */
const PROJECT_REF = "ebgzqmnewtdippegphou";
const MGMT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const HORSE_IMGS = {
  "d2222222-2222-4222-8222-222222222201": ["/images/demo/horse-1.jpg", "/images/demo/horse-2.jpg"],
  "fc327ebb-ffcc-4fc1-8b84-9a9db1949058": ["/images/demo/horse-1.jpg", "/images/demo/horse-5.jpg"],
  "d2222222-2222-4222-8222-222222222202": ["/images/demo/horse-2.jpg"],
  "11375166-7d1c-40d9-a2b8-7049aa469f77": ["/images/demo/horse-2.jpg", "/images/demo/horse-3.jpg"],
  "d2222222-2222-4222-8222-222222222203": ["/images/demo/horse-4.jpg", "/images/demo/horse-1.jpg"],
  "d2222222-2222-4222-8222-222222222215": ["/images/demo/horse-4.jpg"],
  "d2222222-2222-4222-8222-222222222204": ["/images/demo/horse-5.jpg"],
  "d2222222-2222-4222-8222-222222222205": ["/images/demo/horse-3.jpg"],
  "e6990232-45a5-4b26-b033-568dafa85e45": ["/images/demo/horse-3.jpg", "/images/demo/horse-5.jpg"],
  "d2222222-2222-4222-8222-222222222206": ["/images/demo/horse-2.jpg", "/images/demo/horse-4.jpg"],
  "f8dbfdae-03b6-4c37-8fea-84c0873c2c25": ["/images/demo/horse-2.jpg", "/images/demo/horse-1.jpg"],
  "d2222222-2222-4222-8222-222222222207": ["/images/demo/horse-5.jpg", "/images/demo/horse-2.jpg"],
  "d2222222-2222-4222-8222-222222222208": ["/images/demo/horse-3.jpg", "/images/demo/horse-4.jpg"],
  "9041d14d-ffd4-4d33-a7f8-18f89e015f10": ["/images/demo/horse-3.jpg"],
  "d2222222-2222-4222-8222-222222222209": ["/images/demo/horse-4.jpg", "/images/demo/horse-5.jpg"],
  "d2222222-2222-4222-8222-222222222210": ["/images/demo/horse-1.jpg"],
  "d2222222-2222-4222-8222-222222222211": ["/images/demo/horse-5.jpg", "/images/demo/horse-3.jpg"],
  "d2222222-2222-4222-8222-222222222212": ["/images/demo/horse-2.jpg", "/images/demo/horse-5.jpg"],
  "d2222222-2222-4222-8222-222222222213": ["/images/demo/horse-1.jpg"],
  "d2222222-2222-4222-8222-222222222214": ["/images/demo/horse-3.jpg", "/images/demo/horse-1.jpg"],
  "337a9cc9-f0f7-47ec-887a-2a90b0b09cec": ["/images/demo/horse-3.jpg", "/images/demo/horse-2.jpg"],
  "f65fafc3-e534-4e06-85fe-551386c5dd2d": ["/images/demo/horse-4.jpg", "/images/demo/horse-5.jpg"],
};

const SERVICE_IMGS = {
  "d5555555-5555-4555-8555-555555555501": ["/images/demo/service-1.jpg"],
  "d7777777-7777-4777-8777-777777777701": ["/images/demo/service-1.jpg", "/images/sections/services.jpg"],
  "d7777777-7777-4777-8777-777777777702": ["/images/demo/service-1.jpg"],
  "90db432b-c020-43e8-8d26-a400e0db67a6": ["/images/demo/service-1.jpg"],
  "d5555555-5555-4555-8555-555555555502": ["/images/demo/trainer-vet.jpg"],
  "d7777777-7777-4777-8777-777777777703": ["/images/demo/trainer-vet.jpg"],
  "ac16fbaa-7542-4e45-b368-7233be9e67ce": ["/images/demo/trainer-vet.jpg"],
  "d5555555-5555-4555-8555-555555555503": ["/images/demo/course-nutrition.jpg"],
  "d5555555-5555-4555-8555-555555555504": ["/images/demo/club-breeding.jpg"],
  "d5555555-5555-4555-8555-555555555505": ["/images/demo/event-1.jpg"],
  "d7777777-7777-4777-8777-777777777704": ["/images/demo/event-1.jpg"],
  "d7c07159-10c2-4166-afc9-1f9a767ba6bf": ["/images/demo/event-1.jpg"],
  "d5555555-5555-4555-8555-555555555506": ["/images/sections/marketplace.jpg"],
  "d7777777-7777-4777-8777-777777777705": ["/images/demo/club-1.jpg"],
  "d03dae80-a7da-47e3-b082-a003c400115b": ["/images/demo/club-1.jpg"],
  "d7777777-7777-4777-8777-777777777706": ["/images/demo/product-saddle.jpg"],
};

const COMMUNITY_IMGS = {
  "d97fd70c-1f92-4ec0-86a9-b960b0ba2130": ["/images/demo/event-trail.jpg"],
  "dddddddd-dddd-4ddd-8ddd-dddddddddd04": ["/images/demo/club-community.jpg"],
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01": ["/images/demo/event-trail.jpg", "/images/demo/horse-2.jpg"],
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07": ["/images/demo/service-1.jpg"],
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06": ["/images/demo/expert-clinic.jpg", "/images/demo/horse-1.jpg"],
  "dddddddd-dddd-4ddd-8ddd-dddddddddd08": ["/images/demo/horse-1.jpg", "/images/demo/horse-4.jpg"],
  "dddddddd-dddd-4ddd-8ddd-dddddddddd10": ["/images/demo/expert-vet.jpg", "/images/demo/course-nutrition.jpg"],
  "dddddddd-dddd-4ddd-8ddd-dddddddddd05": ["/images/demo/horse-2.jpg", "/images/demo/event-trail.jpg"],
  "dddddddd-dddd-4ddd-8ddd-dddddddddd06": ["/images/demo/event-polo.jpg", "/images/demo/horse-5.jpg"],
  "dddddddd-dddd-4ddd-8ddd-dddddddddd07": ["/images/demo/club-1.jpg", "/images/demo/event-trail.jpg"],
  "dddddddd-dddd-4ddd-8ddd-dddddddddd09": ["/images/demo/event-tent.jpg", "/images/demo/horse-3.jpg"],
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05": ["/images/demo/course-dressage.jpg"],
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02": ["/images/demo/event-polo.jpg"],
  "c8cfa25e-15ee-4baf-bda5-29dc133984c4": ["/images/demo/course-dressage.jpg"],
  "dddddddd-dddd-4ddd-8ddd-dddddddddd01": ["/images/demo/event-polo.jpg"],
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03": ["/images/demo/event-tent.jpg", "/images/demo/horse-1.jpg"],
  "f34a8aa6-2fd1-41d5-afa1-d1574034ea3a": ["/images/demo/horse-3.jpg", "/images/demo/horse-5.jpg"],
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04": ["/images/demo/horse-1.jpg", "/images/demo/club-breeding.jpg"],
  "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa08": ["/images/demo/course-nutrition.jpg"],
  "dddddddd-dddd-4ddd-8ddd-dddddddddd02": ["/images/demo/horse-1.jpg"],
  "71ce8643-13b3-4308-8030-4e29f74e342c": ["/images/demo/horse-3.jpg", "/images/demo/club-rescue.jpg"],
  "3bdfde07-eab7-4d9c-95b6-ddd9aa58f39d": ["/images/demo/horse-5.jpg", "/images/demo/event-trail.jpg"],
  "c1c98888-aabb-4e44-8e26-aaaf96d34d45": ["/images/demo/product-bridle.jpg"],
  "dddddddd-dddd-4ddd-8ddd-dddddddddd03": ["/images/demo/event-tent.jpg"],
};

const SELLER_IMGS = {
  "d3333333-3333-4333-8333-333333333301": {
    logo: "/images/demo/product-saddle.jpg",
    photos: ["/images/demo/product-saddle.jpg", "/images/demo/product-bridle.jpg"],
  },
  "d3333333-3333-4333-8333-333333333302": {
    logo: "/images/demo/product-feed.jpg",
    photos: ["/images/demo/product-feed.jpg", "/images/demo/product-supplement.jpg"],
  },
  "d3333333-3333-4333-8333-333333333303": {
    logo: "/images/demo/horse-1.jpg",
    photos: ["/images/demo/horse-1.jpg", "/images/demo/club-breeding.jpg"],
  },
  "d3333333-3333-4333-8333-333333333304": {
    logo: "/images/demo/service-1.jpg",
    photos: ["/images/demo/service-1.jpg", "/images/sections/marketplace.jpg"],
  },
  "d3333333-3333-4333-8333-333333333305": {
    logo: "/images/demo/product-mallet.jpg",
    photos: ["/images/demo/product-mallet.jpg", "/images/demo/product-apparel.jpg"],
  },
  "5d84b2e8-3fa4-4949-b25d-dd6073265c74": {
    logo: "/images/demo/product-feed.jpg",
    photos: ["/images/demo/product-feed.jpg", "/images/demo/product-supplement.jpg"],
  },
};

function sqlLit(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function jsonbArr(arr) {
  return sqlLit(JSON.stringify(arr)) + "::jsonb";
}

function buildStatements() {
  const stmts = [];
  for (const [id, photos] of Object.entries(HORSE_IMGS)) {
    stmts.push(`UPDATE horses SET photos = ${jsonbArr(photos)} WHERE id = ${sqlLit(id)}`);
  }
  for (const [id, photos] of Object.entries(SERVICE_IMGS)) {
    stmts.push(`UPDATE services SET photos = ${jsonbArr(photos)} WHERE id = ${sqlLit(id)}`);
  }
  for (const [id, photos] of Object.entries(COMMUNITY_IMGS)) {
    stmts.push(`UPDATE community_posts SET photos = ${jsonbArr(photos)} WHERE id = ${sqlLit(id)}`);
  }
  for (const [id, meta] of Object.entries(SELLER_IMGS)) {
    stmts.push(
      `UPDATE seller_profiles SET logo_url = ${sqlLit(meta.logo)}, photos = ${jsonbArr(meta.photos)} WHERE id = ${sqlLit(id)}`,
    );
  }
  // Sweep any leftover Unsplash/Picsum placeholders.
  stmts.push(
    `UPDATE horses SET photos = '["/images/demo/horse-1.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%'`,
  );
  stmts.push(
    `UPDATE services SET photos = '["/images/demo/service-1.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%'`,
  );
  stmts.push(
    `UPDATE community_posts SET photos = '["/images/sections/community.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%'`,
  );
  stmts.push(
    `UPDATE seller_profiles SET logo_url = '/images/sections/sellers.jpg', photos = '["/images/sections/sellers.jpg"]'::jsonb WHERE logo_url ILIKE '%unsplash%' OR logo_url ILIKE '%picsum%' OR photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%'`,
  );
  stmts.push(
    `UPDATE health_requests SET photos = '["/images/demo/expert-clinic.jpg"]'::jsonb WHERE photos::text ILIKE '%unsplash%' OR photos::text ILIKE '%picsum%'`,
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
      throw new Error(`Management API ${res.status}: ${body.slice(0, 240)}`);
    }
    ok += 1;
  }
  return ok;
}

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("SUPABASE_ACCESS_TOKEN required");
  const stmts = buildStatements();
  const count = await viaManagement(token, stmts);
  console.log(`Updated remaining listing photos (${count} statements).`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
