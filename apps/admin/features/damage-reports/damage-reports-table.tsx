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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Pagination } from "@/components/data/pagination";
import { hasPermission, type Role } from "@/lib/permissions";
import {
  listDamageReports,
  reopenDamageReport,
  resolveDamageReport,
  type DamageReport,
} from "./api";

const ANY = "__any__";

export function DamageReportsTable({ roles }: { roles: Role[] }) {
  const qc = useQueryClient();
  const canWrite = hasPermission(roles, "BOOKINGS_WRITE");

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(ANY);
  const [viewing, setViewing] = useState<DamageReport | null>(null);

  const query = {
    page,
    resolved:
      status === "resolved" ? true : status === "open" ? false : undefined,
  };

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["damage-reports", query],
    queryFn: () => listDamageReports(query),
    placeholderData: keepPreviousData,
  });

  async function run(
    action: () => Promise<unknown>,
    success: string,
  ): Promise<void> {
    try {
      await action();
      toast.success(success);
      await qc.invalidateQueries({ queryKey: ["damage-reports"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : isError ? (
        <p className="text-destructive">Could not load damage reports.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No damage reports match that filter.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((report) => (
                  <TableRow
                    key={report.id}
                    className="cursor-pointer"
                    onClick={() => setViewing(report)}
                  >
                    <TableCell>
                      {report.resolvedAt ? (
                        <Badge variant="secondary">Resolved</Badge>
                      ) : (
                        <Badge>Open</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{report.user.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {report.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.booking.vehicle.brand}{" "}
                      {report.booking.vehicle.model}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(report.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          render={<Link href={`/bookings/${report.bookingId}`} />}
                          size="sm"
                          variant="outline"
                        >
                          Booking
                        </Button>
                        {canWrite ? (
                          report.resolvedAt ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                run(
                                  () => reopenDamageReport(report.id),
                                  "Report reopened",
                                )
                              }
                            >
                              Reopen
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                run(
                                  () => resolveDamageReport(report.id),
                                  "Report resolved",
                                )
                              }
                            >
                              Resolve
                            </Button>
                          )
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewing
                ? `${viewing.booking.vehicle.brand} ${viewing.booking.vehicle.model}`
                : "Damage report"}
            </DialogTitle>
            <DialogDescription>
              {viewing
                ? `${viewing.user.username} · ${new Date(viewing.createdAt).toLocaleString()}`
                : null}
            </DialogDescription>
          </DialogHeader>
          <p className="max-h-72 overflow-y-auto text-sm whitespace-pre-wrap">
            {viewing?.description}
          </p>
          <DialogFooter>
            {viewing ? (
              <Button
                render={<Link href={`/bookings/${viewing.bookingId}`} />}
                variant="outline"
              >
                Open booking
              </Button>
            ) : null}
            <Button onClick={() => setViewing(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
