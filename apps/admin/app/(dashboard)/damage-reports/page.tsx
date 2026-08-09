import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { DamageReportsTable } from "@/features/damage-reports/damage-reports-table";

export const metadata: Metadata = { title: "Damage reports" };

export default async function DamageReportsPage() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Damage reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Incidents filed by customers during a rental. Resolve when the case
          is closed.
        </p>
      </div>

      <DamageReportsTable roles={roles} />
    </div>
  );
}
