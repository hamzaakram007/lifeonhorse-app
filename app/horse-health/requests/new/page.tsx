"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { HEALTH_PROBLEM_TYPES, URGENCY_LEVELS } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

export default function NewHealthRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    horse_age: "",
    horse_breed: "",
    horse_gender: "",
    country: "PK",
    city: "",
    problem_type: "other",
    symptoms: "",
    issue_duration: "",
    urgency: "normal",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.symptoms.trim()) {
      setError("Please describe the symptoms or problem.");
      return;
    }
    if (!form.contact_email.trim()) {
      setError("Please provide a contact email.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("health_requests").insert({
      user_id: user?.id ?? null,
      horse_age: form.horse_age ? parseInt(form.horse_age, 10) : null,
      horse_breed: form.horse_breed || null,
      horse_gender: form.horse_gender || null,
      country: form.country,
      city: form.city || null,
      problem_type: form.problem_type,
      symptoms: form.symptoms.trim(),
      photos,
      issue_duration: form.issue_duration || null,
      urgency: form.urgency,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-xl bg-emerald-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-emerald-900">Request submitted</h1>
          <p className="mt-4 text-emerald-800">
            Your health request has been received. Our team will review it and may connect you with a relevant expert.
          </p>
          <p className="mt-4 text-sm text-amber-800">
            If this is an emergency, please contact a local veterinarian immediately — do not wait for a response.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/horse-health/experts" className="rounded-lg bg-emerald-800 px-4 py-2 text-white">Find an expert</Link>
            <Link href="/horse-health" className="rounded-lg border px-4 py-2">Back to Horse Health</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/horse-health" className="text-sm text-emerald-800 hover:underline">← Horse Health</Link>
      <h1 className="mt-4 text-2xl font-bold">Submit a health request</h1>
      <p className="text-sm text-stone-600">Describe your horse&apos;s issue and we&apos;ll help connect you with the right expert.</p>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Safety disclaimer:</strong> LifeOnHorse does not replace a licensed veterinarian. For emergencies — colic, severe injury, or difficulty breathing — contact a local vet immediately.
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label required>Problem type</Label>
          <Select value={form.problem_type} onChange={(e) => setForm({ ...form, problem_type: e.target.value })}>
            {HEALTH_PROBLEM_TYPES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label required>Urgency</Label>
          <Select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
            {URGENCY_LEVELS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label required>Symptoms / description</Label>
          <Textarea required rows={5} value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} placeholder="Describe what you've observed, when it started, and any treatments tried" />
        </div>
        <ImageUpload bucket={STORAGE_BUCKETS.gallery} label="Photos of the issue" multiple maxFiles={6} value={photos} onChange={setPhotos} />
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Horse age (years)</Label>
            <Input type="number" min={0} value={form.horse_age} onChange={(e) => setForm({ ...form, horse_age: e.target.value })} />
          </div>
          <div>
            <Label>Breed</Label>
            <Input value={form.horse_breed} onChange={(e) => setForm({ ...form, horse_breed: e.target.value })} />
          </div>
          <div>
            <Label>Gender</Label>
            <Input placeholder="Mare, gelding, stallion" value={form.horse_gender} onChange={(e) => setForm({ ...form, horse_gender: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>How long has the issue existed?</Label>
          <Input placeholder="e.g. 3 days, 2 weeks" value={form.issue_duration} onChange={(e) => setForm({ ...form, issue_duration: e.target.value })} />
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Your name</Label>
            <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          </div>
          <div>
            <Label required>Email</Label>
            <Input type="email" required value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </div>
          <div>
            <Label>Phone / WhatsApp</Label>
            <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit request"}
        </Button>
      </form>
    </div>
  );
}
