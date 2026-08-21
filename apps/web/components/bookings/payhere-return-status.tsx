"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { getMyBooking } from "@/lib/api/bookings";

export function PayHereReturnStatus({ id }: { id: string }) {
  const [waitedMs, setWaitedMs] = useState(0);
  const { data } = useQuery({
    queryKey: ["my-bookings", id, "payhere-return"],
    queryFn: () => getMyBooking(id),
    refetchInterval: (query) =>
      query.state.data?.payment?.status === "PAID" ? false : 2000,
  });

  const paid = data?.payment?.status === "PAID";

  useEffect(() => {
    if (paid) return;
    const started = Date.now();
    const tick = window.setInterval(() => {
      setWaitedMs(Date.now() - started);
    }, 500);
    return () => window.clearInterval(tick);
  }, [paid]);

  const timedOut = !paid && waitedMs >= 25000;

  return (
    <div className="min-w-0 space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#1D1F23] sm:text-3xl">
        {paid
          ? "Payment successful"
          : timedOut
            ? "Confirming payment"
            : "Confirming payment…"}
      </h1>
      <p className="text-sm leading-relaxed text-[#6B7280]">
        {paid
          ? "PayHere confirmed this booking. A receipt email is on the way, and the booking is now paid in your account and in admin."
          : timedOut
            ? "PayHere has not confirmed this payment yet. If you completed checkout, open the booking again in a moment — status updates when the PayHere notification arrives."
            : "Waiting for PayHere to confirm the payment. This usually takes a few seconds."}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          render={<Link href={`/bookings/${id}`} />}
          className="h-11 w-full bg-[#E8A317] text-white hover:bg-[#d19215] sm:h-9 sm:w-auto"
        >
          View booking
        </Button>
        {!paid ? (
          <Button
            render={<Link href={`/bookings/${id}/pay`} />}
            variant="outline"
            className="h-11 w-full sm:h-9 sm:w-auto"
          >
            Back to checkout
          </Button>
        ) : null}
      </div>
    </div>
  );
}
