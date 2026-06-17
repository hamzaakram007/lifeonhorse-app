"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { CLUB_TYPES } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function RegisterClubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    club_type: "general",
    country_code: "PK",
    city: "",
    address: "",
    email: "",
    phone: "",
    website: "",
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/clubs/register");
      return;
    }

    const description = [
      form.description,
      videoUrl && `Club video: ${videoUrl}`,
    ].filter(Boolean).join("\n\n");

    const { data, error: insertError } = await supabase
      .from("clubs")
      .insert({
        owner_id: user.id,
        name: form.name.trim(),
        description: description || null,
        club_type: form.club_type,
        country_code: form.country_code,
        city: form.city || null,
        address: form.address || null,
        email: form.email || null,
        phone: form.phone || null,
        website: form.website || null,
        logo_url: logoUrl[0] ?? null,
        photos,
        status: "published",
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (data) {
      await supabase.from("profiles").update({ role: "club_owner" }).eq("id", user.id);
      router.push(`/clubs/${data.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">Register your horse club</h1>
      <p className="text-sm text-stone-600">Clubs go live immediately — add a logo, photos, and optional video.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Club name</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <ImageUpload bucket={STORAGE_BUCKETS.clubs} label="Club logo" value={logoUrl} onChange={setLogoUrl} />
        <MediaUpload
          imageBucket={STORAGE_BUCKETS.clubs}
          photos={photos}
          onPhotosChange={setPhotos}
          videoUrl={videoUrl}
          onVideoChange={setVideoUrl}
          maxImages={8}
          imageLabel="Club photos"
        />
        <div>
          <Label required>Club type</Label>
          <Select value={form.club_type} onChange={(e) => setForm({ ...form, club_type: e.target.value })}>
            {CLUB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
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
            <CountrySelect required value={form.country_code} onChange={(c) => setForm({ ...form, country_code: c })} />
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Website</Label>
          <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Publishing…" : "Publish club"}</Button>
      </form>
    </div>
  );
}
