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
  approveReview,
  listReviews,
  rejectReview,
  type ReviewStatus,
} from "./api";

const ANY = "__any__";

function statusBadge(status: ReviewStatus) {
  if (status === "APPROVED") return <Badge variant="secondary">Approved</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge>Pending</Badge>;
}

export function ReviewsTable({ roles }: { roles: Role[] }) {
  const qc = useQueryClient();
  const canWrite = hasPermission(roles, "BOOKINGS_WRITE");

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(ANY);

  const query = {
    page,
    status: status === ANY ? undefined : (status as ReviewStatus),
  };

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["reviews", query],
    queryFn: () => listReviews(query),
    placeholderData: keepPreviousData,
  });

  async function run(
    action: () => Promise<unknown>,
    success: string,
  ): Promise<void> {
    try {
      await action();
      toast.success(success);
      await qc.invalidateQueries({ queryKey: ["reviews"] });
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
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : isError ? (
        <p className="text-destructive">Could not load reviews.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No reviews match that filter.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{statusBadge(review.status)}</TableCell>
                    <TableCell className="tabular-nums font-medium">
                      {review.rating}/5
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{review.user.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {review.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {review.vehicle.brand} {review.vehicle.model}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {review.comment ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(review.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          render={<Link href={`/bookings/${review.bookingId}`} />}
                          size="sm"
                          variant="outline"
                        >
                          Booking
                        </Button>
                        {canWrite && review.status !== "APPROVED" ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              run(
                                () => approveReview(review.id),
                                "Review approved — now public",
                              )
                            }
                          >
                            Accept
                          </Button>
                        ) : null}
                        {canWrite && review.status !== "REJECTED" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              run(
                                () => rejectReview(review.id),
                                "Review rejected — hidden from public",
                              )
                            }
                          >
                            Reject
                          </Button>
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
    </div>
  );
}
