"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Pagination } from "@/components/data/pagination";
import { hasPermission, type Role } from "@/lib/permissions";
import {
  disableCustomer,
  enableCustomer,
  isLocked,
  listCustomers,
  unlockCustomer,
  type Customer,
} from "./api";

const ANY = "__any__";

export function CustomersTable({ roles }: { roles: Role[] }) {
  const qc = useQueryClient();
  const router = useRouter();
  const canWrite = hasPermission(roles, "USERS_WRITE");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ANY);
  const [confirmDisable, setConfirmDisable] = useState<Customer | null>(null);

  const query = {
    page,
    search: search.trim() || undefined,
    disabled:
      status === "disabled" ? true : status === "active" ? false : undefined,
  };

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["customers", query],
    queryFn: () => listCustomers(query),
    placeholderData: keepPreviousData,
  });

  async function run(
    action: () => Promise<unknown>,
    success: string,
  ): Promise<void> {
    try {
      await action();
      toast.success(success);
      await qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  async function confirmDisableAction() {
    if (!confirmDisable) return;
    const customer = confirmDisable;
    setConfirmDisable(null);
    await run(
      () => disableCustomer(customer.id),
      `Disabled ${customer.username}`,
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search name, email, or phone"
          value={search}
          aria-label="Search customers"
          onChange={(e) => {
            setSearch(e.target.value);
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
          <SelectTrigger className="w-44" aria-label="Filter by status">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : isError ? (
        <p className="text-destructive">Could not load customers.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No customers match that search.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((customer) => {
                  const locked = isLocked(customer);
                  return (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div>{customer.username}</div>
                        {customer.contactName &&
                        customer.contactName !== customer.username ? (
                          <div className="text-xs text-muted-foreground">
                            {customer.contactName}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {customer.disabledAt ? (
                            <Badge variant="destructive">Disabled</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                          {locked ? (
                            <Badge variant="outline">Locked</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {customer.phone ?? "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {customer.bookingCount}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {canWrite ? (
                          <div className="flex justify-end gap-2">
                            {customer.disabledAt ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  run(
                                    () => enableCustomer(customer.id),
                                    `Enabled ${customer.username}`,
                                  )
                                }
                              >
                                Enable
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirmDisable(customer)}
                              >
                                Disable
                              </Button>
                            )}
                            {locked ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  run(
                                    () => unlockCustomer(customer.id),
                                    `Unlocked ${customer.username}`,
                                  )
                                }
                              >
                                Unlock
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <Pagination
            meta={data.meta}
            onPageChange={setPage}
            disabled={isFetching}
          />
        </>
      )}

      <AlertDialog
        open={confirmDisable !== null}
        onOpenChange={(open) => !open && setConfirmDisable(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Disable {confirmDisable?.username}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will not be able to sign in with password or Google. Active
              sessions are revoked. You can enable the account again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDisableAction}>
              Disable account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
