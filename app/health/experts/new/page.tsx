"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewExpertPage() {
  const [form, setForm] = useState({ display_name: "", specialty: "Veterinarian", description: "", credentials: "", country_code: "PK" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    const { error: err } = await supabase.from("experts").insert({ ...form, user_id: user.id });
    setError(err?.message ?? "");
    if (!err) window.location.href = "/dashboard/expert";
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Register as health expert</h1>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <div><label className="label">Display name</label><input className="input" required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
      <div><label className="label">Specialty</label><input className="input" required value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></div>
      <div><label className="label">Credentials</label><textarea className="input" value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} /></div>
      <div><label className="label">Description</label><textarea className="input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Register"}</button>
    </form>
  );
}
