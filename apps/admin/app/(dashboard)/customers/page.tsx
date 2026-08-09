import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { CustomersTable } from "@/features/customers/customers-table";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Customers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Web app login accounts. Disable or enable access; unlock clears a
          temporary lockout. Customers reset their own passwords via the web app.
        </p>
      </div>

      <CustomersTable roles={roles} />
    </div>
  );
}
