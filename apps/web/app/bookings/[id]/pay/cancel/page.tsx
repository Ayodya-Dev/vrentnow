import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { Button } from "@workspace/ui/components/button";

export const metadata: Metadata = { title: "Payment cancelled" };

export default async function PayHereCancelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/bookings/${id}/pay/cancel`)}`);
  }

  return (
    <div className="bg-[#F6F7F9]">
      <Container className="max-w-xl py-12 md:py-16">
        <div className="space-y-6 rounded-2xl border border-[#DFE1E4] bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-bold tracking-[0.18em] text-[#E8A317] uppercase">
            PayHere
          </p>
          <h1 className="font-heading text-3xl font-bold text-[#1D1F23]">
            Payment cancelled
          </h1>
          <p className="text-sm text-[#6B7280]">
            You left PayHere checkout without completing payment. Your booking is
            still unpaid — you can try again whenever you are ready.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              render={<Link href={`/bookings/${id}/pay`} />}
              className="bg-[#E8A317] text-white hover:bg-[#d19215]"
            >
              Try again
            </Button>
            <Button render={<Link href={`/bookings/${id}`} />} variant="outline">
              View booking
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
