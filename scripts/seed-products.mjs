/**
 * Seed / remap marketplace products for project ebgzqmnewtdippegphou (001 lineage).
 * Prefers Management API when SUPABASE_ACCESS_TOKEN is set; otherwise service role.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=<token> node scripts/seed-products.mjs
 *   node --env-file=.env.local scripts/seed-products.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PROJECT_REF = "ebgzqmnewtdippegphou";
const MGMT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const __dirname = dirname(fileURLToPath(import.meta.url));

function splitSql(sql) {
  return sql
    .split(/;\s*\n/)
    .map((s) => s.replace(/--[^\n]*/g, "").trim())
    .filter((s) => s.length > 0);
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

async function viaServiceRole(stmts) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Need SUPABASE_ACCESS_TOKEN or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  }
  // Execute as a single RPC-less batch via PostgREST is awkward for DDL-ish SQL —
  // prefer Management API. Fall back: run each statement through pg via supabase-js rpc is not available.
  throw new Error(
    `Service-role SQL batch not supported here (${stmts.length} statements). Set SUPABASE_ACCESS_TOKEN or run scripts/seed-products.sql in the SQL editor.`,
  );
}

async function main() {
  const sqlPath = join(__dirname, "seed-products.sql");
  const sql = readFileSync(sqlPath, "utf8");
  const stmts = splitSql(sql);
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const count = token ? await viaManagement(token, stmts) : await viaServiceRole(stmts);
  console.log(`Product seed applied (${count} statements).`);

  if (token) {
    const res = await fetch(MGMT, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query:
          "select count(*)::int as n, count(*) filter (where photos::text ilike '%unsplash%')::int as unsplash from public.products where status = 'published'",
      }),
    });
    const body = await res.json();
    console.log("Published products:", body?.[0] ?? body);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
