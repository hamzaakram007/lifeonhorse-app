"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/countries";

export default function CreatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState<Record<string, string>>({"name":"","club_type":"general","description":"","city":"","country_code":"PK"});

  async function handlePhotos(files: FileList | null) {
    if (!files?.length) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${user.id}/clubs/${Date.now()}-${file.name}`;
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
    const payload = { ...form, owner_id: user.id };
    const { error: err } = await supabase.from("clubs").insert(payload);
    if (err) { setError(err.message); setLoading(false); return; }
    window.location.href = "/clubs";
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Register a club</h1>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <div><label className="label">Club name</label><input className="input"  required={true} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div><label className="label">Type</label><select className="input" value={form.club_type} onChange={(e) => setForm({ ...form, club_type: e.target.value })}><option value="polo">Polo</option><option value="riding_school">Riding school</option><option value="racing">Racing</option><option value="general">General</option></select></div>
      <div><label className="label">Description</label><textarea className="input min-h-24" required={true} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div><label className="label">City</label><input className="input"  required={false} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
      <div><label className="label">Country</label><select className="input" value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value })}><option value="PK">Pakistan</option><option value="IN">India</option></select></div>
      
      <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Publish"}</button>
    </form>
  );
}
