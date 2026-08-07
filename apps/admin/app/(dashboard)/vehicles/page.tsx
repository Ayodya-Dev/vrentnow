import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Button } from "@workspace/ui/components/button";
import { hasPermission } from "@/lib/permissions";
import { VehiclesTable } from "@/features/vehicles/vehicles-table";

export const metadata: Metadata = { title: "Vehicles" };

export default async function VehiclesPage() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Vehicles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the fleet shown on the customer website.
          </p>
        </div>
        {hasPermission(roles, "VEHICLES_WRITE") ? (
          <Button render={<Link href="/vehicles/new" />}>New vehicle</Button>
        ) : null}
      </div>

      <VehiclesTable roles={roles} />
    </div>
  );
}
