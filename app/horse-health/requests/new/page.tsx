"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { HEALTH_PROBLEM_TYPES } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";

const URGENCY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "urgent", label: "Urgent (non-emergency)" },
] as const;

function NewHealthRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expertId = searchParams.get("expert_id");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [form, setForm] = useState({
    horse_name: "",
    problem_type: "other",
    issue_description: "",
    urgency: "normal",
    country_code: "PK",
    disclaimer_accepted: false,
    emergency_acknowledged: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.issue_description.trim()) {
      setError("Please describe the issue.");
      return;
    }
    if (!form.disclaimer_accepted || !form.emergency_acknowledged) {
      setError("You must accept the emergency and health disclaimers.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/horse-health/requests/new");
      return;
    }

    const problemLabel =
      HEALTH_PROBLEM_TYPES.find((p) => p.value === form.problem_type)?.label ?? form.problem_type;
    const issue_description = `[${problemLabel}] ${form.issue_description.trim()}`;

    const { error: insertError } = await supabase.from("health_requests").insert({
      user_id: user.id,
      expert_id: expertId || null,
      horse_name: form.horse_name.trim() || null,
      issue_description,
      urgency: form.urgency,
      country_code: form.country_code,
      photos,
      video_url: videoUrl || null,
      disclaimer_accepted: true,
      emergency_acknowledged: true,
      status: "open",
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
            <Link href="/horse-health/experts" className="rounded-lg bg-emerald-800 px-4 py-2 text-white">
              Find an expert
            </Link>
            <Link href="/horse-health" className="rounded-lg border px-4 py-2">
              Back to Horse Health
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/horse-health" className="text-sm text-emerald-800 hover:underline">
        ← Horse Health
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Submit a health request</h1>
      <p className="text-sm text-stone-600">
        Describe your horse&apos;s issue and we&apos;ll help connect you with the right expert.
        {expertId ? " This request will be linked to the selected expert." : null}
      </p>

      <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>NOT FOR EMERGENCIES.</strong> LifeOnHorse does not replace a licensed veterinarian. For emergencies —
        colic, severe injury, inability to stand, or difficulty breathing — contact a local vet immediately.{" "}
        <Link href="/legal/health-disclaimer" className="underline">
          Full disclaimer
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label>Horse name</Label>
          <Input
            value={form.horse_name}
            onChange={(e) => setForm({ ...form, horse_name: e.target.value })}
            placeholder="Optional"
          />
        </div>
        <div>
          <Label required>Problem type</Label>
          <Select
            value={form.problem_type}
            onChange={(e) => setForm({ ...form, problem_type: e.target.value })}
          >
            {HEALTH_PROBLEM_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label required>Urgency</Label>
          <Select
            value={form.urgency}
            onChange={(e) => setForm({ ...form, urgency: e.target.value })}
          >
            {URGENCY_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label required>Describe the issue</Label>
          <Textarea
            required
            rows={5}
            value={form.issue_description}
            onChange={(e) => setForm({ ...form, issue_description: e.target.value })}
            placeholder="Describe what you've observed, when it started, and any treatments tried"
          />
        </div>
        <MediaUpload
          imageBucket={STORAGE_BUCKETS.uploads}
          photos={photos}
          onPhotosChange={setPhotos}
          videoUrl={videoUrl}
          onVideoChange={setVideoUrl}
          maxImages={6}
          imageLabel="Photos of the issue"
        />
        <div>
          <Label required>Country</Label>
          <CountrySelect
            required
            value={form.country_code}
            onChange={(country_code) => setForm({ ...form, country_code })}
          />
        </div>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.emergency_acknowledged}
            onChange={(e) => setForm({ ...form, emergency_acknowledged: e.target.checked })}
          />
          I understand this is NOT for emergencies and I will contact a local vet for life-threatening conditions.
        </label>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.disclaimer_accepted}
            onChange={(e) => setForm({ ...form, disclaimer_accepted: e.target.checked })}
          />
          I accept the{" "}
          <Link href="/legal/health-disclaimer" className="underline">
            health disclaimer
          </Link>{" "}
          and understand online advice is informational only.
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit request"}
        </Button>
      </form>
    </div>
  );
}

export default function NewHealthRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-8">
          <p className="text-stone-500">Loading…</p>
        </div>
      }
    >
      <NewHealthRequestForm />
    </Suspense>
  );
}
