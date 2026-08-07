import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { BookingDetail } from "@/features/bookings/booking-detail";

export const metadata: Metadata = { title: "Booking detail" };

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  return <BookingDetail id={id} roles={roles} />;
}
