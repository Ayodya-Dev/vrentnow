"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Pagination } from "@/components/data/pagination";
import { StatusPill } from "@/components/status-pill";
import {
  formatDateOnly,
  formatMoney,
  listBookings,
  STATUS_OPTIONS,
  type BookingStatus,
} from "./api";

const ANY = "__any__";

export function BookingsTable() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ANY);
  const [payment, setPayment] = useState(ANY);

  const query = {
    page,
    q: q.trim() || undefined,
    status: status === ANY ? undefined : (status as BookingStatus),
    paid: payment === "paid" ? true : payment === "pending" ? false : undefined,
  };

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["bookings", query],
    queryFn: () => listBookings(query),
    placeholderData: keepPreviousData,
  });

  if (isPending) return <Skeleton className="h-40 w-full" />;
  if (isError) return <p className="text-destructive">Could not load bookings.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search customer or vehicle…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v ?? ANY);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={payment}
          onValueChange={(v) => {
            setPayment(v ?? ANY);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44" aria-label="Filter by payment">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any payment</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Not paid</SelectItem>
          </SelectContent>
        </Select>
        {isFetching ? (
          <span className="text-xs text-muted-foreground">Updating…</span>
        ) : null}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground">
                No bookings yet.
              </TableCell>
            </TableRow>
          ) : (
            data.items.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="font-medium">{b.user.username}</div>
                  <div className="text-xs text-muted-foreground">{b.user.email}</div>
                </TableCell>
                <TableCell>
                  {b.vehicle.brand} {b.vehicle.model}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDateOnly(b.pickupDate)} → {formatDateOnly(b.returnDate)}
                </TableCell>
                <TableCell>{formatMoney(b.totalAmount)}</TableCell>
                <TableCell>
                  <StatusPill status={b.status} />
                </TableCell>
                <TableCell>
                  <StatusPill
                    status={b.payment?.status ?? "PENDING"}
                    className={
                      b.payment?.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : b.payment?.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : undefined
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button render={<Link href={`/bookings/${b.id}`} />} variant="outline" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination meta={data.meta} onPageChange={setPage} disabled={isFetching} />
    </div>
  );
}
