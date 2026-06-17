"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function NewTrainerPage() {
  const router = useRouter();
  const [form, setForm] = useState({ display_name: "", specialty: "", description: "", city: "", country_code: "PK", experience_years: "5", email: "", phone: "" });
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/trainers/new");
      return;
    }
    const description = [form.description, videoUrl && `Intro video: ${videoUrl}`].filter(Boolean).join("\n\n");
    const { data, error: err } = await supabase.from("trainers").insert({
      user_id: user.id,
      display_name: form.display_name.trim(),
      specialty: form.specialty || null,
      description: description || null,
      city: form.city || null,
      country_code: form.country_code,
      experience_years: form.experience_years ? parseInt(form.experience_years, 10) : null,
      email: form.email || null,
      phone: form.phone || null,
      photos,
      status: "published",
    }).select("id").single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(`/trainers/${data.id}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">Register as trainer</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <Label required>Display name</Label>
        <Input required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
      </div>
      <MediaUpload
        imageBucket={STORAGE_BUCKETS.gallery}
        photos={photos}
        onPhotosChange={setPhotos}
        videoUrl={videoUrl}
        onVideoChange={setVideoUrl}
        maxImages={6}
        imageLabel="Profile photos"
      />
      <div>
        <Label required>Specialty</Label>
        <Input required value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Polo, dressage, farrier…" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea className="min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
        <div>
          <Label>Years of experience</Label>
          <Input type="number" min={0} value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Publish profile"}</Button>
    </form>
  );
}
