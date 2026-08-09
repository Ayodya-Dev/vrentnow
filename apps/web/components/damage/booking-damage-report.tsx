"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  createDamageReport,
  listMyDamageReports,
} from "@/lib/api/damage-reports";

export function BookingDamageReport({
  bookingId,
  canReport,
}: {
  bookingId: string;
  canReport: boolean;
}) {
  const qc = useQueryClient();
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["damage-reports", bookingId],
    queryFn: () => listMyDamageReports(bookingId),
    enabled: canReport,
  });

  if (!canReport) return null;
  if (isPending) return <Skeleton className="h-20 w-full" />;

  const reports = data?.items ?? [];

  async function submit() {
    if (description.trim().length < 10) {
      toast.error("Please describe the damage in at least 10 characters.");
      return;
    }
    setSaving(true);
    try {
      await createDamageReport({ bookingId, description: description.trim() });
      toast.success("Damage report submitted");
      setDescription("");
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ["damage-reports", bookingId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit report");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Damage report</h2>
          <p className="text-sm text-muted-foreground">
            Report damage or an incident during this rental.
          </p>
        </div>
        {!open ? (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Report damage
          </Button>
        ) : null}
      </div>

      {open ? (
        <div className="space-y-3">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened…"
            rows={4}
          />
          <div className="flex gap-2">
            <Button
              onClick={submit}
              disabled={saving}
              className="bg-[#E8A317] text-white hover:bg-[#d19215]"
            >
              {saving ? "Sending…" : "Submit report"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {reports.length > 0 ? (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className="border border-[#DFE1E4] bg-[#F6F7F9]/80 p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {r.resolvedAt ? "Resolved" : "Open"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{r.description}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
