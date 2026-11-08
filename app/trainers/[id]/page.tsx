import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  PhotoGallery,
  VerifiedBadge,
  FeaturedBadge,
  ListingCard,
  EmptyState,
} from "@/components/ui";
import { ReviewsSection } from "@/components/ReviewsSection";
import { InquiryForm } from "@/components/InquiryForm";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getCountryName } from "@/lib/countries";
import { resolveBlogCover } from "@/lib/blog-covers";
import { isMissingLinkedEntityColumn } from "@/lib/blog/query";
import { labelFromOptions } from "@/lib/labels";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("trainers").select("display_name").eq("id", id).single();
  return { title: data?.display_name ?? "Trainer" };
}

export default async function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: trainer } = await supabase.from("trainers").select("*").eq("id", id).single();
  if (!trainer) notFound();

  const location = [trainer.city, getCountryName(trainer.country_code)].filter(Boolean).join(", ");
  const { data: owner } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", trainer.user_id)
    .single();
  const whatsappHref = trainer.phone
    ? `https://wa.me/${String(trainer.phone).replace(/[^\d]/g, "")}`
    : null;
  const isOwner = Boolean(profile && profile.id === trainer.user_id);

  const [tipsResult, { data: courses }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, category, cover_image, published_at, excerpt")
      .eq("status", "published")
      .eq("linked_entity_type", "trainer")
      .eq("linked_entity_id", id)
      .order("published_at", { ascending: false })
      .limit(6),
    supabase
      .from("courses")
      .select("id, title, category, level, cover_image, is_free")
      .eq("creator_id", trainer.user_id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);
  const tipPosts = isMissingLinkedEntityColumn(tipsResult.error) ? [] : tipsResult.data;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex gap-2">
          {trainer.is_verified && <VerifiedBadge />}
          {trainer.is_featured && <FeaturedBadge />}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{trainer.display_name}</h1>
            <p className="text-[var(--color-muted)]">{trainer.specialty}</p>
            {location ? <p className="text-[var(--color-muted)]">{location}</p> : null}
          </div>
          {isOwner ? (
            <Link href={`/blog/new?trainer=${trainer.id}`} className="btn btn-primary">
              Share tip
            </Link>
          ) : null}
        </div>
        <PhotoGallery photos={Array.isArray(trainer.photos) ? trainer.photos : []} />
        <p>{trainer.description}</p>
        {(trainer.phone || whatsappHref) && (
          <div className="flex flex-wrap gap-3 text-sm">
            {trainer.phone ? (
              <a href={`tel:${trainer.phone}`} className="btn btn-secondary">
                Call
              </a>
            ) : null}
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        )}

        <section className="space-y-4 border-t border-[var(--color-border)] pt-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-serif text-2xl font-bold">From this trainer</h2>
            <Link
              href={`/blog?trainer=${trainer.id}`}
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              View all tips
            </Link>
          </div>
          {!tipPosts?.length ? (
            <EmptyState
              title={isOwner ? "No tips yet" : "No trainer tips yet"}
              description={
                isOwner
                  ? "You’re the trainer — share the first tip for riders who follow your profile."
                  : "Ask this trainer to share training tips and updates."
              }
              action={
                isOwner ? (
                  <Link href={`/blog/new?trainer=${trainer.id}`} className="btn btn-primary">
                    Share tip
                  </Link>
                ) : null
              }
            />
          ) : (
            <div className="listing-grid">
              {tipPosts.map((post) => (
                <ListingCard
                  key={post.id}
                  href={`/blog/${post.id}`}
                  title={post.title}
                  subtitle={
                    post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : undefined
                  }
                  image={resolveBlogCover(post.title, post.cover_image)}
                  badges={<span className="badge">Trainer tip</span>}
                />
              ))}
            </div>
          )}
        </section>

        {courses && courses.length > 0 ? (
          <section className="space-y-3 border-t border-[var(--color-border)] pt-6">
            <h2 className="font-serif text-xl font-bold">Courses by this trainer</h2>
            <div className="listing-grid">
              {courses.map((course) => (
                <ListingCard
                  key={course.id}
                  href={`/courses/${course.id}`}
                  title={course.title}
                  subtitle={
                    [
                      labelFromOptions(COURSE_CATEGORIES, course.category),
                      labelFromOptions(COURSE_LEVELS, course.level),
                      course.is_free ? "Free" : "Paid",
                    ]
                      .filter(Boolean)
                      .join(" · ") || undefined
                  }
                  image={course.cover_image}
                />
              ))}
            </div>
          </section>
        ) : null}

        <ReviewsSection entityType="trainer" entityId={id} />
      </div>
      <div className="space-y-4">
        <FavoriteButton entityType="trainer" entityId={trainer.id} />
        {owner && (
          <InquiryForm recipientId={owner.id} entityType="trainer" entityId={trainer.id} />
        )}
      </div>
    </div>
  );
}
