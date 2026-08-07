import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { BookingDetailView } from "@/components/bookings/booking-detail-view";

export const metadata: Metadata = { title: "Booking detail" };

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/bookings/${id}`)}`);
  }

  return (
    <Container className="max-w-2xl py-16">
      <BookingDetailView id={id} />
    </Container>
  );
}
