"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MediaUpload } from "@/components/ui/MediaUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/lib/constants";
import { claimProfileRole } from "@/lib/profiles/claim-role";
import { normalizeLessons, type CourseLesson } from "@/lib/courses/lessons";

type LessonDraft = { title: string; content: string; url: string };

const emptyLesson = (): LessonDraft => ({ title: "", content: "", url: "" });

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "training",
    level: "beginner",
    is_free: "true",
    price: "",
    currency: "USD",
  });
  const [lessons, setLessons] = useState<LessonDraft[]>([emptyLesson()]);
  const [coverImage, setCoverImage] = useState<string[]>([]);
  const [promoPhotos, setPromoPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateLesson(index: number, patch: Partial<LessonDraft>) {
    setLessons((prev) => prev.map((lesson, i) => (i === index ? { ...lesson, ...patch } : lesson)));
  }

  function addLesson() {
    setLessons((prev) => [...prev, emptyLesson()]);
  }

  function removeLesson(index: number) {
    setLessons((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
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
      router.push("/auth/login?redirect=/courses/new");
      return;
    }

    const description = [
      form.description,
      promoPhotos.length > 0 && `Gallery: ${promoPhotos.join(", ")}`,
      videoUrl && `Promo video: ${videoUrl}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const lessonsPayload: CourseLesson[] = normalizeLessons(lessons);

    const { data, error: err } = await supabase
      .from("courses")
      .insert({
        creator_id: user.id,
        title: form.title.trim(),
        description: description || null,
        category: form.category,
        level: form.level || null,
        cover_image: coverImage[0] ?? null,
        is_free: form.is_free === "true",
        price: form.is_free === "false" && form.price ? parseFloat(form.price) : null,
        currency: form.currency,
        lessons: lessonsPayload,
        status: "published",
      })
      .select("id")
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const { error: roleError } = await claimProfileRole(supabase, "course_creator");
    if (roleError) {
      setError(roleError);
      setLoading(false);
      return;
    }

    router.push(`/courses/${data.id}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">Create course</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <Label required>Title</Label>
        <Input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <ImageUpload
        bucket={STORAGE_BUCKETS.gallery}
        label="Cover image"
        value={coverImage}
        onChange={setCoverImage}
      />
      <MediaUpload
        imageBucket={STORAGE_BUCKETS.gallery}
        photos={promoPhotos}
        onPhotosChange={setPromoPhotos}
        videoUrl={videoUrl}
        onVideoChange={setVideoUrl}
        maxImages={6}
        imageLabel="Course preview photos"
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
          <Label>Category</Label>
          <Select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {COURSE_CATEGORIES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Level</Label>
          <Select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
          >
            {COURSE_LEVELS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Pricing</Label>
          <Select
            value={form.is_free}
            onChange={(e) => setForm({ ...form, is_free: e.target.value })}
          >
            <option value="true">Free</option>
            <option value="false">Paid</option>
          </Select>
        </div>
        {form.is_free === "false" && (
          <>
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />
            </div>
            <p className="sm:col-span-2 text-sm text-[var(--color-muted)]">
              Paid flag is stored now; Stripe/checkout is not integrated yet. Learners see a
              “payments later” notice and can preview the first lesson only.
            </p>
          </>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Lessons</h2>
            <p className="text-xs text-[var(--color-muted)]">
              Title plus optional content or media URL — stored as JSON on the course.
            </p>
          </div>
          <button type="button" className="btn btn-secondary text-sm" onClick={addLesson}>
            Add lesson
          </button>
        </div>
        {lessons.map((lesson, index) => (
          <div
            key={index}
            className="space-y-3 border-t border-[var(--color-border)] pt-3 first:border-t-0 first:pt-0"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Lesson {index + 1}</p>
              {lessons.length > 1 ? (
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() => removeLesson(index)}
                >
                  Remove
                </button>
              ) : null}
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={lesson.title}
                onChange={(e) => updateLesson(index, { title: e.target.value })}
                placeholder="Introduction to tack"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                className="min-h-20"
                value={lesson.content}
                onChange={(e) => updateLesson(index, { content: e.target.value })}
                placeholder="Lesson notes or outline"
              />
            </div>
            <div>
              <Label>Media / resource URL</Label>
              <Input
                value={lesson.url}
                onChange={(e) => updateLesson(index, { url: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Publishing…" : "Publish course"}
      </Button>
    </form>
  );
}
