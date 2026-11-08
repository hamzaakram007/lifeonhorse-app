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

type ClubOption = { id: string; name: string };

export type BlogPostFormInitial = {
  id?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  cover_image?: string | null;
  linked_entity_type?: "club" | null;
  linked_entity_id?: string | null;
  status?: "draft" | "published";
};

export function BlogPostForm({
  initial,
  presetClubId,
  heading,
}: {
  initial?: BlogPostFormInitial;
  /** From `/blog/new?club=` — locks link to this club after ownership check. */
  presetClubId?: string | null;
  heading?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [clubName, setClubName] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    category:
      initial?.category ??
      (presetClubId || initial?.linked_entity_type === "club" ? "club_activity" : "guides"),
    linked_entity_id:
      presetClubId || initial?.linked_entity_id || "",
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
    async function loadClubs() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (presetClubId && !cancelled) {
          setOwnershipError("Sign in as the club owner to publish a club update.");
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
    void loadClubs();
    return () => {
      cancelled = true;
    };
  }, [presetClubId, initial?.linked_entity_id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const redirect = presetClubId
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

    const clubId = form.linked_entity_id || null;
    if (presetClubId && clubId !== presetClubId) {
      setError("This update must stay linked to the selected club.");
      setLoading(false);
      return;
    }
    if (clubId && !clubs.some((c) => c.id === clubId)) {
      setError("You can only link updates to clubs you own.");
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      category: form.category,
      cover_image: coverImage[0] ?? null,
      linked_entity_type: clubId ? ("club" as const) : null,
      linked_entity_id: clubId,
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
  const title =
    heading ??
    (isEdit
      ? clubLocked || form.linked_entity_id
        ? "Edit club update"
        : "Edit article"
      : clubLocked
        ? "Write club update"
        : "Write article");

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="font-serif text-2xl font-bold">{title}</h1>
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
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {BLOG_CATEGORIES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
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

      {(clubs.length > 0 || clubLocked) && (
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
      )}

      <div>
        <Label required>Content</Label>
        <Textarea
          className="min-h-40"
          required
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading || Boolean(ownershipError && clubLocked)}>
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
              : clubLocked
                ? "Publish club update"
                : "Publish article"}
      </Button>
    </form>
  );
}
