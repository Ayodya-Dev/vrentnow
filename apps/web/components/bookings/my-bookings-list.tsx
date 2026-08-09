"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  cancelMyBooking,
  formatDateOnly,
  formatMoney,
  listMyBookings,
  type BookingStatus,
} from "@/lib/api/bookings";

function statusClass(status: BookingStatus): string {
  switch (status) {
    case "PENDING":
      return "text-amber-700";
    case "CONFIRMED":
      return "text-emerald-700";
    case "HANDED_OVER":
      return "text-blue-700";
    case "COMPLETED":
      return "text-muted-foreground";
    case "CANCELLED":
      return "text-destructive";
    default:
      return "";
  }
}

export function MyBookingsList() {
  const qc = useQueryClient();
  const { data, isPending, isError } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => listMyBookings(1),
  });

  async function cancel(id: string) {
    try {
      await cancelMyBooking(id, "Cancelled by customer");
      toast.success("Booking cancelled");
      await qc.invalidateQueries({ queryKey: ["my-bookings"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel");
    }
  }

  if (isPending) return <Skeleton className="h-40 w-full" />;
  if (isError) return <p className="text-destructive">Could not load bookings.</p>;

  if (data.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="mb-4 text-muted-foreground">You have no bookings yet.</p>
        <Button render={<Link href="/vehicles" />}>Browse vehicles</Button>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {data.items.map((b) => (
        <li
          key={b.id}
          className="flex flex-col gap-4 border border-[#DFE1E4] bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <Link
              href={`/bookings/${b.id}`}
              className="font-semibold hover:text-[#E8A317]"
            >
              {b.vehicle.brand} {b.vehicle.model}
            </Link>
            <p className="mt-1 font-mono text-xs tracking-wide text-muted-foreground">
              Order ID {b.id}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDateOnly(b.pickupDate)} → {formatDateOnly(b.returnDate)} ·{" "}
              {formatMoney(b.totalAmount)}
            </p>
            <p className={`mt-1 text-xs font-medium tracking-wide uppercase ${statusClass(b.status)}`}>
              {b.status.replace("_", " ")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button render={<Link href={`/bookings/${b.id}`} />} variant="outline" size="sm">
              Details
            </Button>
            {b.status === "PENDING" || b.status === "CONFIRMED" ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => cancel(b.id)}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
