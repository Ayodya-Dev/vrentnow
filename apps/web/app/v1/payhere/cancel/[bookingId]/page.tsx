import { redirect } from "next/navigation";

export default async function PayHereCancelLegacy({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  redirect(`/bookings/${bookingId}/pay/cancel`);
}
