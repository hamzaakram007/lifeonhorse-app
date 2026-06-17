"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { TRAINER_TYPES } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import { slugify } from "@/lib/utils";

export default function ApplyTrainerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    display_name: "",
    trainer_type: "riding",
    bio: "",
    country: "PK",
    city: "",
    experience_years: "",
    certifications: "",
    contact_email: "",
    contact_phone: "",
    whatsapp: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.display_name.trim()) {
      setError("Please enter your display name.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/trainers/apply");
      return;
    }

    const slug = slugify(form.display_name) + "-" + Date.now().toString(36);
    const { data, error: insertError } = await supabase
      .from("trainers")
      .insert({
        user_id: user.id,
        display_name: form.display_name.trim(),
        slug,
        trainer_type: form.trainer_type,
        bio: form.bio || null,
        country: form.country,
        city: form.city || null,
        experience_years: form.experience_years ? parseInt(form.experience_years, 10) : null,
        certifications: form.certifications || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        whatsapp: form.whatsapp || null,
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
      await supabase.from("profiles").update({ role: "trainer" }).eq("id", user.id);
      router.push(`/trainers/${data.slug}`);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Apply as trainer / expert</h1>
      <p className="text-sm text-stone-600">Build trust with a photo and complete profile details.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Display name</Label>
          <Input required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        </div>
        <ImageUpload bucket={STORAGE_BUCKETS.gallery} label="Profile photos" multiple maxFiles={4} value={photos} onChange={setPhotos} />
        <div>
          <Label>Type</Label>
          <Select value={form.trainer_type} onChange={(e) => setForm({ ...form, trainer_type: e.target.value })}>
            {TRAINER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
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
            <Label>Years of experience</Label>
            <Input type="number" min={0} value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
          </div>
          <div>
            <Label>Contact email</Label>
            <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Certifications</Label>
          <Textarea value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Publishing…" : "Publish profile"}
        </Button>
      </form>
    </div>
  );
}
