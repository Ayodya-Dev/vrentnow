import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Button } from "@workspace/ui/components/button";
import { hasPermission } from "@/lib/permissions";
import { DealsTable } from "@/features/deals/deals-table";

export const metadata: Metadata = { title: "Offers" };

export default async function DealsPage() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Offers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Promotions shown on the customer website. Codes are for display/copy
            only until checkout discounts ship.
          </p>
        </div>
        {hasPermission(roles, "DEALS_WRITE") ? (
          <Button render={<Link href="/deals/new" />}>New offer</Button>
        ) : null}
      </div>

      <DealsTable roles={roles} />
    </div>
  );
}
