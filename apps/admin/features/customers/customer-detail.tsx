"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Pagination } from "@/components/data/pagination";
import { StatusPill } from "@/components/status-pill";
import { hasPermission, type Role } from "@/lib/permissions";
import {
  formatDateOnly,
  formatMoney,
  listBookings,
} from "@/features/bookings/api";
import {
  disableCustomer,
  enableCustomer,
  getCustomer,
  isLocked,
  unlockCustomer,
} from "./api";

export function CustomerDetail({ id, roles }: { id: string; roles: Role[] }) {
  const qc = useQueryClient();
  const canWrite = hasPermission(roles, "USERS_WRITE");
  const canSeeBookings = hasPermission(roles, "BOOKINGS_READ");

  const [page, setPage] = useState(1);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const customerQuery = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomer(id),
  });

  const bookingsQuery = useQuery({
    queryKey: ["customer-bookings", id, page],
    queryFn: () => listBookings({ userId: id, page }),
    enabled: canSeeBookings,
    placeholderData: keepPreviousData,
  });

  async function run(
    action: () => Promise<unknown>,
    success: string,
  ): Promise<void> {
    try {
      await action();
      toast.success(success);
      await qc.invalidateQueries({ queryKey: ["customer", id] });
      await qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  if (customerQuery.isPending) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (customerQuery.isError || !customerQuery.data) {
    return <p className="text-destructive">Could not load this customer.</p>;
  }

  const customer = customerQuery.data;
  const locked = isLocked(customer);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {customer.username}
            </h1>
            {customer.disabledAt ? (
              <Badge variant="destructive">Disabled</Badge>
            ) : (
              <Badge variant="secondary">Active</Badge>
            )}
            {locked ? <Badge variant="outline">Locked</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer since {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Button render={<Link href="/customers" />} variant="outline">
            Back to customers
          </Button>
          {canWrite ? (
            <>
              {locked ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    run(() => unlockCustomer(customer.id), "Lockout cleared")
                  }
                >
                  Unlock
                </Button>
              ) : null}
              {customer.disabledAt ? (
                <Button
                  onClick={() =>
                    run(
                      () => enableCustomer(customer.id),
                      `Enabled ${customer.username}`,
                    )
                  }
                >
                  Enable account
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => setConfirmDisable(true)}
                >
                  Disable account
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium break-all">
            {customer.email}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Phone
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium tabular-nums">
            {customer.phone ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contact name
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium">
            {customer.contactName ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium tabular-nums">
            {customer.bookingCount}
          </CardContent>
        </Card>
      </div>

      {canSeeBookings ? (
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Booking history
          </h2>

          {bookingsQuery.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : bookingsQuery.isError || !bookingsQuery.data ? (
            <p className="text-destructive">Could not load bookings.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Return</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingsQuery.data.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-muted-foreground">
                        No bookings yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookingsQuery.data.items.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">
                          <div>{b.vehicle.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {b.vehicle.brand} {b.vehicle.model}
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatDateOnly(b.pickupDate)}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatDateOnly(b.returnDate)}
                        </TableCell>
                        <TableCell>
                          <StatusPill status={b.status} />
                        </TableCell>
                        <TableCell>
                          {b.payment ? (
                            <StatusPill
                              status={b.payment.status}
                              className={
                                b.payment.status === "PAID"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : undefined
                              }
                            />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatMoney(b.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Button
                            render={<Link href={`/bookings/${b.id}`} />}
                            variant="outline"
                            size="sm"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <Pagination
                meta={bookingsQuery.data.meta}
                onPageChange={setPage}
                disabled={bookingsQuery.isFetching}
              />
            </>
          )}
        </div>
      ) : null}

      <AlertDialog open={confirmDisable} onOpenChange={setConfirmDisable}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable {customer.username}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will not be able to sign in with password or Google. Active
              sessions are revoked. You can enable the account again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDisable(false);
                void run(
                  () => disableCustomer(customer.id),
                  `Disabled ${customer.username}`,
                );
              }}
            >
              Disable account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
