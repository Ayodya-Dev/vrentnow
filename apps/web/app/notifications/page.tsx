import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { NotificationsList } from "@/components/notifications/notifications-list";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/notifications");

  return (
    <Container className="max-w-3xl py-16">
      <h1 className="mb-2 font-heading text-3xl font-semibold tracking-tight">
        Notifications
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Updates about your bookings and payments.
      </p>
      <NotificationsList />
    </Container>
  );
}
