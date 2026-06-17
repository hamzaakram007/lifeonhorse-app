"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { EXPERT_CATEGORIES } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import { slugify } from "@/lib/utils";

export default function ApplyExpertPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "vet",
    license_certification: "",
    country: "PK",
    city: "",
    clinic_name: "",
    specialization: "",
    contact_phone: "",
    whatsapp: "",
    service_area: "",
    bio: "",
    online_consultation: false,
    emergency_available: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!form.license_certification.trim()) {
      setError("Please provide your license or certification details.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/horse-health/experts/apply");
      return;
    }

    const slug = slugify(form.name) + "-" + Date.now().toString(36);
    const { data, error: insertError } = await supabase
      .from("experts")
      .insert({
        user_id: user.id,
        slug,
        name: form.name.trim(),
        category: form.category,
        license_certification: form.license_certification,
        country: form.country,
        city: form.city || null,
        clinic_name: form.clinic_name || null,
        specialization: form.specialization || null,
        contact_phone: form.contact_phone || null,
        whatsapp: form.whatsapp || null,
        service_area: form.service_area || null,
        avatar_url: avatarUrl || null,
        photos,
        bio: form.bio || null,
        online_consultation: form.online_consultation,
        emergency_available: form.emergency_available,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select("slug")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    if (data) router.push(`/horse-health/experts/${data.slug}`);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/horse-health/experts" className="text-sm text-emerald-800 hover:underline">← Back to experts</Link>
      <h1 className="mt-4 text-2xl font-bold">Apply as equine expert</h1>
      <p className="text-sm text-stone-600">Share your credentials and expertise to help horse owners.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Full name</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <ImageUpload bucket={STORAGE_BUCKETS.avatars} label="Profile photo" value={avatarUrl ? [avatarUrl] : []} onChange={(urls) => setAvatarUrl(urls[0] ?? "")} maxFiles={1} />
        <ImageUpload bucket={STORAGE_BUCKETS.gallery} label="Additional photos" multiple maxFiles={4} value={photos} onChange={setPhotos} />
        <div>
          <Label>Expert category</Label>
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {EXPERT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label required>License / certification</Label>
          <Textarea required rows={2} value={form.license_certification} onChange={(e) => setForm({ ...form, license_certification: e.target.value })} placeholder="License number, issuing authority, certifications" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Country</Label>
            <CountrySelect required value={form.country} onChange={(country) => setForm({ ...form, country })} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>Clinic / hospital name</Label>
            <Input value={form.clinic_name} onChange={(e) => setForm({ ...form, clinic_name: e.target.value })} />
          </div>
          <div>
            <Label>Specialization</Label>
            <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Service area</Label>
          <Input placeholder="e.g. Greater Lahore, nationwide" value={form.service_area} onChange={(e) => setForm({ ...form, service_area: e.target.value })} />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.online_consultation} onChange={(e) => setForm({ ...form, online_consultation: e.target.checked })} />
            Online consultation available
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.emergency_available} onChange={(e) => setForm({ ...form, emergency_available: e.target.checked })} />
            Emergency services available
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit expert profile"}
        </Button>
      </form>
    </div>
  );
}
