import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminActions } from "@/components/admin/AdminActions";
import { Badge } from "@/components/ui/Card";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";
import {
  BLOG_COMPOSER_ENTITY_TYPES,
  isBlogComposerEntityType,
  linkedEntityBadgeLabel,
  linkedEntityHref,
  type BlogComposerEntityType,
} from "@/lib/blog/linked-entity";

type AdminBlogSearchParams = {
  entity_type?: string | string[];
};

type BlogAdminRow = {
  id: string;
  title: string;
  status: string;
  category: string | null;
  is_featured: boolean;
  linked_entity_type?: string | null;
  linked_entity_id?: string | null;
  created_at?: string | null;
};

const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "All" },
  ...BLOG_COMPOSER_ENTITY_TYPES.map((type) => ({
    key: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  })),
  { key: "none", label: "Unlinked" },
];

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<AdminBlogSearchParams>;
}) {
  const params = await searchParams;
  const rawEntityType = firstParam(params.entity_type);
  const entityTypeFilter: BlogComposerEntityType | "none" | null =
    rawEntityType === "none"
      ? "none"
      : isBlogComposerEntityType(rawEntityType)
        ? rawEntityType
        : null;

  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select(
      "id, title, status, category, is_featured, linked_entity_type, linked_entity_id, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (entityTypeFilter === "none") {
    query = query.is("linked_entity_type", null);
  } else if (entityTypeFilter) {
    query = query.eq("linked_entity_type", entityTypeFilter);
  }

  const first = await query;
  let posts = (first.data ?? []) as BlogAdminRow[];

  if (isMissingLinkedEntityColumn(first.error)) {
    const fallback = await supabase
      .from("blog_posts")
      .select("id, title, status, category, is_featured, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    posts = (fallback.data ?? []) as BlogAdminRow[];
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Manage blog</h1>
      <p className="mt-1 text-sm text-stone-600">
        Feature, hide, or unpublish posts. Entity-linked updates show their club, trainer, event,
        course, or expert with a link out.
      </p>

      <div className="mt-4 flex flex-wrap gap-1">
        {FILTERS.map((f) => {
          const href = f.key ? `/admin/blog?entity_type=${f.key}` : "/admin/blog";
          const active =
            (f.key === "" && !entityTypeFilter) ||
            (f.key === "none" && entityTypeFilter === "none") ||
            f.key === entityTypeFilter;
          return (
            <Link
              key={f.key || "all"}
              href={href}
              className={`rounded px-2.5 py-1 text-sm ${
                active
                  ? "bg-amber-900 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-amber-50"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {!posts.length ? (
          <p className="text-sm text-stone-500">No posts.</p>
        ) : (
          posts.map((p) => {
            const linkedType = p.linked_entity_type ?? null;
            const linkedId = p.linked_entity_id ?? null;
            const href =
              linkedType && linkedId ? linkedEntityHref(linkedType, linkedId) : null;
            const badge = linkedEntityBadgeLabel(linkedType);

            return (
              <div key={p.id} className="rounded-lg border bg-white p-4">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">
                      <Link href={`/blog/${p.id}`} className="hover:underline">
                        {p.title}
                      </Link>
                    </p>
                    <p className="text-sm text-stone-500">
                      {p.status}
                      {p.category ? ` · ${p.category}` : ""}
                      {p.created_at
                        ? ` · ${new Date(p.created_at).toLocaleDateString()}`
                        : ""}
                    </p>
                    {linkedType && linkedId ? (
                      <p className="mt-1 text-sm text-stone-600">
                        {badge ? `${badge} · ` : null}
                        <span className="font-medium capitalize">{linkedType}</span>
                        {" · "}
                        {href ? (
                          <Link
                            href={href}
                            className="font-mono text-xs text-amber-900 underline-offset-2 hover:underline"
                          >
                            {linkedId}
                          </Link>
                        ) : (
                          <span className="font-mono text-xs">{linkedId}</span>
                        )}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-stone-400">No linked entity</p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.is_featured ? <Badge variant="featured">Featured</Badge> : null}
                      {badge ? <Badge>{badge}</Badge> : null}
                    </div>
                  </div>
                  <AdminActions
                    table="blog_posts"
                    id={p.id}
                    entityType="blog_post"
                    isFeatured={p.is_featured}
                    status={p.status}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
