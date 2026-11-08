"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import { EVENT_TYPES } from "@/lib/constants";

type ClubOption = { id: string; name: string };

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "horse_show",
    city: "",
    country_code: "PK",
    venue: "",
    start_date: "",
    end_date: "",
    club_id: "",
  });
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadClubs() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("clubs")
        .select("id, name")
        .eq("owner_id", user.id)
        .order("name");
      if (!cancelled) setClubs(data ?? []);
    }
    void loadClubs();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/events/new");
      return;
    }

    if (form.end_date && form.start_date && form.end_date < form.start_date) {
      setError("End date must be on or after the start date.");
      setLoading(false);
      return;
    }

    const description = [form.description, videoUrl && `Event video: ${videoUrl}`]
      .filter(Boolean)
      .join("\n\n");

    const { data, error: err } = await supabase
      .from("events")
      .insert({
        host_id: user.id,
        club_id: form.club_id || null,
        title: form.title.trim(),
        description: description || null,
        event_type: form.event_type,
        city: form.city || null,
        country_code: form.country_code,
        venue: form.venue.trim() || null,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        photos,
        status: "published",
      })
      .select("id")
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(`/events/${data.id}?created=1`);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">Create event</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <Label required>Title</Label>
        <Input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <MediaUpload
        imageBucket={STORAGE_BUCKETS.gallery}
        photos={photos}
        onPhotosChange={setPhotos}
        videoUrl={videoUrl}
        onVideoChange={setVideoUrl}
        maxImages={8}
        imageLabel="Event photos"
      />
      <div>
        <Label>Description</Label>
        <Textarea
          className="min-h-24"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Event type</Label>
          <Select
            value={form.event_type}
            onChange={(e) => setForm({ ...form, event_type: e.target.value })}
          >
            {EVENT_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Host club (optional)</Label>
          <Select
            value={form.club_id}
            onChange={(e) => setForm({ ...form, club_id: e.target.value })}
          >
            <option value="">No club linked</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </Select>
          {clubs.length === 0 ? (
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Register a club to link it as the host venue organization.
            </p>
          ) : null}
        </div>
        <div>
          <Label>Start date</Label>
          <Input
            type="datetime-local"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label>End date</Label>
          <Input
            type="datetime-local"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
        <div>
          <Label>Venue</Label>
          <Input
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            placeholder="Ground, arena, or address"
          />
        </div>
        <div>
          <Label required>Country</Label>
          <CountrySelect
            required
            value={form.country_code}
            onChange={(c) => setForm({ ...form, country_code: c })}
          />
        </div>
        <div>
          <Label>City</Label>
          <Input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Publishing…" : "Publish event"}
      </Button>
    </form>
  );
}
