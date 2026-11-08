import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { EmptyState } from "@/components/ui";

export default async function InquiriesPage() {
  const profile = await requireAuth();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: inquiries } = await supabase.from("inquiries").select("*").or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`).order("created_at", { ascending: false });
  const { data: notifications } = await supabase.from("inquiry_notifications").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inquiries</h1>
      {notifications?.length ? (
        <div className="space-y-2">
          <h2 className="font-semibold">Notifications</h2>
          {notifications.map((n) => (
            <div key={n.id} className={`card p-3 text-sm ${n.is_read ? "opacity-70" : ""}`}>
              <p className="font-medium">{n.title}</p>
              <p className="text-[var(--color-muted)]">{n.body}</p>
            </div>
          ))}
        </div>
      ) : null}
      {!inquiries?.length ? <EmptyState title="No inquiries yet" /> : (
        <div className="space-y-3">
          {inquiries.map((i) => (
            <div key={i.id} className="card p-4">
              <p className="text-xs text-[var(--color-muted)]">{i.entity_type} · {i.status}</p>
              <p className="mt-1">{i.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
