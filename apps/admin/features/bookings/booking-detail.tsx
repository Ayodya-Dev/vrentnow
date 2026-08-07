"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { hasPermission, type Role } from "@/lib/permissions";
import {
  formatDateOnly,
  formatMoney,
  getBooking,
  NEXT_STATUSES,
  updateBookingStatus,
  type BookingStatus,
} from "./api";

const ACTION_LABELS: Partial<Record<BookingStatus, string>> = {
  CONFIRMED: "Confirm booking",
  HANDED_OVER: "Mark handed over",
  COMPLETED: "Mark completed",
  CANCELLED: "Cancel booking",
};

export function BookingDetail({ id, roles }: { id: string; roles: Role[] }) {
  const router = useRouter();
  const qc = useQueryClient();
  const canWrite = hasPermission(roles, "BOOKINGS_WRITE");
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState<BookingStatus | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["bookings", id],
    queryFn: () => getBooking(id),
  });

  async function setStatus(status: BookingStatus) {
    if (status === "CANCELLED" && !cancelReason.trim()) {
      toast.error("Enter a cancel reason first");
      return;
    }
    setBusy(status);
    try {
      await updateBookingStatus(
        id,
        status,
        status === "CANCELLED" ? cancelReason.trim() : undefined,
      );
      toast.success(`Status updated to ${status}`);
      await qc.invalidateQueries({ queryKey: ["bookings"] });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setBusy(null);
    }
  }

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (isError || !data) {
    return <p className="text-destructive">Could not load this booking.</p>;
  }

  const next = NEXT_STATUSES[data.status] ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              Booking
            </h1>
            <Badge>{data.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">ID {data.id}</p>
        </div>
        <Button render={<Link href="/bookings" />} variant="outline">
          Back to list
        </Button>
      </div>

      <dl className="grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Customer</dt>
          <dd className="font-medium">
            {data.firstName} {data.lastName}
          </dd>
          <dd className="text-sm text-muted-foreground">{data.phone}</dd>
          <dd className="text-sm text-muted-foreground">{data.email}</dd>
          <dd className="text-sm text-muted-foreground">{data.user.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Vehicle</dt>
          <dd className="font-medium">
            {data.vehicle.brand} {data.vehicle.model}
          </dd>
          <dd className="text-sm text-muted-foreground">{data.vehicle.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Pickup → return</dt>
          <dd className="font-medium">
            {formatDateOnly(data.pickupDate)} → {formatDateOnly(data.returnDate)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Pickup location</dt>
          <dd className="font-medium">{data.pickupLocation}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Total</dt>
          <dd className="text-xl font-semibold">{formatMoney(data.totalAmount)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Payment</dt>
          <dd className="font-medium">{data.paymentMethod}</dd>
          <dd className="text-sm text-muted-foreground">
            {data.payment?.status ?? "PENDING"}
            {data.payment?.transactionId
              ? ` · ${data.payment.transactionId}`
              : null}
          </dd>
        </div>
        {data.notes ? (
          <div>
            <dt className="text-sm text-muted-foreground">Notes</dt>
            <dd className="font-medium">{data.notes}</dd>
          </div>
        ) : null}
        {data.cancelReason ? (
          <div>
            <dt className="text-sm text-muted-foreground">Cancel reason</dt>
            <dd className="font-medium">{data.cancelReason}</dd>
          </div>
        ) : null}
      </dl>

      {canWrite && next.length > 0 ? (
        <div className="space-y-4 border-t pt-6">
          <h2 className="font-heading text-lg font-semibold">Update status</h2>
          {next.includes("CANCELLED") ? (
            <div className="max-w-md space-y-2">
              <Label htmlFor="cancelReason">Cancel reason</Label>
              <Input
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Required when cancelling"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {next.map((status) => (
              <Button
                key={status}
                variant={status === "CANCELLED" ? "destructive" : "default"}
                disabled={busy !== null}
                onClick={() => setStatus(status)}
              >
                {busy === status ? "Saving…" : (ACTION_LABELS[status] ?? status)}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
