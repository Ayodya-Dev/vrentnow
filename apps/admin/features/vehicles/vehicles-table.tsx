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
import { listCategories } from "@/features/categories/api";
import {
  deleteVehicle,
  listVehicles,
  STATUS_OPTIONS,
  type VehicleStatus,
} from "./api";

const ANY = "__any__";

function formatPrice(price: string | number): string {
  const n = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(n)) return String(price);
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(n);
}

function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "AVAILABLE":
      return "default";
    case "RENTED":
      return "secondary";
    case "MAINTENANCE":
      return "outline";
    case "INACTIVE":
      return "destructive";
    default:
      return "secondary";
  }
}

export function VehiclesTable({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const qc = useQueryClient();
  const canWrite = hasPermission(roles, "VEHICLES_WRITE");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState(ANY);
  const [status, setStatus] = useState(ANY);

  const { data: categoriesPage } = useQuery({
    queryKey: ["categories", "picker"],
    queryFn: () => listCategories(1, undefined, 100),
  });
  const categories = categoriesPage?.items ?? [];

  const query = {
    page,
    q: q.trim() || undefined,
    categoryId: categoryId === ANY ? undefined : categoryId,
    status: status === ANY ? undefined : (status as VehicleStatus),
  };

  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ["vehicles", query],
    queryFn: () => listVehicles(query),
    placeholderData: keepPreviousData,
  });

  async function remove(id: string, name: string) {
    try {
      await deleteVehicle(id);
      toast.success(`Deleted “${name}”`);
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
      if (data && data.items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete that vehicle");
    }
  }

  if (isPending) return <Skeleton className="h-40 w-full" />;
  if (isError) return <p className="text-destructive">Could not load vehicles.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search name, brand, model…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={categoryId}
          onValueChange={(v) => {
            setCategoryId(v ?? ANY);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44" aria-label="Filter by category">
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any category</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v ?? ANY);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any status</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price / day</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                No vehicles yet.
              </TableCell>
            </TableRow>
          ) : (
            data.items.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className="font-medium">{v.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {v.brand} {v.model} · {v.year}
                  </div>
                </TableCell>
                <TableCell>{v.category?.name ?? "—"}</TableCell>
                <TableCell>{formatPrice(v.pricePerDay)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(v.status)}>{v.status}</Badge>
                </TableCell>
                <TableCell>
                  {canWrite ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={`/vehicles/${v.id}`} />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(v.id, v.name)}
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
