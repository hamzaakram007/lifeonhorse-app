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
import type { BlogLinkedEntityType } from "@/lib/blog/linked-entity";

type ClubOption = { id: string; name: string };
type ExpertOption = { id: string; display_name: string };

export type BlogPostFormInitial = {
  id?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  cover_image?: string | null;
  linked_entity_type?: BlogLinkedEntityType | null;
  linked_entity_id?: string | null;
  status?: "draft" | "published";
};

function defaultCategory(
  presetClubId?: string | null,
  presetExpertId?: string | null,
  linkedType?: BlogLinkedEntityType | null
) {
  if (presetExpertId || linkedType === "expert") return "health";
  if (presetClubId || linkedType === "club") return "club_activity";
  return "guides";
}

export function BlogPostForm({
  initial,
  presetClubId,
  presetExpertId,
  heading,
}: {
  initial?: BlogPostFormInitial;
  /** From `/blog/new?club=` — locks link to this club after ownership check. */
  presetClubId?: string | null;
  /** From `/blog/new?expert=` — locks link to this expert after ownership check. */
  presetExpertId?: string | null;
  heading?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const expertMode = Boolean(
    presetExpertId || initial?.linked_entity_type === "expert"
  );
  const clubMode = Boolean(
    !expertMode && (presetClubId || initial?.linked_entity_type === "club")
  );

  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [experts, setExperts] = useState<ExpertOption[]>([]);
  const [clubName, setClubName] = useState<string | null>(null);
  const [expertName, setExpertName] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    category:
      initial?.category ??
      defaultCategory(presetClubId, presetExpertId, initial?.linked_entity_type),
    linked_entity_id:
      (expertMode ? presetExpertId : presetClubId) ||
      initial?.linked_entity_id ||
      "",
    status: (initial?.status === "draft" ? "draft" : "published") as
      | "draft"
      | "published",
  });
  const [coverImage, setCoverImage] = useState<string[]>(
    initial?.cover_image ? [initial.cover_image] : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ownershipError, setOwnershipError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadOwned() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled && (presetClubId || presetExpertId)) {
          setOwnershipError(
            presetExpertId
              ? "Sign in as this expert to publish a health tip."
              : "Sign in as the club owner to publish a club update."
          );
        }
        return;
      }

      if (expertMode) {
        const { data } = await supabase
          .from("experts")
          .select("id, display_name")
          .eq("user_id", user.id)
          .order("display_name");
        if (cancelled) return;
        const owned = data ?? [];
        setExperts(owned);

        if (presetExpertId) {
          const match = owned.find((e) => e.id === presetExpertId);
          if (!match) {
            setOwnershipError("You can only publish health tips for your own expert profile.");
            setForm((prev) => ({ ...prev, linked_entity_id: "" }));
          } else {
            setExpertName(match.display_name);
            setForm((prev) => ({
              ...prev,
              linked_entity_id: match.id,
              category: "health",
            }));
          }
        } else if (initial?.linked_entity_id) {
          const match = owned.find((e) => e.id === initial.linked_entity_id);
          if (match) setExpertName(match.display_name);
        }
        return;
      }

      const { data } = await supabase
        .from("clubs")
        .select("id, name")
        .eq("owner_id", user.id)
        .order("name");
      if (cancelled) return;
      const owned = data ?? [];
      setClubs(owned);

      if (presetClubId) {
        const match = owned.find((c) => c.id === presetClubId);
        if (!match) {
          setOwnershipError("You can only post updates for clubs you own.");
          setForm((prev) => ({ ...prev, linked_entity_id: "" }));
        } else {
          setClubName(match.name);
          setForm((prev) => ({
            ...prev,
            linked_entity_id: match.id,
            category: prev.category || "club_activity",
          }));
        }
      } else if (initial?.linked_entity_id) {
        const match = owned.find((c) => c.id === initial.linked_entity_id);
        if (match) setClubName(match.name);
      }
    }
    void loadOwned();
    return () => {
      cancelled = true;
    };
  }, [
    presetClubId,
    presetExpertId,
    expertMode,
    initial?.linked_entity_id,
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
      const redirect = presetExpertId
        ? `/blog/new?expert=${presetExpertId}`
        : presetClubId
          ? `/blog/new?club=${presetClubId}`
          : isEdit
            ? `/blog/${initial!.id}/edit`
            : "/blog/new";
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (ownershipError) {
      setError(ownershipError);
      setLoading(false);
      return;
    }

    const entityId = form.linked_entity_id || null;
    if (presetExpertId && entityId !== presetExpertId) {
      setError("This tip must stay linked to your expert profile.");
      setLoading(false);
      return;
    }
    if (presetClubId && entityId !== presetClubId) {
      setError("This update must stay linked to the selected club.");
      setLoading(false);
      return;
    }
    if (expertMode && entityId && !experts.some((ex) => ex.id === entityId)) {
      setError("You can only link tips to your own expert profile.");
      setLoading(false);
      return;
    }
    if (!expertMode && entityId && clubs.length && !clubs.some((c) => c.id === entityId)) {
      setError("You can only link updates to clubs you own.");
      setLoading(false);
      return;
    }

    const linkedType: BlogLinkedEntityType | null = entityId
      ? expertMode
        ? "expert"
        : "club"
      : null;

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      category: expertMode ? "health" : form.category,
      cover_image: coverImage[0] ?? null,
      linked_entity_type: linkedType,
      linked_entity_id: entityId,
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

  const clubLocked = Boolean(presetClubId);
  const expertLocked = Boolean(presetExpertId);
  const entityLocked = clubLocked || expertLocked;

  const title =
    heading ??
    (isEdit
      ? expertMode
        ? "Edit health tip"
        : clubMode || form.linked_entity_id
          ? "Edit club update"
          : "Edit article"
      : expertLocked
        ? "Write health tip"
        : clubLocked
          ? "Write club update"
          : "Write article");

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">{title}</h1>
      {expertLocked && expertName ? (
        <p className="text-sm text-[var(--color-muted)]">
          Publishing for{" "}
          <span className="font-medium text-[var(--color-text)]">{expertName}</span>.
          Tips use the Health category and appear in the Journal and on your expert profile.
        </p>
      ) : null}
      {clubLocked && clubName ? (
        <p className="text-sm text-[var(--color-muted)]">
          Publishing for <span className="font-medium text-[var(--color-text)]">{clubName}</span>.
          This update appears in the Journal and on the club page.
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
            value={expertMode ? "health" : form.category}
            disabled={expertMode}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {BLOG_CATEGORIES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          {expertMode ? (
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

      {expertMode ? (
        <div>
          <Label>{expertLocked ? "Expert profile" : "Link to expert"}</Label>
          <Select
            value={form.linked_entity_id}
            disabled={expertLocked || Boolean(ownershipError)}
            onChange={(e) => {
              const next = e.target.value;
              const match = experts.find((ex) => ex.id === next);
              setExpertName(match?.display_name ?? null);
              setForm((prev) => ({
                ...prev,
                linked_entity_id: next,
                category: "health",
              }));
            }}
          >
            {!expertLocked ? <option value="">No expert linked</option> : null}
            {experts.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.display_name}
              </option>
            ))}
          </Select>
        </div>
      ) : (clubs.length > 0 || clubLocked) ? (
        <div>
          <Label>{clubLocked ? "Club" : "Link to club (optional)"}</Label>
          <Select
            value={form.linked_entity_id}
            disabled={clubLocked || Boolean(ownershipError)}
            onChange={(e) => {
              const next = e.target.value;
              const match = clubs.find((c) => c.id === next);
              setClubName(match?.name ?? null);
              setForm((prev) => ({
                ...prev,
                linked_entity_id: next,
                category:
                  next && prev.category === "guides" ? "club_activity" : prev.category,
              }));
            }}
          >
            {!clubLocked ? <option value="">No club linked</option> : null}
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </Select>
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

      {expertMode ? (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/90 p-3 text-xs text-amber-950">
          Tips are educational only — not a veterinary diagnosis. Readers will see a health
          disclaimer on the article page.
        </p>
      ) : null}

      <Button type="submit" disabled={loading || Boolean(ownershipError && entityLocked)}>
        {loading
          ? isEdit
            ? "Saving…"
            : form.status === "draft"
              ? "Saving draft…"
              : "Publishing…"
          : isEdit
            ? "Save changes"
            : form.status === "draft"
              ? "Save draft"
              : expertLocked
                ? "Publish health tip"
                : clubLocked
                  ? "Publish club update"
                  : "Publish article"}
      </Button>
    </form>
  );
}
