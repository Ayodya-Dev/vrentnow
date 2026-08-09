"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Pagination } from "@/components/data/pagination";
import { hasPermission, type Role } from "@/lib/permissions";
import { deleteDeal, listDeals } from "./api";

export function DealsTable({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const qc = useQueryClient();
  const canWrite = hasPermission(roles, "DEALS_WRITE");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["deals", page, appliedQ],
    queryFn: () => listDeals(page, appliedQ || undefined),
    placeholderData: keepPreviousData,
  });

  async function remove(id: string, title: string) {
    try {
      await deleteDeal(id);
      toast.success(`Deleted “${title}”`);
      await qc.invalidateQueries({ queryKey: ["deals"] });
      if (data && data.items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete that deal");
    }
  }

  if (isPending) return <Skeleton className="h-40 w-full" />;
  if (isError) return <p className="text-destructive">Could not load deals.</p>;

  return (
    <div className="space-y-4">
      <form
        className="flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setAppliedQ(q);
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title or code…"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No deals yet.
              </TableCell>
            </TableRow>
          ) : (
            data.items.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">
                  <div>{deal.title}</div>
                  {deal.badge ? (
                    <div className="text-xs text-muted-foreground">{deal.badge}</div>
                  ) : null}
                </TableCell>
                <TableCell>{deal.discountLabel}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {deal.code ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={deal.isActive ? "secondary" : "outline"}>
                    {deal.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="tabular-nums">{deal.sortOrder}</TableCell>
                <TableCell>
                  {canWrite ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={`/deals/${deal.id}`} />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(deal.id, deal.title)}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
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
