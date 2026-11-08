"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, Select } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { STORAGE_BUCKETS } from "@/lib/storage/upload";
import { BLOG_CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import {
  defaultCategoryForLinkedEntity,
  type BlogComposerEntityType,
} from "@/lib/blog/linked-entity";

type EntityOption = { id: string; name: string };

export type BlogPostFormInitial = {
  id?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  cover_image?: string | null;
  linked_entity_type?: BlogComposerEntityType | null;
  linked_entity_id?: string | null;
  status?: "draft" | "published";
};

function resolvePresetType(opts: {
  presetClubId?: string | null;
  presetTrainerId?: string | null;
  presetCourseId?: string | null;
  presetExpertId?: string | null;
  initialType?: BlogComposerEntityType | null;
}): BlogComposerEntityType | null {
  // Priority when multiple params present: expert > trainer > course > club
  if (opts.presetExpertId) return "expert";
  if (opts.presetTrainerId) return "trainer";
  if (opts.presetCourseId) return "course";
  if (opts.presetClubId) return "club";
  return opts.initialType ?? null;
}

function composerRedirect(opts: {
  type: BlogComposerEntityType | null;
  id: string | null;
  isEdit: boolean;
  editId?: string;
}) {
  if (opts.type && opts.id) return `/blog/new?${opts.type}=${opts.id}`;
  if (opts.isEdit && opts.editId) return `/blog/${opts.editId}/edit`;
  return "/blog/new";
}

export function BlogPostForm({
  initial,
  presetClubId,
  presetTrainerId,
  presetCourseId,
  presetExpertId,
  heading,
}: {
  initial?: BlogPostFormInitial;
  presetClubId?: string | null;
  presetTrainerId?: string | null;
  presetCourseId?: string | null;
  presetExpertId?: string | null;
  heading?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const presetType = resolvePresetType({
    presetClubId,
    presetTrainerId,
    presetCourseId,
    presetExpertId,
    initialType: initial?.linked_entity_type,
  });
  const presetId =
    (presetType === "expert"
      ? presetExpertId
      : presetType === "trainer"
        ? presetTrainerId
        : presetType === "course"
          ? presetCourseId
          : presetType === "club"
            ? presetClubId
            : null) ||
    (initial?.linked_entity_type ? initial.linked_entity_id : null) ||
    null;

  const entityLocked = Boolean(presetType && presetId);

  const [clubs, setClubs] = useState<EntityOption[]>([]);
  const [experts, setExperts] = useState<EntityOption[]>([]);
  const [entityName, setEntityName] = useState<string | null>(null);
  const [linkedType, setLinkedType] = useState<BlogComposerEntityType | null>(
    presetType ?? initial?.linked_entity_type ?? null
  );
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    category:
      initial?.category ??
      defaultCategoryForLinkedEntity(presetType ?? initial?.linked_entity_type),
    linked_entity_id: presetId || initial?.linked_entity_id || "",
    status: (initial?.status === "draft" ? "draft" : "published") as "draft" | "published",
  });
  const [coverImage, setCoverImage] = useState<string[]>(
    initial?.cover_image ? [initial.cover_image] : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ownershipError, setOwnershipError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadOwnership() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const targetType = resolvePresetType({
        presetClubId,
        presetTrainerId,
        presetCourseId,
        presetExpertId,
        initialType: initial?.linked_entity_type,
      });
      const targetId =
        (targetType === "expert"
          ? presetExpertId
          : targetType === "trainer"
            ? presetTrainerId
            : targetType === "course"
              ? presetCourseId
              : targetType === "club"
                ? presetClubId
                : null) ||
        initial?.linked_entity_id ||
        null;

      if (!user) {
        if (targetType && targetId && !cancelled) {
          const noun =
            targetType === "club"
              ? "club owner"
              : targetType === "trainer"
                ? "trainer"
                : targetType === "course"
                  ? "course creator"
                  : "expert";
          setOwnershipError(`Sign in as the ${noun} to publish this update.`);
        }
        return;
      }

      const { data: ownedClubs } = await supabase
        .from("clubs")
        .select("id, name")
        .eq("owner_id", user.id)
        .order("name");
      if (cancelled) return;
      const clubOptions = ownedClubs ?? [];
      setClubs(clubOptions);

      if (targetType === "expert" && targetId) {
        const { data: ownedExperts } = await supabase
          .from("experts")
          .select("id, display_name")
          .eq("user_id", user.id)
          .order("display_name");
        if (cancelled) return;
        const expertOptions = (ownedExperts ?? []).map((e) => ({
          id: e.id,
          name: e.display_name,
        }));
        setExperts(expertOptions);
        const match = expertOptions.find((e) => e.id === targetId);
        if (!match) {
          setOwnershipError("You can only publish health tips for your own expert profile.");
          setForm((prev) => ({ ...prev, linked_entity_id: "" }));
          setLinkedType(null);
        } else {
          setEntityName(match.name);
          setLinkedType("expert");
          setForm((prev) => ({
            ...prev,
            linked_entity_id: match.id,
            category: "health",
          }));
        }
        return;
      }

      if (targetType === "club" && targetId) {
        const match = clubOptions.find((c) => c.id === targetId);
        if (!match) {
          setOwnershipError("You can only post updates for clubs you own.");
          setForm((prev) => ({ ...prev, linked_entity_id: "" }));
          setLinkedType(null);
        } else {
          setEntityName(match.name);
          setLinkedType("club");
          setForm((prev) => ({
            ...prev,
            linked_entity_id: match.id,
            category: prev.category || "club_activity",
          }));
        }
        return;
      }

      if (targetType === "trainer" && targetId) {
        const { data: trainer } = await supabase
          .from("trainers")
          .select("id, display_name")
          .eq("id", targetId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (!trainer) {
          setOwnershipError("You can only share tips for your own trainer profile.");
          setForm((prev) => ({ ...prev, linked_entity_id: "" }));
          setLinkedType(null);
        } else {
          setEntityName(trainer.display_name);
          setLinkedType("trainer");
          setForm((prev) => ({
            ...prev,
            linked_entity_id: trainer.id,
            category: prev.category || "trainer_tips",
          }));
        }
        return;
      }

      if (targetType === "course" && targetId) {
        const { data: course } = await supabase
          .from("courses")
          .select("id, title")
          .eq("id", targetId)
          .eq("creator_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (!course) {
          setOwnershipError("You can only post updates for courses you created.");
          setForm((prev) => ({ ...prev, linked_entity_id: "" }));
          setLinkedType(null);
        } else {
          setEntityName(course.title);
          setLinkedType("course");
          setForm((prev) => ({
            ...prev,
            linked_entity_id: course.id,
            category: prev.category || "course_updates",
          }));
        }
        return;
      }

      if (initial?.linked_entity_id && initial.linked_entity_type === "club") {
        const match = clubOptions.find((c) => c.id === initial.linked_entity_id);
        if (match) {
          setEntityName(match.name);
          setLinkedType("club");
        }
      }
    }
    void loadOwnership();
    return () => {
      cancelled = true;
    };
  }, [
    presetClubId,
    presetTrainerId,
    presetCourseId,
    presetExpertId,
    initial?.linked_entity_id,
    initial?.linked_entity_type,
  ]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const redirect = composerRedirect({
        type: presetType,
        id: presetId,
        isEdit,
        editId: initial?.id,
      });
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (ownershipError) {
      setError(ownershipError);
      setLoading(false);
      return;
    }

    const entityId = form.linked_entity_id || null;
    if (presetId && entityId !== presetId) {
      setError("This update must stay linked to the selected entity.");
      setLoading(false);
      return;
    }

    let resolvedType: BlogComposerEntityType | null = linkedType;
    if (presetType) resolvedType = presetType;
    else if (entityId && clubs.some((c) => c.id === entityId)) resolvedType = "club";
    else if (!entityId) resolvedType = null;

    if (resolvedType === "club" && entityId && !clubs.some((c) => c.id === entityId)) {
      setError("You can only link updates to clubs you own.");
      setLoading(false);
      return;
    }
    if (resolvedType === "expert" && entityId && !experts.some((ex) => ex.id === entityId)) {
      setError("You can only link tips to your own expert profile.");
      setLoading(false);
      return;
    }
    if (
      (resolvedType === "trainer" || resolvedType === "course" || resolvedType === "expert") &&
      !entityId
    ) {
      setError("Missing linked entity.");
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      category: resolvedType === "expert" ? "health" : form.category,
      cover_image: coverImage[0] ?? null,
      linked_entity_type: entityId && resolvedType ? resolvedType : null,
      linked_entity_id: entityId && resolvedType ? entityId : null,
      status: form.status,
      published_at: form.status === "published" ? new Date().toISOString() : null,
    };

    if (isEdit && initial?.id) {
      const { error: err } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", initial.id);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      router.push(`/blog/${initial.id}`);
      router.refresh();
      return;
    }

    const slug = slugify(form.title) + "-" + Date.now().toString(36);
    const { data, error: err } = await supabase
      .from("blog_posts")
      .insert({
        ...payload,
        slug,
        author_id: user.id,
      })
      .select("id")
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push(`/blog/${data.id}`);
    router.refresh();
  }

  const activeType = presetType || linkedType;
  const title =
    heading ??
    (isEdit
      ? activeType === "club"
        ? "Edit club update"
        : activeType === "trainer"
          ? "Edit trainer tip"
          : activeType === "course"
            ? "Edit course update"
            : activeType === "expert"
              ? "Edit health tip"
              : "Edit article"
      : presetType === "club"
        ? "Write club update"
        : presetType === "trainer"
          ? "Share a tip"
          : presetType === "course"
            ? "Post about this course"
            : presetType === "expert"
              ? "Write health tip"
              : "Write article");

  const publishingCopy =
    activeType === "club"
      ? "This update appears in the Journal and on the club page."
      : activeType === "trainer"
        ? "This tip appears in the Journal and on your trainer profile."
        : activeType === "course"
          ? "This note appears in the Journal and on the course page."
          : activeType === "expert"
            ? "Tips use the Health category and appear in the Journal and on your expert profile."
            : null;

  const showClubSelect =
    !presetTrainerId &&
    !presetCourseId &&
    !presetExpertId &&
    linkedType !== "trainer" &&
    linkedType !== "course" &&
    linkedType !== "expert" &&
    (clubs.length > 0 || Boolean(presetClubId));

  const showExpertSelect = activeType === "expert";

  const submitLabel = loading
    ? isEdit
      ? "Saving…"
      : form.status === "draft"
        ? "Saving draft…"
        : "Publishing…"
    : isEdit
      ? "Save changes"
      : form.status === "draft"
        ? "Save draft"
        : presetType === "club"
          ? "Publish club update"
          : presetType === "trainer"
            ? "Publish tip"
            : presetType === "course"
              ? "Publish course update"
              : presetType === "expert"
                ? "Publish health tip"
                : "Publish article";

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">{title}</h1>
      {entityLocked && entityName ? (
        <p className="text-sm text-[var(--color-muted)]">
          Publishing for <span className="font-medium text-[var(--color-text)]">{entityName}</span>.
          {publishingCopy ? ` ${publishingCopy}` : null}
        </p>
      ) : null}
      {ownershipError ? <p className="text-sm text-red-600">{ownershipError}</p> : null}
      {error && error !== ownershipError ? <p className="text-sm text-red-600">{error}</p> : null}

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

      <div>
        <Label>Excerpt</Label>
        <Input
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          placeholder="Short summary for listings"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Category</Label>
          <Select
            value={activeType === "expert" ? "health" : form.category}
            disabled={activeType === "expert"}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {BLOG_CATEGORIES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          {activeType === "expert" ? (
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Expert tips always use the Health category.
            </p>
          ) : null}
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as "draft" | "published" })
            }
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
        </div>
      </div>

      {showExpertSelect ? (
        <div>
          <Label>{presetExpertId ? "Expert profile" : "Link to expert"}</Label>
          <Select
            value={form.linked_entity_id}
            disabled={Boolean(presetExpertId) || Boolean(ownershipError)}
            onChange={(e) => {
              const next = e.target.value;
              const match = experts.find((ex) => ex.id === next);
              setEntityName(match?.name ?? null);
              setLinkedType(next ? "expert" : null);
              setForm((prev) => ({
                ...prev,
                linked_entity_id: next,
                category: "health",
              }));
            }}
          >
            {!presetExpertId ? <option value="">No expert linked</option> : null}
            {experts.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {showClubSelect ? (
        <div>
          <Label>{presetClubId ? "Club" : "Link to club (optional)"}</Label>
          <Select
            value={form.linked_entity_id}
            disabled={Boolean(presetClubId) || Boolean(ownershipError)}
            onChange={(e) => {
              const next = e.target.value;
              const match = clubs.find((c) => c.id === next);
              setEntityName(match?.name ?? null);
              setLinkedType(next ? "club" : null);
              setForm((prev) => ({
                ...prev,
                linked_entity_id: next,
                category:
                  next && prev.category === "guides" ? "club_activity" : prev.category,
              }));
            }}
          >
            {!presetClubId ? <option value="">No club linked</option> : null}
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {(presetTrainerId || linkedType === "trainer") && entityName ? (
        <div>
          <Label>Trainer</Label>
          <Input value={entityName} disabled />
        </div>
      ) : null}

      {(presetCourseId || linkedType === "course") && entityName ? (
        <div>
          <Label>Course</Label>
          <Input value={entityName} disabled />
        </div>
      ) : null}

      <div>
        <Label required>Content</Label>
        <Textarea
          className="min-h-40"
          required
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </div>

      {activeType === "expert" ? (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/90 p-3 text-xs text-amber-950">
          Tips are educational only — not a veterinary diagnosis. Readers will see a health
          disclaimer on the article page.
        </p>
      ) : null}

      <Button type="submit" disabled={loading || Boolean(ownershipError && entityLocked)}>
        {submitLabel}
      </Button>
    </form>
  );
}
