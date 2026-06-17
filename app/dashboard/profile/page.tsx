"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function ProfileEditPage() {
  const [form, setForm] = useState({ full_name: "", phone: "", country: "", city: "", bio: "", avatar_url: "" });
  const [avatar, setAvatar] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              full_name: data.full_name ?? "",
              phone: data.phone ?? "",
              country: data.country ?? "",
              city: data.city ?? "",
              bio: data.bio ?? "",
              avatar_url: data.avatar_url ?? "",
            });
            if (data.avatar_url) setAvatar([data.avatar_url]);
          }
        });
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ...form, avatar_url: avatar[0] ?? form.avatar_url ?? null })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold">Edit profile</h1>
      <form onSubmit={save} className="mt-6 space-y-4">
        <ImageUpload bucket={STORAGE_BUCKETS.avatars} label="Profile photo" value={avatar} onChange={setAvatar} />
        <div>
          <Label>Name</Label>
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <Label>Country</Label>
          <CountrySelect value={form.country} onChange={(country) => setForm({ ...form, country })} placeholder="—" />
        </div>
        <div>
          <Label>City</Label>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
        {saved && <p className="text-sm text-emerald-600">Profile saved.</p>}
      </form>
    </div>
  );
}
