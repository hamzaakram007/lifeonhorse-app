import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { OwnedList } from "@/components/dashboard/OwnedList";
import { VerifiedBadge, EmptyState } from "@/components/ui";

export default async function TrainerDashboardPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login?redirect=/dashboard/trainer");

  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainers")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, status, level, category, is_free")
    .eq("creator_id", profile.id)
    .order("created_at", { ascending: false });

  const courseItems =
    courses?.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      href: `/courses/${c.id}`,
      meta: [c.category, c.level, c.is_free ? "free" : "paid"].filter(Boolean).join(" · ") || null,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Trainer dashboard</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Your trainer profile and courses you created.
        </p>
      </div>

      {trainer ? (
        <div className="card space-y-2 p-4">
          <div className="flex flex-wrap gap-2">{trainer.is_verified ? <VerifiedBadge /> : null}</div>
          <h2 className="text-xl font-semibold">{trainer.display_name}</h2>
          {trainer.specialty ? <p className="text-sm text-[var(--color-muted)]">{trainer.specialty}</p> : null}
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href={`/trainers/${trainer.id}`} className="text-[var(--color-primary)] hover:underline">
              View public profile
            </Link>
            <span className="text-[var(--color-muted)]">Status: {trainer.status}</span>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No trainer profile"
          description="Create a trainer profile to appear in the directory."
          action={
            <Link href="/trainers/new" className="btn btn-primary">
              Create trainer profile
            </Link>
          }
        />
      )}

      <OwnedList
        title="Your courses"
        items={courseItems}
        createHref="/courses/new"
        createLabel="+ New course"
        emptyDescription="You have not created any courses yet."
      />
    </div>
  );
}
