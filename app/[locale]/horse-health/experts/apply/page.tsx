"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { EXPERT_CATEGORIES } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function ApplyExpertPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [form, setForm] = useState({
    display_name: "",
    specialty: "vet",
    credentials: "",
    country_code: "PK",
    city: "",
    description: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.display_name.trim()) {
      setError("Please enter your display name.");
      return;
    }
    if (!form.credentials.trim()) {
      setError("Please provide your credentials or certification details.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/horse-health/experts/apply");
      return;
    }

    const specialtyLabel =
      EXPERT_CATEGORIES.find((c) => c.value === form.specialty)?.label ?? form.specialty;
    const description = [form.description.trim(), videoUrl && `Intro video: ${videoUrl}`]
      .filter(Boolean)
      .join("\n\n");

    const { data, error: insertError } = await supabase
      .from("experts")
      .insert({
        user_id: user.id,
        display_name: form.display_name.trim(),
        specialty: specialtyLabel,
        credentials: form.credentials.trim(),
        country_code: form.country_code,
        city: form.city.trim() || null,
        description: description || null,
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
    if (data) router.push(`/horse-health/experts/${data.id}`);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/horse-health/experts" className="text-sm text-emerald-800 hover:underline">
        ← Back to experts
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Apply as equine expert</h1>
      <p className="text-sm text-stone-600">
        Share your credentials and expertise to help horse owners. Profiles are informational and do not replace a
        licensed veterinarian.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Display name</Label>
          <Input
            required
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          />
        </div>
        <MediaUpload
          imageBucket={STORAGE_BUCKETS.uploads}
          photos={photos}
          onPhotosChange={setPhotos}
          videoUrl={videoUrl}
          onVideoChange={setVideoUrl}
          maxImages={6}
          imageLabel="Profile photos"
        />
        <div>
          <Label required>Specialty</Label>
          <Select
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          >
            {EXPERT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label required>Credentials</Label>
          <Textarea
            required
            rows={2}
            value={form.credentials}
            onChange={(e) => setForm({ ...form, credentials: e.target.value })}
            placeholder="License number, issuing authority, certifications"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Country</Label>
            <CountrySelect
              required
              value={form.country_code}
              onChange={(country_code) => setForm({ ...form, country_code })}
            />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Clinic affiliation, service area, online consultation notes…"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit expert profile"}
        </Button>
      </form>
    </div>
  );
}
