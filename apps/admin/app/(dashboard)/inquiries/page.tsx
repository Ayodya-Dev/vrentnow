import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { InquiriesTable } from "@/features/inquiries/inquiries-table";

export const metadata: Metadata = { title: "Inquiries" };

export default async function InquiriesPage() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Inquiries
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages sent through the website contact form. Open a message to
          read it; reply by email from the message view.
        </p>
      </div>

      <InquiriesTable roles={roles} />
    </div>
  );
}
