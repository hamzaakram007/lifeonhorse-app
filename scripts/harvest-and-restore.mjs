#!/usr/bin/env node
/**
 * Harvest intelligence from LifeOnHorse agent transcripts and restore source files.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const TRANSCRIPT_ROOT =
  "C:/Users/MULTILAPTOP/.cursor/projects/c-Users-MULTILAPTOP-Downloads-LifeOnHorse-FULL-LAUNCH/agent-transcripts";
const PLANS_SRC = "C:/Users/MULTILAPTOP/.cursor/plans";
const OLD_APP_PREFIX = /LifeOnHorse_FULL_LAUNCH[\\/]lifeonhorse-app[\\/]?/i;

function walkJsonl(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkJsonl(full, acc);
    else if (ent.name.endsWith(".jsonl")) acc.push(full);
  }
  return acc;
}

function normalizeProjectPath(filePath) {
  if (!filePath) return null;
  let p = filePath.replace(/\\/g, "/");
  const idx = p.search(/lifeonhorse-app\/?/i);
  if (idx >= 0) {
    p = p.slice(idx + "lifeonhorse-app".length).replace(/^\//, "");
    return path.join(PROJECT_ROOT, p);
  }
  if (OLD_APP_PREFIX.test(filePath)) {
    p = filePath.replace(OLD_APP_PREFIX, "").replace(/\\/g, "/");
    return path.join(PROJECT_ROOT, p);
  }
  return null;
}

function parseJsonl(file) {
  const entries = [];
  for (const line of fs.readFileSync(file, "utf8").split(/\n/)) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
      /* skip malformed */
    }
  }
  return entries;
}

function extractFromTranscripts(files) {
  const writes = new Map(); // relPath -> { contents, source, mtime }
  const userMessages = [];
  const assistantTexts = [];
  const migrations = [];
  const transcriptIndex = [];

  for (const file of files) {
    const rel = path.relative(TRANSCRIPT_ROOT, file).replace(/\\/g, "/");
    const topics = new Set();
    const entries = parseJsonl(file);

    for (const entry of entries) {
      const role = entry.role;
      const content = entry.message?.content;
      if (!Array.isArray(content)) continue;

      if (role === "user") {
        for (const block of content) {
          if (block.type === "text" && block.text) {
            const t = block.text.replace(/<[^>]+>/g, " ").trim();
            if (t.length > 20 && !t.startsWith("You are the forked")) {
              userMessages.push({ file: rel, text: t.slice(0, 2000) });
            }
          }
        }
      }

      if (role === "assistant") {
        for (const block of content) {
          if (block.type === "text" && block.text) {
            assistantTexts.push({ file: rel, text: block.text.slice(0, 4000) });
            if (/signup|migration|marketplace|club|admin|homepage|upload|country/i.test(block.text)) {
              if (/signup|handle_new_user/i.test(block.text)) topics.add("auth-signup-fix");
              if (/migration|001_|002_|schema/i.test(block.text)) topics.add("database-migrations");
              if (/marketplace|product|service|seller/i.test(block.text)) topics.add("marketplace");
              if (/club/i.test(block.text)) topics.add("clubs");
              if (/admin/i.test(block.text)) topics.add("admin");
              if (/homepage|mockup|hero/i.test(block.text)) topics.add("homepage-design");
              if (/upload|image/i.test(block.text)) topics.add("image-uploads");
              if (/countr/i.test(block.text)) topics.add("all-countries");
              if (/health|expert/i.test(block.text)) topics.add("health-module");
            }
          }

          const input = block.input || block.arguments;
          const toolName = block.name || block.toolName;
          if (!input) continue;

          // Write tool
          if ((toolName === "Write" || input.path) && input.path && input.contents != null) {
            const dest = normalizeProjectPath(input.path);
            if (dest && dest.startsWith(PROJECT_ROOT)) {
              const relPath = path.relative(PROJECT_ROOT, dest).replace(/\\/g, "/");
              writes.set(relPath, {
                contents: input.contents,
                source: rel,
                dest,
              });
              if (relPath.includes("migrations/")) topics.add("database-migrations");
              if (relPath.includes("app/")) topics.add("routes");
            }
          }

          // apply_migration / execute_sql
          if (toolName === "CallMcpTool" && input.toolName === "apply_migration" && input.arguments?.query) {
            migrations.push({
              name: input.arguments.name,
              query: input.arguments.query,
              source: rel,
            });
          }
        }
      }
    }

    if (topics.size) transcriptIndex.push({ file: rel, topics: [...topics] });
  }

  return { writes, userMessages, assistantTexts, migrations, transcriptIndex };
}

function collectRoutes(writes) {
  const routes = [];
  for (const rel of writes.keys()) {
    const m = rel.match(/^app\/(.+)\/page\.tsx$/);
    if (m) routes.push("/" + m[1].replace(/\[([^\]]+)\]/g, ":$1"));
  }
  return [...new Set(routes)].sort();
}

function collectTablesFromSql(writes) {
  const tables = new Set();
  for (const [rel, { contents }] of writes) {
    if (!rel.includes("migrations/")) continue;
    for (const m of contents.matchAll(/CREATE TABLE (?:public\.)?(\w+)/gi)) tables.add(m[1]);
    for (const m of contents.matchAll(/CREATE TABLE IF NOT EXISTS (?:public\.)?(\w+)/gi)) tables.add(m[1]);
  }
  return [...tables].sort();
}

function collectComponents(writes) {
  return [...writes.keys()]
    .filter((k) => k.startsWith("components/") && k.endsWith(".tsx"))
    .sort();
}

function writeFileEnsured(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
}

function copyPlans() {
  const destDir = path.join(PROJECT_ROOT, "docs/plans");
  fs.mkdirSync(destDir, { recursive: true });
  const plans = [
    "lifeonhorse_ecosystem_c5384fe9.plan.md",
    "professional_upgrade_roadmap_5fcbfb98.plan.md",
    "professional_demo_seed_9201517d.plan.md",
  ];
  for (const p of plans) {
    const src = path.join(PLANS_SRC, p);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(destDir, p));
  }
}

function main() {
  const files = walkJsonl(TRANSCRIPT_ROOT);
  console.log(`Found ${files.length} transcript files`);

  const { writes, userMessages, assistantTexts, migrations, transcriptIndex } =
    extractFromTranscripts(files);

  copyPlans();

  // Restore files (latest Write wins per path)
  let restored = 0;
  for (const [, { contents, dest }] of writes) {
    writeFileEnsured(dest, contents);
    restored++;
  }
  console.log(`Restored ${restored} files from transcripts`);

  const routes = collectRoutes(writes);
  const tables = collectTablesFromSql(writes);
  const components = collectComponents(writes);

  const docsDir = path.join(PROJECT_ROOT, "docs");
  fs.mkdirSync(docsDir, { recursive: true });

  // USER_DECISIONS.md
  writeFileEnsured(
    path.join(docsDir, "USER_DECISIONS.md"),
    `# User Decisions (Locked)

- **Scope:** Full ecosystem — not MVP-only
- **Clubs:** Core feature; publish immediately (no approval gate)
- **Countries:** All ISO countries in forms/filters
- **Uploads:** Image upload on all major create forms
- **Marketplace:** Horses + products + services + seller directory
- **Health:** Horse Health & Expert Help with emergency disclaimers
- **Homepage:** Hero mockup — full-width photo, 3 feature cards, About, Blog
- **Payments:** Country-aware guidance; manual commission first
- **Admin:** Users, reports, health requests, billing, analytics
- **Business model:** Flexible — do not lock revenue model early

## Source excerpts

${userMessages
  .filter((m) => /countr|upload|club|professional|ecosystem|marketplace|health/i.test(m.text))
  .slice(0, 8)
  .map((m) => `### ${m.file}\n${m.text.slice(0, 500)}...\n`)
  .join("\n")}
`
  );

  // KNOWN_FIXES.md
  writeFileEnsured(
    path.join(docsDir, "KNOWN_FIXES.md"),
    `# Known Fixes

1. **Signup trigger:** \`handle_new_user\` must use \`public.profiles\` with \`SET search_path = ''\`
2. **SUPABASE_SERVICE_ROLE_KEY:** Must be JWT service role key — NOT a REST URL
3. **Google Fonts:** Playfair Display + Source Sans 3 — add local/system fallback for offline builds
4. **tsconfig paths:** \`@/*\` maps to \`./*\` not \`./src/*\`

## Patched SQL (from main chat)

\`\`\`sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;
\`\`\`
`
  );

  // FEATURE_INVENTORY.md
  writeFileEnsured(
    path.join(docsDir, "FEATURE_INVENTORY.md"),
    `# Feature Inventory

## Routes restored (${routes.length})

${routes.map((r) => `- \`${r}\``).join("\n")}

## Database tables (${tables.length})

${tables.map((t) => `- \`${t}\``).join("\n")}

## Components (${components.length})

${components.map((c) => `- \`${c}\``).join("\n")}

## Migration files

${[...writes.keys()]
  .filter((k) => k.startsWith("supabase/migrations/"))
  .map((k) => `- \`${k}\``)
  .join("\n")}

## Scripts

${[...writes.keys()]
  .filter((k) => k.startsWith("scripts/"))
  .map((k) => `- \`${k}\``)
  .join("\n")}
`
  );

  // TRANSCRIPT_INDEX.md
  writeFileEnsured(
    path.join(docsDir, "TRANSCRIPT_INDEX.md"),
    `# Transcript Index

| File | Topics |
|------|--------|
${transcriptIndex.map((t) => `| \`${t.file}\` | ${t.topics.join(", ")} |`).join("\n")}

## Key files

- **Main ecosystem chat:** \`96f9d19e-e6fa-498a-9b82-715d883305ea/96f9d19e-e6fa-498a-9b82-715d883305ea.jsonl\`
- **Primary code recovery:** \`.../subagents/bd728bf6-754d-4f1b-a5bc-02e0afe7901c.jsonl\` (${restored} Write payloads)
`
  );

  // INTELLIGENCE_BRIEF.md
  writeFileEnsured(
    path.join(docsDir, "INTELLIGENCE_BRIEF.md"),
    `# LifeOnHorse Intelligence Brief

Master rebuild spec — generated from ${files.length} transcripts.

## Stack
- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Supabase (\`@supabase/ssr\`), Zod
- Project: \`ebgzqmnewtdippegphou\`

## Restore status
- **Files restored from transcripts:** ${restored}
- **Routes:** ${routes.length}
- **Tables in migrations:** ${tables.length}

## Modules (full parity required)
1. Auth + profiles + roles
2. Marketplace: horses, products, services, sellers
3. Clubs (publish immediately)
4. Trainers & experts
5. Events, courses, blog, community
6. Horse Health & Expert Help
7. Admin dashboard
8. Seller/expert dashboards, favorites, inquiries
9. Legal pages, PWA, payments guidance
10. Demo seed + cleanup scripts

## 5 roadmap phases (all implemented pre-deletion)
1. Foundation — env, legal, deploy prep
2. Trust & Safety — verification, audit log, rate limits
3. Monetization — billing, orders, featured requests
4. Mobile & Growth — PWA, favorites, inquiry notifications
5. Enterprise Scale — reviews, analytics, dashboards

## Next steps after restore
1. \`npm install\`
2. Fill \`.env.local\` with Supabase keys
3. Apply missing remote migrations (diff SUPABASE_STATE.md)
4. \`npm run build\` then \`npm run dev\`
5. Promote admin user in SQL Editor

See also: USER_DECISIONS.md, FEATURE_INVENTORY.md, KNOWN_FIXES.md, TRANSCRIPT_INDEX.md
`
  );

  // SUPABASE_STATE.md placeholder
  writeFileEnsured(
    path.join(docsDir, "SUPABASE_STATE.md"),
    `# Supabase State

Project: \`ebgzqmnewtdippegphou\`
URL: https://supabase.com/dashboard/project/ebgzqmnewtdippegphou

## Expected local migrations
${[...writes.keys()]
  .filter((k) => k.startsWith("supabase/migrations/"))
  .sort()
  .map((k) => `- \`${k}\``)
  .join("\n")}

## Expected tables (from restored SQL)
${tables.map((t) => `- \`${t}\``).join("\n")}

> Run Supabase MCP \`list_tables\` and \`list_migrations\` to diff live state vs this file.
`
  );

  // Save machine-readable harvest
  writeFileEnsured(
    path.join(docsDir, "harvest-summary.json"),
    JSON.stringify(
      {
        transcriptFiles: files.length,
        restoredFiles: restored,
        routeCount: routes.length,
        tableCount: tables.length,
        routes,
        tables,
        restoredPaths: [...writes.keys()].sort(),
      },
      null,
      2
    )
  );

  console.log("Intelligence docs written to docs/");
  console.log(`Routes: ${routes.length}, Tables: ${tables.length}, Files: ${restored}`);
}

main();
