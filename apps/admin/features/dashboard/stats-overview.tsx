"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconCar,
  IconCash,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { StatusPill } from "@/components/status-pill";
import {
  formatMoney,
  getDashboardStats,
  initials,
  shortBookingId,
} from "./api";
import { RevenueChart } from "./revenue-chart";

function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const body = (
    <Card size="sm" className="h-full shadow-sm ring-foreground/5">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-2">
          <CardDescription className="text-xs font-medium tracking-wide uppercase">
            {label}
          </CardDescription>
          <CardTitle className="font-heading text-3xl font-bold tracking-tight">
            {value}
          </CardTitle>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon className="size-5 stroke-[1.75]" />
        </span>
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );

  if (!href) return body;
  return (
    <Link href={href} className="block transition-opacity hover:opacity-90">
      {body}
    </Link>
  );
}

export function StatsOverview() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-destructive">
        Could not load dashboard stats. Check that your role can read bookings and
        vehicles.
      </p>
    );
  }

  const { vehiclesByStatus: v } = data;
  const fleetTotal =
    v.AVAILABLE + v.RENTED + v.MAINTENANCE + v.INACTIVE || 1;
  const availablePct = Math.round((v.AVAILABLE / fleetTotal) * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active bookings"
          value={String(data.activeBookings)}
          hint="Pending, confirmed, or out on rent"
          href="/bookings"
          icon={IconCalendarEvent}
        />
        <StatCard
          label="Pending confirmation"
          value={String(data.bookingsByStatus.PENDING)}
          hint="Needs confirm or cancel"
          href="/bookings"
          icon={IconClock}
        />
        <StatCard
          label="Monthly revenue"
          value={formatMoney(data.revenuePaidThisMonth)}
          hint="Paid this UTC month"
          icon={IconCash}
        />
        <StatCard
          label="Available fleet"
          value={`${availablePct}%`}
          hint={`${v.AVAILABLE} of ${fleetTotal} vehicles ready`}
          href="/vehicles"
          icon={IconCar}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card size="sm" className="shadow-sm ring-foreground/5">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Revenue performance</CardTitle>
              <CardDescription>
                Comparison of monthly growth against bookings
              </CardDescription>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Last 6 months
            </span>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.monthly} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {data.overdueRentals > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="flex gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <IconAlertTriangle className="size-5 stroke-[1.75]" />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold text-amber-900">
                    {data.overdueRentals} overdue rental
                    {data.overdueRentals === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-xs text-amber-800/80">
                    Handed-over bookings past their return date — follow up with
                    customers.
                  </p>
                  <Link
                    href="/bookings"
                    className="mt-2 inline-block text-xs font-semibold text-amber-900 underline-offset-2 hover:underline"
                  >
                    Review bookings
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div className="flex gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <IconCheck className="size-5 stroke-[1.75]" />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold text-emerald-900">
                    No overdue rentals
                  </p>
                  <p className="mt-1 text-xs text-emerald-800/80">
                    All handed-over vehicles are within their return window.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Card size="sm" className="shadow-sm ring-foreground/5">
            <CardHeader>
              <CardTitle>Fleet status</CardTitle>
              <CardDescription>Live vehicle inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(
                [
                  ["OUT ON RENT", v.RENTED, "bg-primary"],
                  ["IN MAINTENANCE", v.MAINTENANCE, "bg-amber-500"],
                  ["AVAILABLE", v.AVAILABLE, "bg-emerald-500"],
                  ["INACTIVE", v.INACTIVE, "bg-slate-400"],
                ] as const
              ).map(([label, count, dot]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className={`size-2 rounded-full ${dot}`} />
                    {label}
                  </span>
                  <span className="font-semibold tabular-nums">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card size="sm" className="shadow-sm ring-foreground/5">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Recent bookings</CardTitle>
            <CardDescription>Latest reservations across the fleet</CardDescription>
          </div>
          <Link
            href="/bookings"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all bookings →
          </Link>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Booking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentBookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="pl-6 text-muted-foreground"
                  >
                    No bookings yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.recentBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="pl-6 font-mono text-xs font-medium">
                      <Link
                        href={`/bookings/${b.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {shortBookingId(b.id)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                          {initials(b.firstName, b.lastName)}
                        </span>
                        <span className="font-medium">
                          {b.firstName} {b.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <IconCar className="size-3.5 opacity-60" />
                        {b.vehicle.brand} {b.vehicle.model}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.pickupDate.slice(0, 10)}
                    </TableCell>
                    <TableCell>
                      <StatusPill status={b.status} />
                    </TableCell>
                    <TableCell className="pr-6 text-right font-semibold tabular-nums">
                      {formatMoney(b.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
