"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import {
  HORSE_DISCIPLINES,
  HORSE_GENDERS,
  HORSE_PURPOSES,
  LISTING_TYPES,
} from "@/lib/constants";

export type HorseFormValues = {
  title: string;
  description: string;
  breed: string;
  city: string;
  country_code: string;
  price: string;
  currency: string;
  listing_type: string;
  gender: string;
  age: string;
  discipline: string;
  purpose: string;
  height_cm: string;
  color: string;
};

const EMPTY: HorseFormValues = {
  title: "",
  description: "",
  breed: "",
  city: "",
  country_code: "PK",
  price: "",
  currency: "USD",
  listing_type: "sale",
  gender: "",
  age: "",
  discipline: "",
  purpose: "",
  height_cm: "",
  color: "",
};

function toPayload(form: HorseFormValues, photos: string[], videoUrl: string) {
  return {
    title: form.title.trim(),
    description: form.description || null,
    breed: form.breed || null,
    city: form.city || null,
    country_code: form.country_code,
    price: form.price ? parseFloat(form.price) : null,
    currency: form.currency,
    listing_type: form.listing_type,
    gender: form.gender || null,
    age: form.age ? parseInt(form.age, 10) : null,
    discipline: form.discipline || null,
    purpose: form.purpose || null,
    height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
    color: form.color || null,
    photos,
    video_url: videoUrl || null,
  };
}

export function HorseListingForm({
  mode,
  horseId,
  initial,
  initialPhotos = [],
  initialVideoUrl = "",
}: {
  mode: "create" | "edit";
  horseId?: string;
  initial?: Partial<HorseFormValues>;
  initialPhotos?: string[];
  initialVideoUrl?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [form, setForm] = useState<HorseFormValues>({ ...EMPTY, ...initial });

  function setField<K extends keyof HorseFormValues>(key: K, value: HorseFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const redirect =
        mode === "edit" && horseId
          ? `/marketplace/horses/${horseId}/edit`
          : "/marketplace/horses/new";
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    const payload = toPayload(form, photos, videoUrl);

    if (mode === "create") {
      const { data, error: err } = await supabase
        .from("horses")
        .insert({
          ...payload,
          owner_id: user.id,
          status: "published",
        })
        .select("id")
        .single();
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      router.push(`/marketplace/horses/${data.id}`);
      return;
    }

    if (!horseId) {
      setError("Missing horse id.");
      setLoading(false);
      return;
    }

    const { error: err } = await supabase
      .from("horses")
      .update(payload)
      .eq("id", horseId)
      .eq("owner_id", user.id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(`/marketplace/horses/${horseId}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <Label required>Title</Label>
        <Input required value={form.title} onChange={(e) => setField("title", e.target.value)} />
      </div>
      <MediaUpload
        imageBucket={STORAGE_BUCKETS.horses}
        photos={photos}
        onPhotosChange={setPhotos}
        videoUrl={videoUrl}
        onVideoChange={setVideoUrl}
        maxImages={12}
        imageLabel="Horse photos"
      />
      <div>
        <Label required>Description</Label>
        <Textarea
          rows={4}
          required
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Breed</Label>
          <Input value={form.breed} onChange={(e) => setField("breed", e.target.value)} />
        </div>
        <div>
          <Label>Listing type</Label>
          <Select value={form.listing_type} onChange={(e) => setField("listing_type", e.target.value)}>
            {LISTING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Gender</Label>
          <Select value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
            <option value="">— Select —</option>
            {HORSE_GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Age</Label>
          <Input
            type="number"
            min={0}
            value={form.age}
            onChange={(e) => setField("age", e.target.value)}
          />
        </div>
        <div>
          <Label>Discipline</Label>
          <Select value={form.discipline} onChange={(e) => setField("discipline", e.target.value)}>
            <option value="">— Select —</option>
            {HORSE_DISCIPLINES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Purpose</Label>
          <Select value={form.purpose} onChange={(e) => setField("purpose", e.target.value)}>
            <option value="">— Select —</option>
            {HORSE_PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Height (cm)</Label>
          <Input
            type="number"
            min={0}
            step="0.1"
            value={form.height_cm}
            onChange={(e) => setField("height_cm", e.target.value)}
            placeholder="e.g. 155"
          />
        </div>
        <div>
          <Label>Color</Label>
          <Input
            value={form.color}
            onChange={(e) => setField("color", e.target.value)}
            placeholder="Bay, Chestnut, Grey…"
          />
        </div>
        <div>
          <Label required>Country</Label>
          <CountrySelect
            required
            value={form.country_code}
            onChange={(c) => setField("country_code", c)}
          />
        </div>
        <div>
          <Label>City</Label>
          <Input value={form.city} onChange={(e) => setField("city", e.target.value)} />
        </div>
        <div>
          <Label>Price</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setField("price", e.target.value)}
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Input value={form.currency} onChange={(e) => setField("currency", e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading
          ? mode === "edit"
            ? "Saving…"
            : "Publishing…"
          : mode === "edit"
            ? "Save changes"
            : "Publish listing"}
      </Button>
    </form>
  );
}
