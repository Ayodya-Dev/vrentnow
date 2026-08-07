import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { BookingPayView } from "@/components/bookings/booking-pay-view";

export const metadata: Metadata = { title: "Pay for booking" };

export default async function BookingPayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/bookings/${id}/pay`)}`);
  }

  return (
    <div className="bg-[#F6F7F9]">
      <Container className="max-w-xl py-12 md:py-16">
        <div className="rounded-2xl border border-[#DFE1E4] bg-white p-6 shadow-sm md:p-8">
          <BookingPayView id={id} />
        </div>
      </Container>
    </div>
  );
}
