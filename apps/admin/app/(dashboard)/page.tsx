import type { Metadata } from "next";
import { StatsOverview } from "@/features/dashboard/stats-overview";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Dashboard / Overview
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your rental operations.
        </p>
      </div>
      <StatsOverview />
    </div>
  );
}
