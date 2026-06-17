"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea, Label, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Card";
import type { HealthRequest } from "@/lib/types/database";

export default function AdminHealthRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<HealthRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("health_requests").select("*").order("created_at", { ascending: false }).limit(50);
      setRequests((data as HealthRequest[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id: string, status: string, admin_notes?: string) {
    const supabase = createClient();
    await supabase.from("health_requests").update({ status, ...(admin_notes !== undefined ? { admin_notes } : {}) }).eq("id", id);
    router.refresh();
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as HealthRequest["status"], admin_notes: admin_notes ?? r.admin_notes } : r)));
  }

  if (loading) return <p className="text-stone-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-xl font-bold">Health requests</h1>
      <p className="text-sm text-stone-600">Review and manage horse health help requests</p>
      <div className="mt-4 space-y-4">
        {requests.map((r) => (
          <div key={r.id} className={`rounded-lg border bg-white p-4 ${r.urgency === "emergency" ? "border-red-300" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{r.problem_type.replace(/_/g, " ")}</p>
                <p className="text-sm text-stone-500">{r.contact_name ?? r.contact_email} · {new Date(r.created_at).toLocaleDateString()}</p>
                <div className="mt-1 flex gap-1">
                  <Badge>{r.urgency}</Badge>
                  <Badge>{r.status}</Badge>
                </div>
              </div>
              <Select
                value={r.status}
                onChange={(e) => updateStatus(r.id, e.target.value)}
                className="text-sm"
              >
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
            <p className="mt-3 text-sm text-stone-700">{r.symptoms}</p>
            {(r.horse_breed || r.horse_age) && (
              <p className="mt-2 text-xs text-stone-500">
                Horse: {r.horse_breed} {r.horse_age ? `· ${r.horse_age} yrs` : ""} {r.horse_gender ? `· ${r.horse_gender}` : ""}
              </p>
            )}
            <p className="mt-1 text-xs text-stone-500">Contact: {r.contact_email} {r.contact_phone ? `· ${r.contact_phone}` : ""}</p>
            {r.issue_duration && <p className="text-xs text-stone-500">Duration: {r.issue_duration}</p>}
            <div className="mt-3">
              <Label>Admin notes</Label>
              <Textarea
                rows={2}
                defaultValue={r.admin_notes ?? ""}
                onBlur={(e) => updateStatus(r.id, r.status, e.target.value)}
                placeholder="Internal notes"
              />
            </div>
            {r.urgency === "emergency" && (
              <p className="mt-2 text-xs font-medium text-red-600">Emergency flagged — ensure user was directed to a local vet.</p>
            )}
          </div>
        ))}
        {!requests.length && <p className="text-stone-500">No health requests yet.</p>}
      </div>
    </div>
  );
}
