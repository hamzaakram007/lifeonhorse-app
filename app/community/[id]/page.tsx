import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhotoGallery } from "@/components/ui";
import { parseCommunityShareMeta } from "@/lib/community/dual-publish";

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("community_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  const share = parseCommunityShareMeta(post.content);
  const photos = Array.isArray(post.photos) ? post.photos : [];

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <h1 className="font-serif text-3xl font-bold">{post.title}</h1>
      {share.blogPostId || share.clubId ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {share.clubId ? (
            <Link href={`/clubs/${share.clubId}`} className="badge hover:opacity-90">
              From {share.clubName || "club"}
            </Link>
          ) : null}
          {share.blogPostId ? (
            <Link
              href={`/blog/${share.blogPostId}`}
              className="text-[var(--color-primary)] hover:underline"
            >
              Read Journal update
            </Link>
          ) : null}
        </div>
      ) : null}
      <PhotoGallery photos={photos} />
      <p className="whitespace-pre-wrap leading-relaxed">{share.body || post.content}</p>
      {share.blogPostId || share.clubId ? (
        <p className="border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-muted)]">
          Shared from the Journal
          {share.clubName ? (
            <>
              {" "}
              for{" "}
              {share.clubId ? (
                <Link
                  href={`/clubs/${share.clubId}`}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  {share.clubName}
                </Link>
              ) : (
                share.clubName
              )}
            </>
          ) : null}
          {share.blogPostId ? (
            <>
              .{" "}
              <Link
                href={`/blog/${share.blogPostId}`}
                className="text-[var(--color-primary)] hover:underline"
              >
                Open full article
              </Link>
            </>
          ) : null}
          .
        </p>
      ) : null}
    </div>
  );
}
