"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

export default function AdminCommissionsPage() {
  const [records, setRecords] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState({
    buyer_name: "",
    seller_name: "",
    amount: "",
    currency: "USD",
    commission_rate: "",
    commission_amount: "",
    notes: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.from("commission_records").select("*").order("recorded_at", { ascending: false }).then(({ data }) => setRecords(data ?? []));
  }, []);

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("commission_records").insert({
      recorded_by: user.id,
      buyer_name: form.buyer_name,
      seller_name: form.seller_name,
      amount: parseFloat(form.amount),
      currency: form.currency,
      commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
      commission_amount: form.commission_amount ? parseFloat(form.commission_amount) : null,
      notes: form.notes,
    });
    const { data } = await supabase.from("commission_records").select("*").order("recorded_at", { ascending: false });
    setRecords(data ?? []);
    setForm({ buyer_name: "", seller_name: "", amount: "", currency: "USD", commission_rate: "", commission_amount: "", notes: "" });
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Commission tracking</h1>
      <p className="text-sm text-stone-600">Manual records until payment integration is chosen</p>
      <form onSubmit={addRecord} className="mt-4 max-w-md space-y-3 rounded-lg border bg-white p-4">
        <div><Label>Buyer</Label><Input value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} /></div>
        <div><Label>Seller</Label><Input value={form.seller_name} onChange={(e) => setForm({ ...form, seller_name: e.target.value })} /></div>
        <div><Label required>Deal amount</Label><Input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
        <div><Label>Commission %</Label><Input type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} /></div>
        <div><Label>Commission amount</Label><Input type="number" value={form.commission_amount} onChange={(e) => setForm({ ...form, commission_amount: e.target.value })} /></div>
        <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <Button type="submit">Record commission</Button>
      </form>
      <div className="mt-6 space-y-2">
        {records.map((r) => (
          <div key={r.id as string} className="rounded border bg-white p-3 text-sm">
            {r.buyer_name as string} → {r.seller_name as string}: {r.amount as number} {r.currency as string}
            {r.commission_amount != null && ` · Commission: ${r.commission_amount}`}
          </div>
        ))}
      </div>
    </div>
  );
}
