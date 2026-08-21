import { redirect } from "next/navigation";

export default async function PayHereReturnLegacy({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  redirect(`/bookings/${bookingId}/pay/return`);
}
