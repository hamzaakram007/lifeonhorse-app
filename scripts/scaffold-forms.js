const fs = require("fs");
const path = require("path");

function write(rel, content) {
  fs.mkdirSync(path.dirname(path.join(process.cwd(), rel)), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), rel), content);
}

const genericCreate = (config) => `"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/countries";

export default function CreatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState<Record<string, string>>(${JSON.stringify(config.defaults)});

  async function handlePhotos(files: FileList | null) {
    if (!files?.length) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = \`\${user.id}/${config.uploadFolder}/\${Date.now()}-\${file.name}\`;
      await supabase.storage.from("uploads").upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(path);
      urls.push(publicUrl);
    }
    setPhotos((p) => [...p, ...urls]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    const payload = { ...form, ${config.ownerField}: user.id${config.photosField ? `, ${config.photosField}: photos` : ""} };
    const { error: err } = await supabase.from("${config.table}").insert(payload);
    if (err) { setError(err.message); setLoading(false); return; }
    window.location.href = "${config.redirect}";
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">${config.title}</h1>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      ${config.fields.map((f) => f.type === "textarea" ? `<div><label className="label">${f.label}</label><textarea className="input min-h-24" required={${f.required ?? false}} value={form.${f.name}} onChange={(e) => setForm({ ...form, ${f.name}: e.target.value })} /></div>` : f.type === "select" ? `<div><label className="label">${f.label}</label><select className="input" value={form.${f.name}} onChange={(e) => setForm({ ...form, ${f.name}: e.target.value })}>${f.options.map(o => `<option value="${o.v}">${o.l}</option>`).join("")}</select></div>` : `<div><label className="label">${f.label}</label><input className="input" ${f.inputType ? `type="${f.inputType}"` : ""} required={${f.required ?? false}} value={form.${f.name}} onChange={(e) => setForm({ ...form, ${f.name}: e.target.value })} /></div>`).join("\n      ")}
      ${config.multiPhoto ? `<div><label className="label">Photos</label><input type="file" accept="image/*" multiple onChange={(e) => handlePhotos(e.target.files)} />{photos.length > 0 && <p className="text-sm">{photos.length} photo(s) uploaded</p>}</div>` : ""}
      <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Publish"}</button>
    </form>
  );
}
`;

write("app/marketplace/horses/new/page.tsx", genericCreate({
  title: "List a horse",
  table: "horses",
  ownerField: "owner_id",
  photosField: "photos",
  uploadFolder: "horses",
  redirect: "/marketplace/horses",
  multiPhoto: true,
  defaults: { title: "", description: "", breed: "", city: "", country_code: "PK", price: "", currency: "USD", listing_type: "sale" },
  fields: [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "breed", label: "Breed" },
    { name: "city", label: "City" },
    { name: "country_code", label: "Country", type: "select", options: [{ v: "PK", l: "Pakistan" }, { v: "US", l: "US" }, { v: "GB", l: "UK" }] },
    { name: "price", label: "Price", inputType: "number" },
    { name: "listing_type", label: "Type", type: "select", options: [{ v: "sale", l: "Sale" }, { v: "adoption", l: "Adoption" }, { v: "stud", l: "Stud" }] },
  ],
}));

write("app/clubs/new/page.tsx", genericCreate({
  title: "Register a club",
  table: "clubs",
  ownerField: "owner_id",
  photosField: null,
  uploadFolder: "clubs",
  redirect: "/clubs",
  multiPhoto: false,
  defaults: { name: "", club_type: "general", description: "", city: "", country_code: "PK" },
  fields: [
    { name: "name", label: "Club name", required: true },
    { name: "club_type", label: "Type", type: "select", options: [{ v: "polo", l: "Polo" }, { v: "riding_school", l: "Riding school" }, { v: "racing", l: "Racing" }, { v: "general", l: "General" }] },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "city", label: "City" },
    { name: "country_code", label: "Country", type: "select", options: [{ v: "PK", l: "Pakistan" }, { v: "IN", l: "India" }] },
  ],
}));

write("app/health/request/page.tsx", `"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function HealthRequestPage() {
  const [form, setForm] = useState({ horse_name: "", issue_description: "", urgency: "normal", disclaimer_accepted: false, emergency_acknowledged: false });
  const [videoUrl, setVideoUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function uploadFile(file: File, folder: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const path = \`\${user.id}/\${folder}/\${Date.now()}-\${file.name}\`;
    await supabase.storage.from("uploads").upload(path, file);
    const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(path);
    return publicUrl;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.disclaimer_accepted || !form.emergency_acknowledged) { setError("You must accept all disclaimers."); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    const allowed = await supabase.rpc("check_rate_limit", { p_identifier: user.id, p_action: "health_request", p_max: 5, p_window_minutes: 60 });
    if (allowed.data === false) { setError("Rate limit exceeded. Try again later."); setLoading(false); return; }
    const { error: err } = await supabase.from("health_requests").insert({ ...form, user_id: user.id, photos, video_url: videoUrl || null });
    setError(err?.message ?? "");
    if (!err) window.location.href = "/dashboard";
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Submit health request</h1>
      <div className="rounded-lg border-2 border-[var(--color-danger)] bg-red-50 p-4 text-sm">
        <strong>NOT FOR EMERGENCIES.</strong> If your horse has colic, severe bleeding, cannot stand, or has breathing distress, call a licensed veterinarian NOW.
        <Link href="/legal/health-disclaimer" className="ml-1 underline">Full disclaimer</Link>
      </div>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <div><label className="label">Horse name</label><input className="input" value={form.horse_name} onChange={(e) => setForm({ ...form, horse_name: e.target.value })} /></div>
      <div><label className="label">Describe the issue</label><textarea className="input min-h-32" required value={form.issue_description} onChange={(e) => setForm({ ...form, issue_description: e.target.value })} /></div>
      <div><label className="label">Urgency</label><select className="input" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}><option value="normal">Normal</option><option value="urgent">Urgent (non-emergency)</option></select></div>
      <div><label className="label">Photos</label><input type="file" accept="image/*" multiple onChange={async (e) => { const urls = []; for (const f of Array.from(e.target.files ?? [])) { const u = await uploadFile(f, "health"); if (u) urls.push(u); } setPhotos(urls); }} /></div>
      <div><label className="label">Video (optional)</label><input type="file" accept="video/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const u = await uploadFile(f, "health-video"); if (u) setVideoUrl(u); } }} /></div>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.emergency_acknowledged} onChange={(e) => setForm({ ...form, emergency_acknowledged: e.target.checked })} />I understand this is NOT for emergencies.</label>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.disclaimer_accepted} onChange={(e) => setForm({ ...form, disclaimer_accepted: e.target.checked })} />I accept the health disclaimer and understand online advice is informational only.</label>
      <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Submitting..." : "Submit request"}</button>
    </form>
  );
}
`);

write("app/countries/[code]/page.tsx", `import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountryByCode } from "@/lib/countries";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const country = getCountryByCode(code);
  return { title: country ? \`Horses in \${country.name}\` : "Country" };
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const country = getCountryByCode(code);
  if (!country) notFound();
  const supabase = await createClient();
  const cc = country.code;
  const [{ data: horses }, { data: clubs }, { data: trainers }] = await Promise.all([
    supabase.from("horses").select("id, title, photos, price, currency, city").eq("country_code", cc).eq("status", "published").limit(8),
    supabase.from("clubs").select("id, name, club_type, logo_url").eq("country_code", cc).eq("status", "published").limit(8),
    supabase.from("trainers").select("id, display_name, specialty, photos").eq("country_code", cc).eq("status", "published").limit(8),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{country.name}</h1>
        <p className="text-[var(--color-muted)]">Horse marketplace, clubs, and trainers in {country.name}</p>
      </div>
      <section><h2 className="text-xl font-semibold">Horses</h2><div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{horses?.map((h) => <ListingCard key={h.id} href={\`/marketplace/horses/\${h.id}\`} title={h.title} image={Array.isArray(h.photos) ? h.photos[0] : null} />)}</div></section>
      <section><h2 className="text-xl font-semibold">Clubs</h2><div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{clubs?.map((c) => <ListingCard key={c.id} href={\`/clubs/\${c.id}\`} title={c.name} subtitle={c.club_type} image={c.logo_url} />)}</div></section>
      <Link href="/payments" className="text-sm">Payment guidance for {country.name} →</Link>
    </div>
  );
}
`);

// Generic detail page generator
function detailPage(table, titleField, prefix, photosField = "photos") {
  write(`app/${prefix}/[id]/page.tsx`, `import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery, VerifiedBadge, FeaturedBadge } from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("${table}").select("${titleField}").eq("id", id).single();
  return { title: data?.${titleField} ?? "Details" };
}

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from("${table}").select("*").eq("id", id).single();
  if (!item) notFound();
  const photos = ${photosField === "photos" ? "Array.isArray(item.photos) ? item.photos : []" : "item.cover_image ? [item.cover_image] : (Array.isArray(item.photos) ? item.photos : [])"};
  return (
    <div className="space-y-6">
      <div className="flex gap-2">{item.is_verified && <VerifiedBadge />}{item.is_featured && <FeaturedBadge />}</div>
      <h1 className="text-3xl font-bold">{item.${titleField}}</h1>
      <PhotoGallery photos={photos} />
      <p>{item.description ?? item.content ?? ""}</p>
      <ReviewsSection entityType="${prefix.split("/").pop()}" entityId={id} />
    </div>
  );
}
`);
}

["clubs/name/clubs", "trainers/display_name/trainers", "events/title/events", "courses/title/courses", "blog/title/blog", "community/title/community", "health/experts/display_name/health/experts", "marketplace/products/title/marketplace/products", "marketplace/services/title/marketplace/services", "marketplace/sellers/business_name/marketplace/sellers"].forEach((s) => {
  const [titleField, prefix] = s.split("/").reverse().slice(0, 2).reverse();
  const parts = s.split("/");
  const table = parts[0] === "marketplace" ? parts[1] === "sellers" ? "seller_profiles" : parts[1] : parts[0] === "health" ? "experts" : parts[0] === "blog" ? "blog_posts" : parts[0] === "community" ? "community_posts" : parts[0];
  const route = parts.slice(1).join("/");
  detailPage(table, parts[parts.length - 3] || titleField, route);
});

console.log("Forms and detail pages created");
