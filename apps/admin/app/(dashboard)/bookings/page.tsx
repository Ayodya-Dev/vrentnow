import type { Metadata } from "next";
import { BookingsTable } from "@/features/bookings/bookings-table";

export const metadata: Metadata = { title: "Bookings" };

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm, hand over, complete, or cancel customer reservations.
        </p>
      </div>
      <BookingsTable />
    </div>
  );
}
