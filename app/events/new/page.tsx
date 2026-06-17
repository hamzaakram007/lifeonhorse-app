"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewEventPage() {
  const [form, setForm] = useState({ title: "", description: "", event_type: "show", city: "", country_code: "PK", start_date: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }
    await supabase.from("events").insert({ ...form, host_id: user.id, start_date: form.start_date || null });
    window.location.href = "/events";
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Create event</h1>
      <div><label className="label">Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div><label className="label">Description</label><textarea className="input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div><label className="label">Start date</label><input className="input" type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
      <button type="submit" className="btn btn-primary" disabled={loading}>Publish</button>
    </form>
  );
}
