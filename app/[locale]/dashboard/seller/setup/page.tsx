"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/countries";

export default function SellerSetupPage() {
  const formsT = useTranslations("Forms");
  const [form, setForm] = useState({ business_name: "", description: "", country_code: "PK", city: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: err } = await supabase.from("seller_profiles").insert({ ...form, user_id: user.id });
    setError(err?.message ?? "");
    if (!err) window.location.href = "/dashboard/seller";
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Seller profile setup</h1>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <div><label className="label">Business name</label><input className="input" required value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} /></div>
      <div><label className="label">Description</label><textarea className="input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div><label className="label">Country</label><select className="input" value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value })}>{COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select></div>
      <div><label className="label">City</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? formsT("saving") : formsT("createProfile")}
      </button>
    </form>
  );
}
