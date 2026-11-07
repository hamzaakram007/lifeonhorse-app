"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, Select } from "@/components/ui/Input";

type CommissionRow = {
  id: string;
  deal_description: string;
  deal_value: number | null;
  currency: string | null;
  commission_percent: number | null;
  commission_amount: number | null;
  payment_status: string;
  notes: string | null;
  created_at: string;
};

const emptyForm = {
  deal_description: "",
  seller_name: "",
  deal_value: "",
  currency: "USD",
  commission_percent: "5",
  commission_amount: "",
  payment_status: "pending",
  notes: "",
};

export default function AdminCommissionsPage() {
  const [records, setRecords] = useState<CommissionRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("commission_records")
      .select(
        "id, deal_description, deal_value, currency, commission_percent, commission_amount, payment_status, notes, created_at"
      )
      .order("created_at", { ascending: false });
    setRecords((data as CommissionRow[]) ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  const computedAmount = useMemo(() => {
    const value = parseFloat(form.deal_value);
    const rate = parseFloat(form.commission_percent);
    if (!Number.isFinite(value) || !Number.isFinite(rate)) return "";
    return ((value * rate) / 100).toFixed(2);
  }, [form.deal_value, form.commission_percent]);

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      setSaving(false);
      return;
    }

    const dealValue = form.deal_value ? parseFloat(form.deal_value) : null;
    const percent = form.commission_percent ? parseFloat(form.commission_percent) : null;
    const amount =
      form.commission_amount
        ? parseFloat(form.commission_amount)
        : computedAmount
          ? parseFloat(computedAmount)
          : null;

    const description = form.seller_name.trim()
      ? `${form.deal_description.trim()} (seller: ${form.seller_name.trim()})`
      : form.deal_description.trim();

    const { error: insertError } = await supabase.from("commission_records").insert({
      created_by: user.id,
      deal_description: description,
      deal_value: dealValue,
      currency: form.currency || "USD",
      commission_percent: percent,
      commission_amount: amount,
      payment_status: form.payment_status,
      notes: form.notes.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setForm(emptyForm);
    setSaving(false);
    await load();
  }

  async function markPaid(id: string) {
    const supabase = createClient();
    await supabase
      .from("commission_records")
      .update({ payment_status: "paid", confirmed_at: new Date().toISOString() })
      .eq("id", id);
    await load();
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Commission tracking</h1>
      <p className="mt-1 text-sm text-stone-600">
        Manual records until a payments provider is locked. Sellers see guidance on{" "}
        <Link href="/payments" className="text-amber-800 underline">
          /payments
        </Link>
        .
      </p>

      <form onSubmit={addRecord} className="mt-4 max-w-lg space-y-3 rounded-lg border bg-white p-4">
        <div>
          <Label required>Deal description</Label>
          <Input
            required
            value={form.deal_description}
            onChange={(e) => setForm({ ...form, deal_description: e.target.value })}
            placeholder="Horse sale · Arabian mare · Karachi"
          />
        </div>
        <div>
          <Label>Seller name (optional)</Label>
          <Input
            value={form.seller_name}
            onChange={(e) => setForm({ ...form, seller_name: e.target.value })}
            placeholder="Appended into the deal description"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Deal value</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.deal_value}
              onChange={(e) => setForm({ ...form, deal_value: e.target.value })}
            />
          </div>
          <div>
            <Label>Currency</Label>
            <Input
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            />
          </div>
          <div>
            <Label>Commission %</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.commission_percent}
              onChange={(e) => setForm({ ...form, commission_percent: e.target.value })}
            />
          </div>
          <div>
            <Label>Commission amount</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.commission_amount}
              onChange={(e) => setForm({ ...form, commission_amount: e.target.value })}
              placeholder={computedAmount ? `Auto: ${computedAmount}` : undefined}
            />
          </div>
        </div>
        <div>
          <Label>Payment status</Label>
          <Select
            value={form.payment_status}
            onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
          >
            <option value="pending">Pending</option>
            <option value="invoiced">Invoiced</option>
            <option value="paid">Paid</option>
            <option value="waived">Waived</option>
          </Select>
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Bank transfer ref, JazzCash proof, follow-up…"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Record commission"}
        </Button>
      </form>

      <div className="mt-6 space-y-2">
        <h2 className="font-semibold">Recent records</h2>
        {!records.length ? (
          <p className="text-sm text-stone-500">No commissions recorded yet.</p>
        ) : (
          records.map((r) => (
            <div key={r.id} className="rounded border bg-white p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{r.deal_description}</p>
                  <p className="text-stone-600">
                    {r.deal_value != null ? `${r.currency ?? "USD"} ${r.deal_value}` : "Value TBD"}
                    {r.commission_percent != null ? ` · ${r.commission_percent}%` : ""}
                    {r.commission_amount != null
                      ? ` · commission ${r.currency ?? "USD"} ${r.commission_amount}`
                      : ""}
                  </p>
                  <p className="text-xs text-stone-500">
                    {r.payment_status}
                    {r.created_at ? ` · ${new Date(r.created_at).toLocaleString()}` : ""}
                    {r.notes ? ` · ${r.notes}` : ""}
                  </p>
                </div>
                {r.payment_status !== "paid" ? (
                  <Button size="sm" variant="outline" onClick={() => markPaid(r.id)}>
                    Mark paid
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
