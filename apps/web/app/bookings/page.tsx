import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { MyBookingsList } from "@/components/bookings/my-bookings-list";

export const metadata: Metadata = { title: "My bookings" };

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/bookings");

  return (
    <Container className="max-w-3xl py-16">
      <h1 className="mb-8 font-heading text-3xl font-semibold tracking-tight">
        My bookings
      </h1>
      <MyBookingsList />
    </Container>
  );
}
