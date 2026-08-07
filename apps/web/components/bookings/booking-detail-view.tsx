"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  cancelMyBooking,
  formatDateOnly,
  formatMoney,
  getMyBooking,
  PAYMENT_OPTIONS,
} from "@/lib/api/bookings";

export function BookingDetailView({ id }: { id: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isPending, isError } = useQuery({
    queryKey: ["my-bookings", id],
    queryFn: () => getMyBooking(id),
  });

  async function cancel() {
    try {
      await cancelMyBooking(id, "Cancelled by customer");
      toast.success("Booking cancelled");
      await qc.invalidateQueries({ queryKey: ["my-bookings"] });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel");
    }
  }

  if (isPending) return <Skeleton className="h-48 w-full" />;
  if (isError || !data) {
    return <p className="text-destructive">Could not load this booking.</p>;
  }

  const canCancel = data.status === "PENDING" || data.status === "CONFIRMED";
  const needsPay = data.payment?.status !== "PAID" && data.status !== "CANCELLED";
  const provider =
    PAYMENT_OPTIONS.find((o) => o.value === data.paymentMethod)?.label ??
    data.paymentMethod;

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {data.status.replace("_", " ")}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {data.vehicle.brand} {data.vehicle.model}
        </h1>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Customer</dt>
          <dd className="font-medium">
            {data.firstName} {data.lastName}
          </dd>
          <dd className="text-sm text-muted-foreground">{data.phone}</dd>
          <dd className="text-sm text-muted-foreground">{data.email}</dd>
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
          <dd className="text-xl font-semibold text-[#E8A317]">
            {formatMoney(data.totalAmount)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Payment</dt>
          <dd className="font-medium">{provider}</dd>
          <dd className="text-sm text-muted-foreground">
            {data.payment?.status ?? "PENDING"}
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

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/bookings" />} variant="outline">
          All bookings
        </Button>
        {needsPay ? (
          <Button
            render={<Link href={`/bookings/${id}/pay`} />}
            className="bg-[#E8A317] text-white hover:bg-[#d19215]"
          >
            Pay now
          </Button>
        ) : null}
        {canCancel ? (
          <Button variant="destructive" onClick={cancel}>
            Cancel booking
          </Button>
        ) : null}
      </div>
    </div>
  );
}
