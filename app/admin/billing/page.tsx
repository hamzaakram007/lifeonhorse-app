import { redirect } from "next/navigation";
import { requireAdminOnly } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBillingPage() {
  const profile = await requireAdminOnly();
  if (!profile) redirect("/auth/login");
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(30);
  const { data: commissions } = await supabase.from("commission_records").select("*").order("created_at", { ascending: false }).limit(30);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Billing</h1>
      <section><h2 className="font-semibold">Orders</h2>{orders?.map((o) => <div key={o.id} className="card mt-2 p-3 text-sm">{o.order_type} — {o.amount} {o.currency} — {o.status}</div>)}</section>
      <section><h2 className="font-semibold">Commissions</h2>{commissions?.map((c) => <div key={c.id} className="card mt-2 p-3 text-sm">{c.deal_description} — {c.commission_amount ?? "TBD"} — {c.payment_status}</div>)}</section>
    </div>
  );
}
