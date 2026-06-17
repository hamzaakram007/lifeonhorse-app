"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { CLUB_TYPES } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import { slugify } from "@/lib/utils";

export default function RegisterClubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    club_type: "general",
    country: "PK",
    city: "",
    address: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    services: "",
    membership_available: false,
    training_available: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Please enter your club name.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/clubs/register");
      return;
    }

    const slug = slugify(form.name) + "-" + Date.now().toString(36);
    const { data, error: insertError } = await supabase
      .from("clubs")
      .insert({
        owner_id: user.id,
        name: form.name.trim(),
        slug,
        description: form.description || null,
        club_type: form.club_type,
        country: form.country,
        city: form.city || null,
        address: form.address || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        website: form.website || null,
        services: form.services || null,
        membership_available: form.membership_available,
        training_available: form.training_available,
        logo_url: logoUrl[0] ?? null,
        photos,
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

    if (data) {
      await supabase.from("profiles").update({ role: "club_owner" }).eq("id", user.id);
      router.push(`/clubs/${data.slug}`);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Register your horse club</h1>
      <p className="text-sm text-amber-800">Clubs go live immediately — add a logo and photos for credibility.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Club name</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <ImageUpload bucket={STORAGE_BUCKETS.clubs} label="Club logo" value={logoUrl} onChange={setLogoUrl} />
        <ImageUpload
          bucket={STORAGE_BUCKETS.clubs}
          label="Club photos"
          multiple
          maxFiles={6}
          value={photos}
          onChange={setPhotos}
        />
        <div>
          <Label required>Club type</Label>
          <Select value={form.club_type} onChange={(e) => setForm({ ...form, club_type: e.target.value })}>
            {CLUB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
        </div>
        <div>
          <Label>Address</Label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <Label>Contact email</Label>
          <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
        </div>
        <div>
          <Label>Contact phone</Label>
          <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
        </div>
        <div>
          <Label>Services offered</Label>
          <Textarea value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.membership_available} onChange={(e) => setForm({ ...form, membership_available: e.target.checked })} />{" "}
          Membership available
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.training_available} onChange={(e) => setForm({ ...form, training_available: e.target.checked })} />{" "}
          Training available
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Publishing…" : "Publish club"}
        </Button>
      </form>
    </div>
  );
}
