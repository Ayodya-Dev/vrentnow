"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  completeSandboxPayment,
  formatDateOnly,
  formatMoney,
  getMyBooking,
  PAYMENT_OPTIONS,
} from "@/lib/api/bookings";

export function BookingPayView({ id }: { id: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isPending, isError } = useQuery({
    queryKey: ["my-bookings", id],
    queryFn: () => getMyBooking(id),
  });

  async function pay() {
    try {
      await completeSandboxPayment(id);
      toast.success("Payment successful (sandbox)");
      await qc.invalidateQueries({ queryKey: ["my-bookings"] });
      router.push(`/bookings/${id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    }
  }

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (isError || !data) {
    return <p className="text-destructive">Could not load this booking.</p>;
  }

  const provider =
    PAYMENT_OPTIONS.find((o) => o.value === data.paymentMethod) ??
    PAYMENT_OPTIONS[2]!;
  const paid = data.payment?.status === "PAID";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-[#E8A317] uppercase">
          Checkout
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[#1D1F23]">
          Pay with {provider.label}
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">{provider.blurb}</p>
      </div>

      <dl className="grid gap-4 border border-[#DFE1E4] bg-[#F6F7F9] p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[#6B7280] uppercase">Customer</dt>
          <dd className="font-semibold">
            {data.firstName} {data.lastName}
          </dd>
          <dd className="text-sm text-[#6B7280]">{data.phone}</dd>
          <dd className="text-sm text-[#6B7280]">{data.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#6B7280] uppercase">Vehicle</dt>
          <dd className="font-semibold">
            {data.vehicle.brand} {data.vehicle.model}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#6B7280] uppercase">Dates</dt>
          <dd className="font-semibold">
            {formatDateOnly(data.pickupDate)} → {formatDateOnly(data.returnDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#6B7280] uppercase">Amount due</dt>
          <dd className="text-2xl font-bold text-[#E8A317]">
            {formatMoney(data.totalAmount)}
          </dd>
        </div>
      </dl>

      {paid ? (
        <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-semibold text-emerald-800">Already paid</p>
          <p className="text-sm text-emerald-700">
            Transaction {data.payment?.transactionId}
          </p>
          <Button render={<Link href={`/bookings/${id}`} />}>View booking</Button>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-[#DFE1E4] bg-white p-5">
          <p className="text-sm text-[#6B7280]">
            Academic sandbox mode — no real charge. This simulates a successful{" "}
            {provider.label} payment.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={pay}
              className="bg-[#E8A317] text-white hover:bg-[#d19215]"
            >
              Pay {formatMoney(data.totalAmount)} with {provider.label}
            </Button>
            <Button render={<Link href={`/bookings/${id}`} />} variant="outline">
              Pay later
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
